import { FaFire, FaDrumstickBite, FaBreadSlice, FaCheese, FaLeaf } from 'react-icons/fa';
import type { TodayProgress } from '../../types/dashboard';

interface ProgressTrackerProps {
  progress: TodayProgress;
}

export default function ProgressTracker({ progress }: ProgressTrackerProps) {
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-500';
    if (percentage >= 80) return 'text-yellow-500';
    if (percentage >= 60) return 'text-orange-500';
    return 'text-red-500';
  };

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className='bg-bg-card rounded-lg shadow-md p-5'>
      <div className='flex items-center mb-4'>
        <div className='p-1.5 bg-primary rounded-lg mr-2'>
          <FaFire className='text-primary-contrast text-lg' />
        </div>
        <h2 className='text-lg font-semibold text-text-header'>Tiến độ hôm nay</h2>
      </div>

      {/* Calories Progress */}
      <div className='mb-5'>
        <div className='flex items-center justify-between mb-2'>
          <div className='flex items-center'>
            <FaFire className='text-orange-500 mr-2' />
            <span className='text-base font-medium text-text-header'>Calo</span>
          </div>
          <div className='text-right'>
            <span className={`text-xl font-bold ${getProgressColor(progress.calories.percentage)}`}>
              {progress.calories.current}
            </span>
            <span className='text-text-body'> / {progress.calories.target}</span>
          </div>
        </div>

        <div className='w-full bg-bg-muted rounded-full h-2.5 mb-1.5'>
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${getProgressBgColor(
              progress.calories.percentage
            )}`}
            style={{ width: `${Math.min(100, progress.calories.percentage)}%` }}
          ></div>
        </div>

        <div className='flex justify-between text-sm'>
          <span className={`font-medium ${getProgressColor(progress.calories.percentage)}`}>
            {progress.calories.percentage.toFixed(0)}% hoàn thành
          </span>
          <span className='text-text-body'>
            {progress.calories.remaining > 0 ? `Còn lại ${progress.calories.remaining}` : 'Đã đạt mục tiêu!'}
          </span>
        </div>
      </div>

      {/* Macros - stack vertically */}
      <div className='flex flex-col gap-3'>
        <div className='bg-bg rounded-lg p-3 border border-border-light'>
          <div className='flex items-center justify-between mb-1.5'>
            <div className='flex items-center'>
              <FaDrumstickBite className='text-red-500' />
              <span className='ml-1.5 text-xs font-medium text-text-body'>Protein</span>
            </div>
            <span className='text-xs font-bold text-red-500'>{progress.protein.current}g</span>
          </div>
          <div className='w-full bg-bg-muted rounded-full h-1.5 mb-1'>
            <div
              className='h-1.5 rounded-full transition-all duration-300 bg-red-500'
              style={{ width: `${Math.min(100, progress.protein.percentage)}%` }}
            ></div>
          </div>
          <div className='flex justify-between text-xs text-text-body'>
            <span>{progress.protein.percentage.toFixed(0)}%</span>
            <span>{progress.protein.target}g</span>
          </div>
        </div>

        <div className='bg-bg rounded-lg p-3 border border-border-light'>
          <div className='flex items-center justify-between mb-1.5'>
            <div className='flex items-center'>
              <FaBreadSlice className='text-blue-500' />
              <span className='ml-1.5 text-xs font-medium text-text-body'>Carb</span>
            </div>
            <span className='text-xs font-bold text-blue-500'>{progress.carbohydrates.current}g</span>
          </div>
          <div className='w-full bg-bg-muted rounded-full h-1.5 mb-1'>
            <div
              className='h-1.5 rounded-full transition-all duration-300 bg-blue-500'
              style={{ width: `${Math.min(100, progress.carbohydrates.percentage)}%` }}
            ></div>
          </div>
          <div className='flex justify-between text-xs text-text-body'>
            <span>{progress.carbohydrates.percentage.toFixed(0)}%</span>
            <span>{progress.carbohydrates.target}g</span>
          </div>
        </div>

        <div className='bg-bg rounded-lg p-3 border border-border-light'>
          <div className='flex items-center justify-between mb-1.5'>
            <div className='flex items-center'>
              <FaCheese className='text-yellow-500' />
              <span className='ml-1.5 text-xs font-medium text-text-body'>Chất béo</span>
            </div>
            <span className='text-xs font-bold text-yellow-500'>{progress.fat.current}g</span>
          </div>
          <div className='w-full bg-bg-muted rounded-full h-1.5 mb-1'>
            <div
              className='h-1.5 rounded-full transition-all duration-300 bg-yellow-500'
              style={{ width: `${Math.min(100, progress.fat.percentage)}%` }}
            ></div>
          </div>
          <div className='flex justify-between text-xs text-text-body'>
            <span>{progress.fat.percentage.toFixed(0)}%</span>
            <span>{progress.fat.target}g</span>
          </div>
        </div>
      </div>
    </div>
  );
}
