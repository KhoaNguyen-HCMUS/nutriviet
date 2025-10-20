import type { Request, Response } from "express";
import { Prisma } from "../generated/prisma";
import prisma from "../../prisma/client";
import NodeCache from "node-cache";

const toNum = (d?: Prisma.Decimal | number | null, def = 0) =>
  d == null ? def : Number(d);

// NodeCache instance for dashboard responses (30 min TTL)
const dashboardCache = new NodeCache({ stdTTL: 30 * 60 });

export class DashboardController {
  static async getDashboard(req: Request, res: Response) {
    try {
      const user_id = (req as any).userId as bigint;

      // Get user profile for BMI, goals, and targets
      const profile = await prisma.profiles.findUnique({
        where: { user_id },
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: "Profile not found. Please complete your profile first.",
        });
      }

      // Check cache
      const cacheKey = user_id.toString();
      const cached = dashboardCache.get(cacheKey);
      if (cached) {
        console.log(`[Dashboard] Using node-cache for user ${cacheKey}`);
        return res.json(cached);
      }
      // Calculate date ranges
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);

      // Get this week's start (Monday)
      const weekStart = new Date(now);
      const dayOfWeek = weekStart.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      weekStart.setDate(weekStart.getDate() + diff);
      weekStart.setHours(0, 0, 0, 0);

      // Get last week's data for comparison
      const lastWeekStart = new Date(weekStart);
      lastWeekStart.setDate(lastWeekStart.getDate() - 7);
      const lastWeekEnd = new Date(weekStart);
      lastWeekEnd.setMilliseconds(-1);

      // --- HEALTH SNAPSHOT ---
      const bmi = toNum(profile.bmi);
      const currentWeight = toNum(profile.weight_kg);
      const goal = profile.goal || "maintain";

      // Get weight from last week for comparison
      const lastWeekLogs = await prisma.user_food_logs.findFirst({
        where: {
          user_id,
          created_at: {
            gte: lastWeekStart,
            lte: lastWeekEnd,
          },
        },
        orderBy: { created_at: "desc" },
      });

      // For demo, calculate weekly change (in real app, track weight_logs table)
      const lastWeekWeight = currentWeight; // Should get from weight_logs table
      const weightChange = currentWeight - lastWeekWeight;

      // Calculate BMI status
      let bmiStatus = "Normal";
      if (bmi < 18.5) bmiStatus = "Underweight";
      else if (bmi >= 25 && bmi < 30) bmiStatus = "Overweight";
      else if (bmi >= 30) bmiStatus = "Obese";

      // --- TODAY'S PROGRESS ---
      const todayLogs = await prisma.user_food_logs.findMany({
        where: {
          user_id,
          created_at: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
      });

      const todayNutrition = {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
      };

      todayLogs.forEach((log) => {
        todayNutrition.calories += toNum(log.kcal_snapshot);
        todayNutrition.protein += toNum(log.protein_snapshot);
        todayNutrition.carbs += toNum(log.carbs_snapshot);
        todayNutrition.fat += toNum(log.fat_snapshot);
      });

      // Get target nutrition from profile
      const tdee = toNum(profile.tdee, 2000);
      let calorieTarget = tdee;

      // Adjust based on goal
      if (goal === "lose") calorieTarget = tdee * 0.8;
      else if (goal === "gain") calorieTarget = tdee * 1.2;

      const proteinTarget = (calorieTarget * 0.3) / 4;
      const carbsTarget = (calorieTarget * 0.4) / 4;
      const fatTarget = (calorieTarget * 0.3) / 9;

      // --- TODAY'S MEALS (from user_food_logs) ---
      const logs = await prisma.user_food_logs.findMany({
        where: {
          user_id,
          created_at: {
            gte: todayStart,
            lte: todayEnd,
          },
        },
        include: {
          foods: true,
        },
        orderBy: { created_at: "asc" },
      });

      // Helper: assign meal type by time
      function getMealType(date: Date) {
        const hour = date.getHours();
        if (hour >= 5 && hour < 11) return "breakfast";
        if (hour >= 11 && hour < 15) return "lunch";
        if (hour >= 17 && hour < 23) return "dinner";
        return "snack";
      }

      // Group logs by meal type
      const groupedMeals: Record<string, any[]> = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
      };

      logs.forEach((log) => {
        const mealType = getMealType(new Date(log.created_at));
        groupedMeals[mealType].push({
          name: log.foods.name,
          time: log.created_at,
          kcal: toNum(log.kcal_snapshot),
          protein: toNum(log.protein_snapshot),
          carb: toNum(log.carbs_snapshot),
          fat: toNum(log.fat_snapshot),
        });
      });

