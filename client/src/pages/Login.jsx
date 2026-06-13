import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import authService from '../api/authService';
import useAuthStore from '../store/authStore';

// ─── Validation Schema ─────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ─── Login Page Component ──────────────────────────────────────
const Login = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      const { user, accessToken } = response.data;

      // Save to Zustand store (persisted to localStorage)
      setAuth(user, accessToken);

      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);

      // Redirect based on role
      const routes = {
        student: '/student/dashboard',
        alumni:  '/alumni/dashboard',
        mentor:  '/mentor/dashboard',
        admin:   '/admin/dashboard',
      };
      navigate(routes[user.role] || '/dashboard');

    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col items-center justify-center px-4 relative overflow-hidden">
      
      {/* Decorative Background Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/60 via-slate-50 to-slate-50 -z-10" />
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md relative">

        {/* Header / Brand Identity */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group cursor-pointer mb-5">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-sm tracking-wider">MC</span>
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-xl">
              Mentor<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Connect</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back</h1>
          <p className="text-slate-500 mt-2 text-sm">Sign in to sync with your professional ecosystem</p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              icon={Mail}
              error={errors.email?.message}
              required
              className="focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl"
              {...register('email')}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={Lock}
                rightIcon={showPassword ? EyeOff : Eye}
                onRightIconClick={() => setShowPassword(!showPassword)}
                error={errors.password?.message}
                required
                className="focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl"
                {...register('password')}
              />
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end pt-0.5">
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center justify-center"
              size="lg"
              loading={isLoading}
            >
              Sign In
            </Button>

          </form>

          {/* Separation Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
              <span className="bg-white px-3 text-slate-400">New to the community?</span>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center">
            <p className="text-slate-500 text-sm">
              Don't have an account yet?{' '}
              <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
                Create one free
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;