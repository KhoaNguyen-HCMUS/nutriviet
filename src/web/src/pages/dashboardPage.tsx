import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import type { DashboardData, QuickAction } from '../types/dashboard';
import type { HealthProfile } from '../types/health';
import HealthSnapshot from '../components/dashboard/healthSnapshot';
import ProgressTracker from '../components/dashboard/progressTracker';
import TodayMeals from '../components/dashboard/todayMeals';
import QuickActions from '../components/dashboard/quickActions';
import TrendsChart from '../components/dashboard/trendsChart';
import { FaHome, FaInfoCircle } from 'react-icons/fa';
import { HealthService } from '../services/dashboard';
import { getProfile } from '../services/profile';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const [, setHealthProfile] = useState<Partial<HealthProfile> | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const profileResp = await getProfile();
      if (!profileResp.success || !profileResp.data?.profile) {
        throw new Error('Failed to get profile');
      }

      const p = profileResp.data.profile;
      const weight = parseFloat(p.weight_kg || '0') || 0;
      const height = parseFloat(p.height_cm || '0') || 0;

      const gp: HealthProfile = {
        userId: '',
        personalInfo: {
          age: Number(p.age || 0),
          gender: (p.sex || 'male') as 'male' | 'female',
          height,
          weight,
          location: '',
        },
        goals: {
          primary: (p.goal || 'maintain') as 'lose' | 'maintain' | 'gain',
        },
        activityLevel: (p.activity_level || 'moderate') as HealthProfile['activityLevel'],
        medicalInfo: { conditions: '', allergies: '', medications: '' },
        units: { weight: 'kg', height: 'cm', temperature: 'celsius' },
        consent: p.consent_accepted_at != null,
        updatedAt: p.updated_at ? new Date(p.updated_at) : new Date(),
      } as unknown as HealthProfile;

      setHealthProfile(gp);

      const dashboardData = await HealthService.fetchDashboardData(gp);
      setDashboardData(dashboardData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = () => {
    navigate('/food-recognition');
  };

  const handleAddMeal = (mealType?: string) => {
    navigate('/food-recognition');
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-linear-(--gradient-primary) flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-text-body'>Đang tải bảng điều khiển...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className='min-h-screen bg-linear-(--gradient-primary) flex items-center justify-center'>
        <div className='text-center'>
          <p className='text-text-body'>Không thể tải dữ liệu bảng điều khiển</p>
          <button
            onClick={loadDashboardData}
            className='mt-4 px-4 py-2 bg-primary text-primary-contrast rounded-lg hover:bg-primary/90'
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const quickActions: QuickAction[] = [
    {
      id: 'scan',
      type: 'scan',
      title: 'Quét thực phẩm',
      description: 'Chụp ảnh để nhận diện thực phẩm và dinh dưỡng',
      icon: 'camera',
      color: 'blue',
      action: () => navigate('/food-recognition'),
    },
    {
      id: 'edit_profile',
      type: 'edit_profile',
      title: 'Chỉnh sửa hồ sơ',
      description: 'Cập nhật hồ sơ sức khỏe và tùy chọn của bạn',
      icon: 'user-edit',
      color: 'green',
      action: () => navigate('/profile'),
    },
  ];

  return (
    <div className='min-h-screen bg-linear-(--gradient-primary) py-6'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Page Header */}
        <div className='mb-6'>
          <div className='flex items-center'>
            <div className='p-2 bg-primary text-primary-contrast rounded-lg mr-3'>
              <FaHome className='text-xl' />
            </div>
            <div>
              <h1 className='text-2xl font-bold text-primary'>Bảng điều khiển</h1>
              <p className='text-sm text-text-header'>Theo dõi hành trình sức khỏe và tiến độ hàng ngày</p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className='mb-6 bg-bg-card border border-blue-200 rounded-lg p-4'>
          <div className='flex items-start'>
            <FaInfoCircle className='text-blue-500 mr-3 mt-0.5' />
            <div className='text-sm '>
              <p className='font-medium mb-1 text-text-header'>Chào mừng đến với bảng điều khiển sức khỏe!</p>
              <p className='text-text-body'>
                Theo dõi dinh dưỡng hàng ngày, giám sát tiến độ và luôn đạt được mục tiêu sức khỏe của bạn.
              </p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6'>
          <div className='md:col-span-1 lg:col-span-2'>
            <HealthSnapshot snapshot={dashboardData.healthSnapshot} />
          </div>

          <div>
            <QuickActions actions={quickActions} onScan={handleScan} />
          </div>

          <div className='md:col-span-2 lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <ProgressTracker progress={dashboardData.todaysProgress} />
            </div>
            <div>
              <TodayMeals meals={dashboardData.todaysMeals} onAddMeal={handleAddMeal} />
            </div>
          </div>
        </div>

        <TrendsChart trends={dashboardData.trendsAnalytics} />
      </div>
    </div>
  );
}
