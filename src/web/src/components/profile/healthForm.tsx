import { useState, useEffect } from 'react';
import type { HealthProfile, PersonalInfo, HealthGoals, MedicalInfo, MeasurementUnits } from '../../types/health';
import { convertWeight, convertHeight } from '../../utils/healthCalculations';
import {
  FaUser,
  FaWeight,
  FaRuler,
  FaVenusMars,
  FaRunning,
  FaHeart,
  FaHeartbeat,
  FaAllergies,
  FaUtensils,
} from 'react-icons/fa';
import { activityLevels } from '../../constant/health';

interface HealthFormProps {
  profile: Partial<HealthProfile>;
  isEditing: boolean;
  consentGranted: boolean;
  onChange: (profile: Partial<HealthProfile>) => void;
}

export default function HealthForm({ profile, isEditing, consentGranted, onChange }: HealthFormProps) {
  const [formData, setFormData] = useState<Partial<HealthProfile>>(profile);
  console.log('formData in healthForm:', formData);
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  type FieldValue = string | number | boolean;

  const handleInputChange = (field: string, value: FieldValue) => {
    const newData = { ...formData };

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const parentKey = parent as keyof HealthProfile;

      if (!newData[parentKey]) {
        if (parent === 'personalInfo') {
          newData.personalInfo = {} as PersonalInfo;
        } else if (parent === 'goals') {
          newData.goals = {} as HealthGoals;
        } else if (parent === 'medicalInfo') {
          newData.medicalInfo = {} as MedicalInfo;
        } else if (parent === 'units') {
          newData.units = {} as MeasurementUnits;
        }
      }

      switch (parent) {
        case 'personalInfo': {
          const personalInfo = newData.personalInfo || {};
          const typedPersonalInfo = { ...personalInfo } as Record<string, FieldValue>;
          typedPersonalInfo[child] = value;
          newData.personalInfo = typedPersonalInfo as unknown as PersonalInfo;
          break;
        }
        case 'goals': {
          const goals = newData.goals || {};
          const typedGoals = { ...goals } as Record<string, FieldValue>;
          typedGoals[child] = value;
          newData.goals = typedGoals as unknown as HealthGoals;
          break;
        }
        case 'medicalInfo': {
          const medicalInfo = newData.medicalInfo || {};
          const typedMedicalInfo = { ...medicalInfo } as Record<string, FieldValue>;
          typedMedicalInfo[child] = value;
          newData.medicalInfo = typedMedicalInfo as unknown as MedicalInfo;
          break;
        }
        case 'units': {
          const units = newData.units || {};
          const typedUnits = { ...units } as Record<string, FieldValue>;
          typedUnits[child] = value;
          newData.units = typedUnits as unknown as MeasurementUnits;
          break;
        }
      }
    } else {
      (newData as Record<string, FieldValue | object>)[field] = value;
    }

    setFormData(newData);
    onChange(newData);
  };

  const handleUnitChange = (type: 'weight' | 'height', newUnit: string) => {
    if (!formData.personalInfo || !formData.units) return;

    const currentValue = formData.personalInfo[type];
    const currentUnit = formData.units[type];

    let convertedValue = currentValue;
    if (type === 'weight' && (currentUnit === 'kg' || currentUnit === 'lb') && (newUnit === 'kg' || newUnit === 'lb')) {
      convertedValue = convertWeight(currentValue, currentUnit as 'kg' | 'lb', newUnit as 'kg' | 'lb');
    } else if (
      type === 'height' &&
      (currentUnit === 'cm' || currentUnit === 'in') &&
      (newUnit === 'cm' || newUnit === 'in')
    ) {
      convertedValue = convertHeight(currentValue, currentUnit as 'cm' | 'in', newUnit as 'cm' | 'in');
    }

    handleInputChange(`personalInfo.${type}`, convertedValue);
    handleInputChange(`units.${type}`, newUnit);
  };

  return (
    <div className='bg-bg-card rounded-lg shadow-md p-6 mb-6'>
      <div className='flex items-center mb-6'>
        <div className='p-2 bg-primary rounded-lg mr-3'>
          <FaUser className='text-primary-contrast text-xl' />
        </div>
        <h2 className='text-xl font-semibold text-text-header'>Thông tin sức khỏe</h2>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-4'>
          <div className='flex items-center mb-4'>
            <h3 className='text-lg font-medium text-text-header'>Thông tin cá nhân</h3>
          </div>

          <div>
            <label className='flex items-center text-sm font-medium text-text-body mb-2'>Tuổi</label>
            <input
              type='number'
              min='1'
              max='120'
              step='1'
              value={formData.personalInfo?.age || ''}
              onChange={(e) => handleInputChange('personalInfo.age', parseInt(e.target.value || '0', 10))}
              disabled={!isEditing}
              className='w-full px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-bg text-text-body disabled:bg-bg-muted transition-colors'
              placeholder='Nhập tuổi'
            />
          </div>

          <div>
            <label className='flex items-center text-sm font-medium text-text-body mb-2'>
              <FaVenusMars className='mr-2 text-secondary' />
              Giới tính
            </label>
            <select
              value={formData.personalInfo?.gender || ''}
              onChange={(e) => handleInputChange('personalInfo.gender', e.target.value)}
              disabled={!isEditing}
              className='w-full px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-bg text-text-body disabled:bg-bg-muted transition-colors'
              aria-label='Select gender'
            >
              <option value=''>Chọn giới tính</option>
              <option value='male'>Nam</option>
              <option value='female'>Nữ</option>
            </select>
          </div>

          <div>
            <label className='flex items-center text-sm font-medium text-text-body mb-2'>
              <FaRuler className='mr-2 text-primary' />
              Chiều cao
            </label>
            <div className='flex space-x-2'>
              <input
                type='number'
                min='50'
                max='250'
                step='0.1'
                value={formData.personalInfo?.height || ''}
                onChange={(e) => handleInputChange('personalInfo.height', parseFloat(e.target.value) || 0)}
                disabled={!isEditing}
                className='flex-1 px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-bg text-text-body disabled:bg-bg-muted transition-colors'
                placeholder='Nhập chiều cao'
              />
              <input
                type='text'
                value={formData.units?.height || 'cm'}
                onChange={(e) => handleUnitChange('height', e.target.value)}
                disabled={!isEditing}
                className='px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-bg text-text-body disabled:bg-bg-muted  transition-colors'
                placeholder='Đơn vị (cm, in, ft)'
              />
            </div>
          </div>

          <div>
            <label className='flex items-center text-sm font-medium text-text-body mb-2'>
              <FaWeight className='mr-2 text-warning' />
              Cân nặng
            </label>
            <div className='flex space-x-2'>
              <input
                type='number'
                min='10'
                max='300'
                step='0.1'
                value={formData.personalInfo?.weight || ''}
                onChange={(e) => handleInputChange('personalInfo.weight', parseFloat(e.target.value) || 0)}
                disabled={!isEditing}
                className='flex-1 px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-bg text-text-body disabled:bg-bg-muted transition-colors'
                placeholder='Nhập cân nặng'
              />
              <input
                type='text'
                value={formData.units?.weight || 'kg'}
                onChange={(e) => handleUnitChange('weight', e.target.value)}
                disabled={!isEditing}
                className='px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-bg text-text-body disabled:bg-bg-muted transition-colors'
                placeholder='Đơn vị (kg, lb, stones)'
              />
            </div>
          </div>
        </div>

        <div className='space-y-4'>
          <div className='flex items-center mb-4'>
            <h3 className='text-lg font-medium text-text-header'>Mục tiêu & Hoạt động</h3>
          </div>

          <div>
            <label className='flex items-center text-sm font-medium text-text-body mb-2'>
              <FaHeart className='mr-2 text-warning' />
              Mục tiêu chính
            </label>
            <select
              value={formData.goals?.primary || ''}
              onChange={(e) => handleInputChange('goals.primary', e.target.value)}
              disabled={!isEditing}
              className='w-full px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-bg text-text-body disabled:bg-bg-muted transition-colors'
              aria-label='Select primary health goal'
            >
              <option value=''>Chọn mục tiêu</option>
              <option value='lose'>Giảm cân</option>
              <option value='maintain'>Duy trì cân nặng</option>
              <option value='gain'>Tăng cân</option>
            </select>
          </div>

          {/* Activity Level */}
          <div>
            <label className='flex items-center text-sm font-medium text-text-body mb-2'>
              <FaRunning className='mr-2 text-success' />
              Mức độ hoạt động
            </label>
            <select
              value={formData.activityLevel || ''}
              onChange={(e) => handleInputChange('activityLevel', e.target.value)}
              disabled={!isEditing}
              className='w-full px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-bg text-text-body disabled:bg-bg-muted transition-colors'
              aria-label='Select activity level'
            >
              <option value=''>Chọn mức độ hoạt động</option>
              {activityLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label} - {level.description}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Medical Information */}
      <div className='mt-6 space-y-4'>
        <div className='flex items-center mb-4'>
          <div className='p-2 bg-error rounded-lg mr-3'>
            <FaHeartbeat className='text-error-foreground text-lg' />
          </div>
          <h3 className='text-lg font-medium text-text-header'>Thông tin y tế</h3>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div className='space-y-4'>
            {/* Health Conditions */}
            <div>
              <label className='flex items-center text-sm font-medium text-text-body mb-3'>
                <FaHeartbeat className='mr-2 text-error' />
                Tình trạng sức khỏe
              </label>
              <textarea
                value={formData.medicalInfo?.conditions || ''}
                onChange={(e) => handleInputChange('medicalInfo.conditions', e.target.value)}
                disabled={!isEditing}
                className='w-full px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-bg text-text-body disabled:bg-bg-muted transition-colors resize-none'
                placeholder='Nhập tình trạng sức khỏe (VD: Tiểu đường, Cao huyết áp, v.v.)'
                rows={4}
              />
            </div>

            {/* Allergies */}
            <div>
              <label className='flex items-center text-sm font-medium text-text-body mb-3'>
                <FaAllergies className='mr-2 text-warning' />
                Dị ứng
              </label>
              <textarea
                value={formData.medicalInfo?.allergies || ''}
                onChange={(e) => handleInputChange('medicalInfo.allergies', e.target.value)}
                disabled={!isEditing}
                className='w-full px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-bg text-text-body disabled:bg-bg-muted transition-colors resize-none'
                placeholder='Nhập dị ứng (VD: Hạt, Sữa, Gluten, v.v.)'
                rows={4}
              />
            </div>
          </div>

          <div className='space-y-4'>
            {/* Dietary Preferences */}
            <div>
              <label className='flex items-center text-sm font-medium text-text-body mb-3'>
                <FaUtensils className='mr-2 text-success' />
                Sở thích ăn uống
              </label>
              <textarea
                value={formData.medicalInfo?.preferences || ''}
                onChange={(e) => handleInputChange('medicalInfo.preferences', e.target.value)}
                disabled={!isEditing}
                className='w-full px-4 py-3 border border-border-light rounded-lg focus:ring-2 focus:ring-ring focus:border-transparent bg-bg text-text-body disabled:bg-bg-muted transition-colors resize-none'
                placeholder='Nhập sở thích ăn uống (VD: Ăn chay, Ít muối, v.v.)'
                rows={4}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Consent Notice */}
      {!consentGranted && (
        <div className='mt-6 p-4 bg-warning-bg border border-warning-border rounded-lg'>
          <div className='flex items-center'>
            <div className='flex-shrink-0'>
              <svg className='h-5 w-5 text-warning' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm text-warning-foreground'>
                <strong>Consent Required:</strong> Please grant consent to enable health calculations and meal planning
                features.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
