import { birthChart, dailyInsight, compatibility } from '../data/mockInsights';

export const astrologyService = {
  async getDailyInsight() {
    return dailyInsight;
  },
  async getBirthChart() {
    return birthChart;
  },
  async getCompatibility() {
    return compatibility;
  },
};
