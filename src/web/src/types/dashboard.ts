export interface DashboardData {
  healthSnapshot: HealthSnapshot;
  todaysProgress: TodayProgress;
  todaysMeals: TodayMeals;
  trendsAnalytics: TrendsAnalytics;
  lastUpdated: Date;
}

export interface HealthSnapshot {
  bmi: {
    value: string;
    status: string;
  };
  currentWeight: {
    value: string;
    unit: string;
  };
  goal: {
    type: string;
    label: string;
  };
  thisWeek: {
    change: string;
    unit: string;
  };
}

export interface TodayProgress {
  calories: {
    current: number;
    target: number;
    percentage: number;
    remaining: number;
  };
  protein: {
    current: number;
    target: number;
    percentage: number;
  };
  carbohydrates: {
    current: number;
    target: number;
    percentage: number;
  };
  fat: {
    current: number;
    target: number;
    percentage: number;
  };
}

export interface MacroProgress {
  consumed: number; // grams
  target: number; // grams
  percentage: number;
}

export interface TodayMeals {
  totalCalories: number;
  breakfast: MealSection;
  lunch: MealSection;
  dinner: MealSection;
}

export interface MealSection {
  items: number;
  totalCalories: number;
  meals: any[];
}

export interface TodayMeal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  calories: number;
  macros: {
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
  };
  time: Date;
  imageUrl?: string;
  source: 'manual' | 'scan' | 'meal_plan';
  isLogged: boolean;
}

export interface QuickAction {
  id: string;
  type: 'scan' | 'edit_profile';
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

export interface TrendsAnalytics {
  period: string;
  days: string[];
  calories: {
    data: number[];
    total: number;
    average: number;
    peak: number;
    low: number;
    target: number;
  };
  weight: {
    data: number[];
  };
  macros: {
    protein: number[];
    carbs: number[];
    fat: number[];
  };
}

export interface TrendsData {
  period: 'week' | 'month';
  calories: TrendPoint[];
  weight: TrendPoint[];
  macros: {
    protein: TrendPoint[];
    carbohydrates: TrendPoint[];
    fat: TrendPoint[];
  };
  water: TrendPoint[];
  exercise: TrendPoint[];
}

export interface TrendPoint {
  date: Date;
  value: number;
  target?: number;
}

export interface ScanResult {
  foodName: string;
  confidence: number;
  nutrition: {
    calories: number;
    macros: {
      protein: number;
      carbohydrates: number;
      fat: number;
      fiber: number;
    };
    servingSize: string;
    servingUnit: string;
  };
  imageUrl: string;
  timestamp: Date;
}

export interface WaterLog {
  id: string;
  amount: number; // ml
  timestamp: Date;
  type: 'water' | 'coffee' | 'tea' | 'juice' | 'other';
}

export interface WeightLog {
  id: string;
  weight: number; // kg
  timestamp: Date;
  notes?: string;
  bodyFat?: number; // percentage
  muscleMass?: number; // kg
}

export interface ExerciseLog {
  id: string;
  type: string;
  duration: number; // minutes
  caloriesBurned: number;
  timestamp: Date;
  intensity: 'low' | 'moderate' | 'high';
  notes?: string;
}

export interface DashboardSettings {
  showWaterTracking: boolean;
  showExerciseTracking: boolean;
  showWeightTracking: boolean;
  defaultMealTypes: string[];
  calorieGoal: number;
  waterGoal: number; // ml
  macroGoals: {
    protein: number;
    carbohydrates: number;
    fat: number;
  };
}

export interface DashboardStats {
  totalDaysLogged: number;
  averageCalories: number;
  averageWater: number;
  weightChange: number;
  goalProgress: number; // percentage
  streak: number;
  lastActivity: Date;
}
