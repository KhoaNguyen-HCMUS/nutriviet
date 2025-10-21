import type { DashboardData, TrendsData, TrendsAnalytics } from '../types/dashboard';
import type { HealthProfile } from '../types/health';
import { requestAuth } from '../utils/api';

/**
 * Service class for handling all health related data fetching and processing
 */
export class HealthService {
  /**
   * Fetch dashboard data from API
   * @param healthProfile User's health profile
   * @returns Promise with dashboard data
   */
  static async fetchDashboardData(healthProfile: HealthProfile): Promise<DashboardData> {
    try {
      const response = await requestAuth<{ success: boolean; data: any }>('GET', '/api/dashboard');

      if (!response.success || !response.data) {
        throw new Error('Failed to fetch dashboard data');
      }

      const apiData = response.data;

      const dashboardData: DashboardData = {
        healthSnapshot: apiData.healthSnapshot,
        todaysProgress: apiData.todaysProgress,
        todaysMeals: apiData.todaysMeals,
        trendsAnalytics: apiData.trendsAnalytics,
        lastUpdated: new Date(),
      };

      return dashboardData;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw error;
    }
  }

  /**
   * Generate trends data for charts
   * @param period 'week' or 'month'
   * @returns Trends data object
   */
  static generateTrendsData(period: 'week' | 'month' = 'week'): TrendsData {
    const days = period === 'week' ? 7 : 30;
    const calories = [];
    const weight = [];
    const water = [];
    const protein = [];
    const carbohydrates = [];
    const fat = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));

      calories.push({
        date,
        value: Math.round(1800 + Math.random() * 400),
        target: 2000,
      });

      weight.push({
        date,
        value: Math.round((70 - i * 0.1 + Math.random() * 0.2) * 10) / 10,
        target: 70,
      });

      water.push({
        date,
        value: Math.round(2000 + Math.random() * 1000),
        target: 2500,
      });

      protein.push({
        date,
        value: Math.round(80 + Math.random() * 20),
        target: 100,
      });

      carbohydrates.push({
        date,
        value: Math.round(200 + Math.random() * 50),
        target: 250,
      });

      fat.push({
        date,
        value: Math.round(60 + Math.random() * 20),
        target: 80,
      });
    }

    return {
      period,
      calories,
      weight,
      macros: { protein, carbohydrates, fat },
      water,
      exercise: [],
    };
  }

  /**
   * Fetch trends data for a specific period
   * @param period 'week' or 'month'
   * @returns Promise with trends data
   */
  static async fetchTrendsData(period: 'week' | 'month' = 'week'): Promise<TrendsData> {
    // In a real app, this would be an actual API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(HealthService.generateTrendsData(period));
      }, 500);
    });
  }
}
