import { FaWeight, FaBullseye, FaArrowUp, FaArrowDown, FaMinus, FaFire, FaTrophy } from 'react-icons/fa';
import type { HealthSnapshot } from '../../types/dashboard';

interface HealthSnapshotProps {
  snapshot: HealthSnapshot;
}

export default function HealthSnapshot({ snapshot }: HealthSnapshotProps) {
  const getBMIColor = (category: string) => {
    switch (category) {
      case 'underweight':
        return 'text-blue-500';
      case 'normal':
        return 'text-green-500';
      case 'overweight':
        return 'text-yellow-500';
      case 'obese':
        return 'text-red-500';
      default:
        return 'text-text-body';
    }
  };

  const getBMIBgColor = (category: string) => {
    switch (category) {
      case 'underweight':
        return 'bg-blue-100 dark:bg-blue-900';
      case 'normal':
        return 'bg-green-100 dark:bg-green-900';
      case 'overweight':
        return 'bg-yellow-100 dark:bg-yellow-900';
      case 'obese':
        return 'bg-red-100 dark:bg-red-900';
      default:
        return 'bg-bg-muted';
    }
  };

  const getGoalIcon = (goal: string) => {
    switch (goal) {
      case 'lose':
        return <FaArrowDown className='text-red-500' />;
      case 'gain':
        return <FaArrowUp className='text-green-500' />;
      case 'maintain':
        return <FaMinus className='text-blue-500' />;
      default:
        return <FaBullseye className='text-text-body' />;
    }
  };

  const getGoalColor = (goal: string) => {
    switch (goal) {
      case 'lose':
        return 'text-red-500';
      case 'gain':
        return 'text-green-500';
      case 'maintain':
        return 'text-blue-500';
      default:
        return 'text-text-body';
    }
  };

  const getWeightChangeIcon = (change: string) => {
    const changeNum = parseFloat(change);
    if (changeNum > 0) return <FaArrowUp className='text-red-500' />;
    if (changeNum < 0) return <FaArrowDown className='text-green-500' />;
    return <FaMinus className='text-text-body' />;
  };

  const getWeightChangeColor = (change: string) => {
    const changeNum = parseFloat(change);
    if (changeNum > 0) return 'text-red-500';
    if (changeNum < 0) return 'text-green-500';
    return 'text-text-body';
  };

  const formatWeightChange = (change: string, unit: string) => {
    const changeNum = parseFloat(change);
    const sign = changeNum > 0 ? '+' : '';
    return `${sign}${change}${unit}`;
  };

  return (
    <div className='bg-bg-card rounded-lg shadow-md p-4'>
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center'>
          <div className='p-1.5 bg-primary rounded-lg mr-2'>
            <FaFire className='text-primary-contrast text-lg' />
          </div>
          <h2 className='text-lg font-semibold text-text-header'>Tổng quan sức khỏe</h2>
        </div>
        <div className='flex items-center text-sm text-text-body'>
          <FaTrophy className='mr-1 text-warning' />
          <span>7 ngày liên tiếp</span>
        </div>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div className='flex items-center space-x-3'>
          {/* BMI */}
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-full ${getBMIBgColor(snapshot.bmi.status)}`}
          >
            <span className={`text-xl font-bold ${getBMIColor(snapshot.bmi.status)}`}>{snapshot.bmi.value}</span>
          </div>
          <div>
            <h3 className='text-sm font-medium text-text-body'>BMI</h3>
            <p className={`text-xs font-medium capitalize ${getBMIColor(snapshot.bmi.status)}`}>
              {snapshot.bmi.status}
            </p>
          </div>
        </div>

        {/* Current Weight */}
        <div className='flex items-center space-x-3'>
          <div className='flex items-center justify-center w-12 h-12 bg-bg-muted rounded-full'>
            <FaWeight className='text-xl text-primary' />
          </div>
          <div>
            <h3 className='text-sm font-medium text-text-body'>Cân nặng hiện tại</h3>
            <p className='text-sm font-bold text-text-header'>
              {snapshot.currentWeight.value}
              {snapshot.currentWeight.unit}
            </p>
          </div>
        </div>

        {/* Goal */}
        <div className='flex items-center space-x-3'>
          <div className='flex items-center justify-center w-12 h-12 bg-bg-muted rounded-full'>
            {getGoalIcon(snapshot.goal.type)}
          </div>
          <div>
            <h3 className='text-sm font-medium text-text-body'>Mục tiêu</h3>
            <p className={`text-xs font-medium capitalize ${getGoalColor(snapshot.goal.type)}`}>
              {snapshot.goal.label}
            </p>
          </div>
        </div>

        {/* Weight Change */}
        <div className='flex items-center space-x-3'>
          <div className='flex items-center justify-center w-12 h-12 bg-bg-muted rounded-full'>
            {getWeightChangeIcon(snapshot.thisWeek.change)}
          </div>
          <div>
            <h3 className='text-sm font-medium text-text-body'>Tuần này</h3>
            <p className={`text-xs font-medium ${getWeightChangeColor(snapshot.thisWeek.change)}`}>
              {formatWeightChange(snapshot.thisWeek.change, snapshot.thisWeek.unit)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
