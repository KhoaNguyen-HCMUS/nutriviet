import fetch from 'node-fetch';
import FormData from 'form-data';
import { PrismaClient } from '../generated/prisma';
import { GoogleGenerativeAI } from '@google/generative-ai'; // Import thư viện Gemini

const prisma = new PrismaClient();
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000/predict-food101';
const USDA_API_KEY = process.env.USDA_API_KEY || 'tJdjHWVRQRXrvUeerdUgdqAdfOntOEHnEUJGEXV4';
const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1';

// --- START: LOGIC DỊCH THUẬT DÙNG GEMINI (OPTIMIZED) ---

// Khởi tạo Gemini AI client với API Key từ .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Cache cho dịch thuật để tránh gọi API lặp lại
const translationCache = new Map<string, string>();

// Cấu hình cho batch translation
const BATCH_SIZE = 10;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

/**
 * Dịch một đoạn văn bản từ tiếng Anh sang tiếng Việt bằng Gemini với cache.
 * @param text Văn bản cần dịch.
 * @returns Văn bản đã được dịch hoặc văn bản gốc nếu có lỗi.
 */
async function translateText(text: string): Promise<string> {
  if (!text || typeof text !== 'string' || text.trim() === '') {
    return text;
  }

  const trimmedText = text.trim();

  // Kiểm tra cache trước
  if (translationCache.has(trimmedText)) {
    return translationCache.get(trimmedText)!;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const prompt = `Translate the following English text to Vietnamese, provide only the Vietnamese translation and nothing else:\n\n"${trimmedText}"`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const translation = response.text().replace(/"/g, '').trim();

    // Lưu vào cache
    translationCache.set(trimmedText, translation);
    return translation;
  } catch (error) {
    console.error(`❌ Lỗi khi dịch văn bản bằng Gemini: "${trimmedText}"`, error);
    return trimmedText; // Trả về văn bản gốc nếu có lỗi
  }
}

/**
 * Dịch nhiều văn bản cùng lúc để tối ưu hiệu suất.
 * @param texts Mảng các văn bản cần dịch.
 * @returns Mảng các văn bản đã được dịch.
 */
async function translateTextsBatch(texts: string[]): Promise<string[]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  // Lọc ra những text chưa có trong cache
  const textsToTranslate: string[] = [];
  const results: string[] = new Array(texts.length);

  texts.forEach((text, index) => {
    if (!text || typeof text !== 'string' || text.trim() === '') {
      results[index] = text;
    } else {
      const trimmedText = text.trim();
      if (translationCache.has(trimmedText)) {
        results[index] = translationCache.get(trimmedText)!;
      } else {
        textsToTranslate.push(trimmedText);
      }
    }
  });

  if (textsToTranslate.length === 0) {
    return results;
  }

  // Chia thành các batch nhỏ để tránh quá tải API
  const batches: string[][] = [];
  for (let i = 0; i < textsToTranslate.length; i += BATCH_SIZE) {
    batches.push(textsToTranslate.slice(i, i + BATCH_SIZE));
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    for (const batch of batches) {
      const batchText = batch.join('\n---SEPARATOR---\n');
      const prompt = `Translate the following English texts to Vietnamese. Each text is separated by "---SEPARATOR---". Provide only the Vietnamese translations in the same order, each on a new line:\n\n${batchText}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const rawTranslations = response.text().split('\n');

      // Lọc bỏ các dòng trống và xử lý translations
      const translations = rawTranslations
        .filter((t) => t.trim() !== '')
        .map((t) => t.replace(/"/g, '').trim())
        .filter((t) => t !== '---SEPARATOR---' && t !== '');

      // Lưu vào cache và cập nhật kết quả
      batch.forEach((originalText, batchIndex) => {
        let translation = translations[batchIndex];

        // Nếu không có translation hoặc bị lỗi, fallback về original text
        if (!translation || translation === '---SEPARATOR---' || translation === '') {
          translation = originalText;
        }

        translationCache.set(originalText, translation);

        // Tìm vị trí trong mảng gốc và cập nhật kết quả
        const originalIndex = texts.findIndex((t) => t && t.trim() === originalText);
        if (originalIndex !== -1) {
          results[originalIndex] = translation;
        }
      });
    }
  } catch (error) {
    console.error('❌ Lỗi khi dịch batch:', error);
    // Fallback: dịch từng text riêng lẻ
    for (let i = 0; i < textsToTranslate.length; i++) {
      const originalText = textsToTranslate[i];
      try {
        const translation = await translateText(originalText);
        results[texts.findIndex((t) => t && t.trim() === originalText)] = translation;
      } catch (fallbackError) {
        console.error(`❌ Fallback translation failed for: "${originalText}"`, fallbackError);
        results[texts.findIndex((t) => t && t.trim() === originalText)] = originalText;
      }
    }
  }

  return results;
}

/**
 * Dịch một object với retry logic.
 * @param obj Object chứa các thuộc tính cần dịch.
 * @param keysToTranslate Các key cần dịch.
 * @returns Object đã được dịch.
 */
async function translateObjectWithRetry<T extends Record<string, any>>(
  obj: T,
  keysToTranslate: (keyof T)[]
): Promise<T> {
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const textsToTranslate = keysToTranslate.map((key) => obj[key] as string);
      const translations = await translateTextsBatch(textsToTranslate);

      const result = { ...obj };
      keysToTranslate.forEach((key, index) => {
        result[key] = translations[index] as T[keyof T];
      });

      return result;
    } catch (error) {
      retries++;
      console.error(`❌ Translation retry ${retries}/${MAX_RETRIES}:`, error);

      if (retries < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * retries));
      } else {
        console.error('❌ Max retries reached, returning original object');
        return obj;
      }
    }
  }

  return obj;
}

/**
 * Dịch toàn bộ object response trước khi trả về
 * @param responseObj Object response cần dịch
 * @returns Object đã được dịch
 */
async function translateResponseObject(responseObj: any): Promise<any> {
  if (!responseObj || typeof responseObj !== 'object') {
    return responseObj;
  }

  const translatedObj = { ...responseObj };

  // Dịch các field cần thiết trong response
  if (translatedObj.predictions && typeof translatedObj.predictions === 'object') {
    const predictionKeys = Object.keys(translatedObj.predictions);
    const translatedKeys = await translateTextsBatch(predictionKeys);

    const newPredictions: any = {};
    predictionKeys.forEach((key, index) => {
      newPredictions[translatedKeys[index]] = translatedObj.predictions[key];
    });
    translatedObj.predictions = newPredictions;
  }

  if (translatedObj.top_prediction && typeof translatedObj.top_prediction === 'string') {
    translatedObj.top_prediction = await translateText(translatedObj.top_prediction);
  }

  if (translatedObj.nutrition && Array.isArray(translatedObj.nutrition)) {
    const nutritionTexts = translatedObj.nutrition.map((item: any) => item.description || '');
    const nutritionCategories = translatedObj.nutrition.map((item: any) => item.category || '');

    const translatedDescriptions = await translateTextsBatch(nutritionTexts);
    const translatedCategories = await translateTextsBatch(nutritionCategories);

    translatedObj.nutrition = translatedObj.nutrition.map((item: any, index: number) => ({
      ...item,
      description: translatedDescriptions[index] || item.description,
      category: translatedCategories[index] || item.category,
    }));
  }

  if (translatedObj.data) {
    // Dịch food detail response
    if (translatedObj.data.name) {
      translatedObj.data.name = await translateText(translatedObj.data.name);
    }
    if (translatedObj.data.category) {
      translatedObj.data.category = await translateText(translatedObj.data.category);
    }
    if (translatedObj.data.portions && Array.isArray(translatedObj.data.portions)) {
      const portionDescriptions = translatedObj.data.portions.map((p: any) => p.description || '');
      const translatedPortionDescriptions = await translateTextsBatch(portionDescriptions);

      translatedObj.data.portions = translatedObj.data.portions.map((portion: any, index: number) => ({
        ...portion,
        description: translatedPortionDescriptions[index] || portion.description,
      }));
    }
  }

  return translatedObj;
}

/**
 * Dịch toàn bộ request object khi nhận vào
 * @param requestObj Object request cần dịch
 * @returns Object đã được dịch
 */
async function translateRequestObject(requestObj: any): Promise<any> {
  if (!requestObj || typeof requestObj !== 'object') {
    return requestObj;
  }

  const translatedObj = { ...requestObj };

  // Dịch các field trong request nếu cần
  if (translatedObj.keywords && typeof translatedObj.keywords === 'string') {
    translatedObj.keywords = await translateText(translatedObj.keywords);
  }

  return translatedObj;
}

// --- END: LOGIC DỊCH THUẬT (OPTIMIZED) ---

// Define types
interface MLServiceResponse {
  top5: Record<string, number>;
}

interface USDANutrient {
  nutrientName: string;
  unitName: string;
  value: number;
}

interface USDAPortion {
  modifier: string;
  gramWeight: number;
}

interface USDAFood {
  description: string;
  fdcId: number;
  dataType?: string;
  foodCategory?: string;
  foodNutrients?: USDANutrient[];
  foodPortions?: USDAPortion[];
}

interface USDASearchResponse {
  foods?: USDAFood[];
}

// Transform ML labels to USDA-friendly search terms
function transformFoodLabel(label: string): string {
  return label
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to get nutrition data with optional keywords
async function getNutritionData(foodLabel: string, keywords: string = '', limit = 5) {
  if (!USDA_API_KEY) {
    console.warn('⚠️ USDA API key not configured, skipping nutrition lookup');
    return [];
  }

  // Helper to fetch by datatype
  async function fetchByDataType(dataTypes: string[]) {
    const baseTerm = transformFoodLabel(foodLabel);

    let searchTerm = baseTerm;
    if (keywords && keywords.trim()) {
      const keywordList = keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);
      searchTerm = [baseTerm, ...keywordList].join(' ');
    }

    const url = `${USDA_BASE}/foods/search?query=${encodeURIComponent(
      searchTerm
    )}&pageSize=${limit}&dataType=${dataTypes.join(',')}&api_key=${USDA_API_KEY}`;

    const response = await fetch(url);
    if (!response.ok) {
      console.error(`❌ USDA API error [${dataTypes.join(',')}]: ${response.status}`);
      return [];
    }

    const data = (await response.json()) as USDASearchResponse;
    return data.foods || [];
  }

  try {
    let foods: USDAFood[] = [];

    const priorityGroups = [['Survey (FNDDS)'], ['SR Legacy'], ['Branded'], ['Foundation']];

    for (const group of priorityGroups) {
      foods = await fetchByDataType(group);
      if (foods.length > 0) {
        break;
      }
    }

    if (foods.length === 0 && keywords && keywords.trim()) {
      const baseTerm = transformFoodLabel(foodLabel);

      for (const group of priorityGroups) {
        const url = `${USDA_BASE}/foods/search?query=${encodeURIComponent(
          baseTerm
        )}&pageSize=${limit}&dataType=${group.join(',')}&api_key=${USDA_API_KEY}`;

        const response = await fetch(url);
        if (response.ok) {
          const data = (await response.json()) as USDASearchResponse;
          if (data.foods && data.foods.length > 0) {
            foods = data.foods;
            break;
          }
        }
      }
    }

    return foods.map((food) => ({
      fdcId: food.fdcId,
      description: food.description,
      category: food.foodCategory || food.dataType || 'Unknown',
    }));
  } catch (error) {
    console.error('❌ USDA API exception:', error);
    return [];
  }
}

export class FoodController {
  static async classifyFood(req: any, res: any) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const userId = req.user?.id;
      const userEmail = req.user?.email;
      const keywords = req.query.keywords || '';

      // 1. Dịch request keywords nếu có
      const translatedKeywords = keywords ? await translateText(keywords) : '';

      // 2. Get ML prediction
      const formData = new FormData();
      formData.append('file', req.file.buffer, { filename: req.file.originalname });

      const mlResp = await fetch(ML_SERVICE_URL, { method: 'POST', body: formData as any });
      if (!mlResp.ok) {
        console.error(`❌ ML Service error: ${mlResp.status}`);
        return res.status(503).json({ error: 'ML service unavailable' });
      }

      const mlData = (await mlResp.json()) as MLServiceResponse;

      const topLabel = Object.entries(mlData.top5).sort(([, a], [, b]) => Number(b) - Number(a))[0][0];

      // 3. Get nutrition data from USDA
      const nutritionData = await getNutritionData(topLabel, translatedKeywords);

      // 4. Tạo response object
      const responseObj = {
        success: true,
        predictions: mlData.top5,
        top_prediction: transformFoodLabel(topLabel),
        nutrition: nutritionData,
        user: userId
          ? {
              isAuthenticated: true,
              email: userEmail,
            }
          : {
              isAuthenticated: false,
              message: 'Đăng nhập để xem lịch sử và lưu bữa ăn của bạn',
            },
      };

      // 5. Dịch toàn bộ response trước khi trả về
      const translatedResponse = await translateResponseObject(responseObj);
      return res.json(translatedResponse);
    } catch (err) {
      console.error('❌ Food classification error:', err);
      return res.status(500).json({
        error: 'Server error',
        message: process.env.NODE_ENV === 'development' ? (err as Error).message : undefined,
      });
    }
  }

  static async getFoodDetail(req: any, res: any) {
    try {
      const { fdcId } = req.body;

      if (!fdcId) {
        return res.status(400).json({ error: 'Missing required field: fdcId' });
      }

      const url = `${USDA_BASE}/food/${fdcId}?api_key=${USDA_API_KEY}`;
      const response = await fetch(url);

      if (!response.ok) {
        return res.status(502).json({ error: 'Failed to fetch food details from USDA' });
      }

      const food = (await response.json()) as any;
      const nutrients = food.foodNutrients || [];

      const kcalNutrient = nutrients.find((n: any) => n.nutrient?.name === 'Energy' && n.nutrient?.unitName === 'kcal');
      const kcal100 = kcalNutrient?.amount || 0;
      const proteinNutrient = nutrients.find((n: any) => n.nutrient?.name === 'Protein');
      const protein100 = proteinNutrient?.amount || 0;
      const carbsNutrient = nutrients.find((n: any) => n.nutrient?.name === 'Carbohydrate, by difference');
      const carbs100 = carbsNutrient?.amount || 0;
      const fatNutrient = nutrients.find((n: any) => n.nutrient?.name === 'Total lipid (fat)');
      const fat100 = fatNutrient?.amount || 0;

      // Tạo portions data
      const portions = (food.foodPortions || []).map((p: any) => {
        const grams = p.gramWeight || 100;
        const multiplier = grams / 100;

        return {
          id: p.id || 0,
          description: p.portionDescription || p.modifier || 'Unknown portion',
          gramWeight: grams,
          nutrition: {
            kcal: Math.round(kcal100 * multiplier),
            protein: Math.round(protein100 * multiplier * 10) / 10,
            carbs: Math.round(carbs100 * multiplier * 10) / 10,
            fat: Math.round(fat100 * multiplier * 10) / 10,
          },
        };
      });

      // Thêm portion 100g mặc định nếu chưa có
      if (!portions.some((p: any) => p.gramWeight === 100)) {
        portions.unshift({
          id: -1,
          description: '100 g (mặc định)',
          gramWeight: 100,
          nutrition: {
            kcal: Math.round(kcal100),
            protein: Math.round(protein100 * 10) / 10,
            carbs: Math.round(carbs100 * 10) / 10,
            fat: Math.round(fat100 * 10) / 10,
          },
        });
      }

      // Tạo response object
      const responseObj = {
        success: true,
        data: {
          fdcId: food.fdcId,
          name: food.description,
          category: food.foodCategory || food.dataType,
          nutrientsPer100g: {
            kcal: Math.round(kcal100),
            protein: Math.round(protein100 * 10) / 10,
            carbs: Math.round(carbs100 * 10) / 10,
            fat: Math.round(fat100 * 10) / 10,
          },
          portions: portions,
        },
      };

      // Dịch toàn bộ response trước khi trả về
      const translatedResponse = await translateResponseObject(responseObj);
      return res.json(translatedResponse);
    } catch (err) {
      return res.status(500).json({
        error: 'Server error',
        message: (err as Error).message,
      });
    }
  }

  static async logSelectedFood(req: any, res: any) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User must be logged in to log food',
        });
      }

      const { fdcId, portionId, confirmConsumption = false } = req.body;

      if (!confirmConsumption) {
        return res.status(400).json({
          error: 'Consumption confirmation required',
          message: 'Set confirmConsumption: true to log food as consumed',
        });
      }

      if (!fdcId || portionId == null) {
        return res.status(400).json({
          error: 'Missing required fields',
          required: ['fdcId', 'portionId'],
        });
      }

      const url = `${USDA_BASE}/food/${fdcId}?api_key=${USDA_API_KEY}`;
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(502).json({ error: 'Failed to fetch food details from USDA' });
      }
      const food = (await response.json()) as any;

      const nutrients = food.foodNutrients || [];
      const kcalNutrient = nutrients.find((n: any) => n.nutrient?.name === 'Energy' && n.nutrient?.unitName === 'kcal');
      const kcal = kcalNutrient?.amount || 0;
      const proteinNutrient = nutrients.find((n: any) => n.nutrient?.name === 'Protein');
      const protein = proteinNutrient?.amount || 0;
      const carbsNutrient = nutrients.find((n: any) => n.nutrient?.name === 'Carbohydrate, by difference');
      const carbs = carbsNutrient?.amount || 0;
      const fatNutrient = nutrients.find((n: any) => n.nutrient?.name === 'Total lipid (fat)');
      const fat = fatNutrient?.amount || 0;

      const portions = food.foodPortions || [];
      const selectedPortion = portions.find((p: any) => p.id === portionId);

      let portionGrams: number;
      let portionDescription: string;

      if (selectedPortion) {
        portionGrams = selectedPortion.gramWeight;
        portionDescription = selectedPortion.portionDescription || selectedPortion.modifier || 'Unknown portion';
      } else if (portionId === -1) {
        portionGrams = 100;
        portionDescription = '100g';
      } else {
        return res.status(404).json({ error: 'Portion not found' });
      }

      const portionMultiplier = portionGrams / 100;
      const actualKcal = Math.round(kcal * portionMultiplier);
      const actualProtein = Math.round(protein * portionMultiplier * 10) / 10;
      const actualCarbs = Math.round(carbs * portionMultiplier * 10) / 10;
      const actualFat = Math.round(fat * portionMultiplier * 10) / 10;

      const result = await prisma.$transaction(async (tx) => {
        let foodEntry = await tx.foods.findFirst({
          where: { name: food.description },
        });

        if (!foodEntry) {
          foodEntry = await tx.foods.create({
            data: {
              name: food.description,
              kcal_100g: kcal,
              protein_100g: protein,
              carbs_100g: carbs,
              fat_100g: fat,
              brand: food.foodCategory || food.dataType || null,
            },
          });
        }

        const foodLog = await tx.user_food_logs.create({
          data: {
            user_id: BigInt(userId),
            food_id: foodEntry.id,
            name: food.description,
            qty_grams: portionGrams,
            kcal_snapshot: actualKcal,
            protein_snapshot: actualProtein,
            carbs_snapshot: actualCarbs,
            fat_snapshot: actualFat,
          },
        });

        return {
          food: foodEntry,
          foodLog,
          nutrition: { actualKcal, actualProtein, actualCarbs, actualFat, portionGrams, portionDescription },
        };
      });

      return res.json({
        success: true,
        message: 'Food consumption logged successfully',
        data: {
          food: {
            id: result.food.id.toString(),
            name: result.food.name,
            fdcId: fdcId,
            kcal_100g: Number(result.food.kcal_100g),
            protein_100g: Number(result.food.protein_100g),
            carbs_100g: Number(result.food.carbs_100g),
            fat_100g: Number(result.food.fat_100g),
          },
          log: {
            id: result.foodLog.id.toString(),
            portionGrams: Number(result.foodLog.qty_grams),
            portionDescription: portionDescription,
            loggedAt: result.foodLog.created_at,
          },
          nutrition: result.nutrition,
        },
      });
    } catch (err) {
      console.error('❌ Food logging error:', err);
      return res.status(500).json({
        error: 'Server error',
        message: process.env.NODE_ENV === 'development' ? (err as Error).message : undefined,
      });
    }
  }

  static async getUserFoodHistory(req: any, res: any) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'User must be logged in to view food history',
        });
      }

      const { limit = 20, days = 30 } = req.query;
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days as string));

      const recentLogs = await prisma.user_food_logs.findMany({
        where: { user_id: BigInt(userId), created_at: { gte: daysAgo } },
        include: {
          foods: { select: { name: true, kcal_100g: true, protein_100g: true, carbs_100g: true, fat_100g: true } },
          meals: { select: { type: true, date_time: true } },
        },
        orderBy: { created_at: 'desc' },
        take: parseInt(limit as string),
      });

      const foodSummary = await prisma.user_food_summary.findMany({
        where: { user_id: BigInt(userId) },
        include: {
          foods: { select: { name: true, kcal_100g: true, protein_100g: true, carbs_100g: true, fat_100g: true } },
        },
        orderBy: [{ times_eaten: 'desc' }, { last_eaten_at: 'desc' }],
        take: 10,
      });

      const totalLogs = recentLogs.length;
      const totalKcal = recentLogs.reduce((sum, log) => sum + Number(log.kcal_snapshot || 0), 0);
      const totalProtein = recentLogs.reduce((sum, log) => sum + Number(log.protein_snapshot || 0), 0);
      const totalCarbs = recentLogs.reduce((sum, log) => sum + Number(log.carbs_snapshot || 0), 0);
      const totalFat = recentLogs.reduce((sum, log) => sum + Number(log.fat_snapshot || 0), 0);

      const stats = {
        totalLogsInPeriod: totalLogs,
        dailyAverages: {
          kcal: totalLogs > 0 ? Math.round(totalKcal / Math.min(parseInt(days as string), totalLogs)) : 0,
          protein: totalLogs > 0 ? Math.round(totalProtein / Math.min(parseInt(days as string), totalLogs)) : 0,
          carbs: totalLogs > 0 ? Math.round(totalCarbs / Math.min(parseInt(days as string), totalLogs)) : 0,
          fat: totalLogs > 0 ? Math.round(totalFat / Math.min(parseInt(days as string), totalLogs)) : 0,
        },
      };

      return res.json({
        success: true,
        data: {
          recentLogs: recentLogs.map((log) => ({
            id: log.id.toString(),
            foodName: log.foods.name,
            portionGrams: Number(log.qty_grams),
            nutrition: {
              kcal: Number(log.kcal_snapshot || 0),
              protein: Number(log.protein_snapshot || 0),
              carbs: Number(log.carbs_snapshot || 0),
              fat: Number(log.fat_snapshot || 0),
            },
            mealType: log.meals?.type || 'general',
            loggedAt: log.created_at,
            mealTime: log.meals?.date_time,
          })),
          favoriteFood: foodSummary.map((summary) => ({
            foodName: summary.foods.name,
            timesEaten: summary.times_eaten,
            totalGrams: Number(summary.total_grams),
            avgPortionGrams: Number(summary.avg_portion_grams || 0),
            firstEaten: summary.first_eaten_at,
            lastEaten: summary.last_eaten_at,
          })),
          stats,
        },
      });
    } catch (err) {
      console.error('❌ Food history error:', err);
      return res.status(500).json({
        error: 'Server error',
        message: process.env.NODE_ENV === 'development' ? (err as Error).message : undefined,
      });
    }
  }
}
