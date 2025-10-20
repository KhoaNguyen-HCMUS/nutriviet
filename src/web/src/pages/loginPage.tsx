import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { login } from '..//services/auth';
import { saveAuthData } from '../utils/authStorage';
import { toast } from 'react-toastify';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login({ email, password });
      if (res.success && res.data) {
        saveAuthData({ access_token: res.data.token as string, email: res.data.user.email as string });
        navigate('/dashboard');
        toast.success('Đăng nhập thành công');
        // window.location.reload()
      } else {
        toast.error(res.message || 'Đăng nhập thất bại');
      }
    } catch {
      toast.error('Lỗi đăng nhập');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center px-6 bg-linear-(--gradient-primary) text-text-body '>
      <div className='w-full max-w-md'>
        <div className='mb-8 text-center'>
          <h1 className='text-3xl font-bold text-text-header'>Chào mừng trở lại</h1>
          <p className='mt-2 text-sm text-text-muted'>Đăng nhập để tiếp tục đến bảng điều khiển</p>
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
              placeholder='Nhập email của bạn'
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
              placeholder='Nhập mật khẩu của bạn'
            />
          </div>
          <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center gap-2'>
              <input type='checkbox' id='remember' className='h-4 w-4' />
              <label htmlFor='remember' className='text-text-muted'>
                Ghi nhớ đăng nhập
              </label>
            </div>
            <a href='#' className='underline text-link-hover'>
              Quên mật khẩu?
            </a>
          </div>
          <button
            type='submit'
            disabled={loading}
            className='w-full rounded-md px-4 py-2 font-medium bg-primary text-primary-contrast disabled:opacity-60'
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <div className='mt-4 text-center text-sm'>
          Chưa có tài khoản?{' '}
          <Link to='/register' className='underline text-link-hover'>
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
}
