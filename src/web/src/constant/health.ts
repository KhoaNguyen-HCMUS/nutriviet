import type { ActivityLevel } from '../types/health';

export const activityLevels: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: 'Ít vận động', description: 'Ít hoặc không tập luyện, công việc văn phòng' },
  { value: 'light', label: 'Nhẹ', description: 'Tập nhẹ 1-3 ngày/tuần' },
  { value: 'moderate', label: 'Vừa', description: 'Tập vừa 3-5 ngày/tuần' },
  { value: 'active', label: 'Nhiều', description: 'Tập nặng 6-7 ngày/tuần' },
  { value: 'very_active', label: 'Rất nhiều', description: 'Tập rất nặng, công việc tay chân' },
];