      // Format meals for response
      const formattedMeals = {
        breakfast: {
          items: groupedMeals.breakfast.length,
          totalCalories: groupedMeals.breakfast.reduce((sum, m) => sum + m.kcal, 0),
          meals: groupedMeals.breakfast,
        },
        lunch: {
          items: groupedMeals.lunch.length,
          totalCalories: groupedMeals.lunch.reduce((sum, m) => sum + m.kcal, 0),
          meals: groupedMeals.lunch,
        },
        dinner: {
          items: groupedMeals.dinner.length,
          totalCalories: groupedMeals.dinner.reduce((sum, m) => sum + m.kcal, 0),
          meals: groupedMeals.dinner,
        },
        snack: {
          items: groupedMeals.snack.length,
          totalCalories: groupedMeals.snack.reduce((sum, m) => sum + m.kcal, 0),
          meals: groupedMeals.snack,
        },
      };

      // --- TRENDS & ANALYTICS (Last 7 days) ---
      const last7Days = [];
      const dailyData: any = {};

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStart = new Date(date);
        dateStart.setHours(0, 0, 0, 0);
        const dateEnd = new Date(date);
        dateEnd.setHours(23, 59, 59, 999);

        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        last7Days.push(dayName);

        const dayLogs = await prisma.user_food_logs.findMany({
          where: {
            user_id,
            created_at: {
              gte: dateStart,
              lte: dateEnd,
            },
          },
        });

        const dayCalories = dayLogs.reduce(
          (sum, log) => sum + toNum(log.kcal_snapshot),
          0
        );
        const dayProtein = dayLogs.reduce(
          (sum, log) => sum + toNum(log.protein_snapshot),
          0
        );
        const dayCarbs = dayLogs.reduce(
          (sum, log) => sum + toNum(log.carbs_snapshot),
          0
        );
        const dayFat = dayLogs.reduce(
          (sum, log) => sum + toNum(log.fat_snapshot),
          0
        );

        dailyData[dayName] = {
          calories: Math.round(dayCalories),
          protein: Math.round(dayProtein),
          carbs: Math.round(dayCarbs),
          fat: Math.round(dayFat),
        };
      }

      // Calculate week statistics
      const weekCalories = Object.values(dailyData).reduce(
        (sum: number, day: any) => sum + day.calories,
        0
      );
      const avgCalories = Math.round(weekCalories / 7);
      const peakCalories = Math.max(
        ...Object.values(dailyData).map((day: any) => day.calories)
      );
      const lowCalories = Math.min(
        ...Object.values(dailyData).map((day: any) => day.calories || 0)
      );

      // --- BUILD RESPONSE ---
      const response = {
        success: true,
        data: {
          healthSnapshot: {
            bmi: {
              value: bmi.toFixed(1),
              status: bmiStatus,
            },
            currentWeight: {
              value: currentWeight.toFixed(1),
              unit: "kg",
            },
            goal: {
              type: goal,
              label:
                goal === "lose"
                  ? "Lose Weight"
                  : goal === "gain"
                  ? "Gain Weight"
                  : "Maintain Weight",
            },
            thisWeek: {
              change: weightChange.toFixed(1),
              unit: "kg",
            },
          },
          todaysProgress: {
            calories: {
              current: Math.round(todayNutrition.calories),
              target: Math.round(calorieTarget),
              percentage: Math.round(
                (todayNutrition.calories / calorieTarget) * 100
              ),
              remaining: Math.round(calorieTarget - todayNutrition.calories),
            },
            protein: {
              current: Math.round(todayNutrition.protein),
              target: Math.round(proteinTarget),
              percentage: Math.round(
                (todayNutrition.protein / proteinTarget) * 100
              ),
            },
            carbohydrates: {
              current: Math.round(todayNutrition.carbs),
              target: Math.round(carbsTarget),
              percentage: Math.round((todayNutrition.carbs / carbsTarget) * 100),
            },
            fat: {
              current: Math.round(todayNutrition.fat),
              target: Math.round(fatTarget),
              percentage: Math.round((todayNutrition.fat / fatTarget) * 100),
            }
          },
          todaysMeals: {
            totalCalories: Math.round(todayNutrition.calories),
            breakfast: formattedMeals.breakfast,
            lunch: formattedMeals.lunch,
            dinner: formattedMeals.dinner,
          },
          trendsAnalytics: {
            period: "week",
            days: last7Days,
            calories: {
              data: last7Days.map((day) => dailyData[day].calories),
              total: weekCalories,
              average: avgCalories,
              peak: peakCalories,
              low: lowCalories,
              target: Math.round(calorieTarget),
            },
            weight: {
              // This would need a weight_logs table in production
              data: last7Days.map(() => currentWeight),
            },
            macros: {
              protein: last7Days.map((day) => dailyData[day].protein),
              carbs: last7Days.map((day) => dailyData[day].carbs),
              fat: last7Days.map((day) => dailyData[day].fat),
            },
          },
        },
      };

      dashboardCache.set(cacheKey, response);
      return res.json(response);
    } catch (error) {
      console.error("❌ Dashboard error:", error);
      return res.status(500).json({
        success: false,
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : "Failed to load dashboard",
      });
    }
  }
}
