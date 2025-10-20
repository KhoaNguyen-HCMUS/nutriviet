import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { register } from '../services/auth';
import { toast } from 'react-toastify';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      const res = await register({ email, password, confirmPassword });
      if (res.success) {
        toast.success('Register successful. Please login to continue.');
        navigate('/login');
      } else {
        toast.error(res.message || 'Register failed');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Register error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center px-6 bg-linear-(--gradient-primary) text-text-body '>
      <div className='w-full max-w-md'>
        <div className='mb-8 text-center'>
          <h1 className='text-3xl font-bold text-text-header'>Tạo tài khoản</h1>
          <p className='mt-2 text-sm text-text-muted'>
            Tham gia cùng chúng tôi để theo dõi tiến trình của bạn một cách rõ ràng
          </p>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4 rounded-xl p-6 border bg-bg-card border-border-light'>
          <div className='space-y-1'>
            <label className='text-sm text-text-muted'>Email</label>
            <input
              type='email'
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full rounded-md px-3 py-2 border outline-none focus:ring-4 bg-bg text-text-body border-border-light box-shadow-none'
              placeholder='Enter your email'
            />
          </div>
          <div className='space-y-1'>
            <label className='text-sm text-text-muted'>Mật khẩu</label>
            <input
              type='password'
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full rounded-md px-3 py-2 border outline-none focus:ring-4 bg-bg text-text-body border-border-light box-shadow-none'
              placeholder='Enter your password'
            />
          </div>
          <div className='space-y-1'>
            <label className='text-sm text-text-muted'>Xác nhận mật khẩu</label>
            <input
              type='password'
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='w-full rounded-md px-3 py-2 border outline-none focus:ring-4 bg-bg text-text-body border-border-light box-shadow-none'
              placeholder='Confirm your password'
            />
          </div>
          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-md px-4 py-2 font-medium bg-primary text-primary-contrast disabled:opacity-60'
          >
            {loading ? 'Creating...' : 'Create account'}
          </button>
        </form>
        <div className='mt-4 text-center text-sm'>
          Đã có tài khoản?{' '}
          <Link to='/login' className='underline text-link-hover'>
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
