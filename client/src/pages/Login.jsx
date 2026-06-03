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
  email: z.string().email('Please enter a valid email'),
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
      const message = error.response?.data?.message || 'Login failed. Try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600 font-bold text-2xl">
            Mentor Connect
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Welcome back</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>

        {/* Form Card */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            <Input
              label="Email Address"
              type="email"
              placeholder="arjun@example.com"
              icon={Mail}
              error={errors.email?.message}
              required
              {...register('email')}
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Your password"
              icon={Lock}
              rightIcon={showPassword ? EyeOff : Eye}
              onRightIconClick={() => setShowPassword(!showPassword)}
              error={errors.password?.message}
              required
              {...register('password')}
            />

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isLoading}
            >
              Sign In
            </Button>

          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:underline">
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