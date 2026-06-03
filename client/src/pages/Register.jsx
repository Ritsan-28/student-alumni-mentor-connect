import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import authService from '../api/authService';

// ─── Zod Validation Schema ─────────────────────────────────────
const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name too long'),
  email: z
    .string()
    .email('Please enter a valid email'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Must contain uppercase, lowercase, and a number'
    ),
  confirmPassword: z.string(),
  role: z.enum(['student', 'alumni', 'mentor'], {
    required_error: 'Please select a role',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ─── Role Options ──────────────────────────────────────────────
const roles = [
  {
    value: 'student',
    label: 'Student',
    emoji: '🎓',
    description: 'Get mentorship & career guidance',
    color: 'border-indigo-500 bg-indigo-50 text-indigo-700',
  },
  {
    value: 'alumni',
    label: 'Alumni',
    emoji: '👔',
    description: 'Give back & post opportunities',
    color: 'border-sky-500 bg-sky-50 text-sky-700',
  },
  {
    value: 'mentor',
    label: 'Mentor',
    emoji: '⭐',
    description: 'Guide the next generation',
    color: 'border-emerald-500 bg-emerald-50 text-emerald-700',
  },
];

// ─── Register Page Component ───────────────────────────────────
const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      toast.success('Account created! Check your email for the verification code.');
      // Navigate to verify page with email in state
      navigate('/verify-email', { state: { email: data.email } });

    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-primary-600 font-bold text-2xl">
            Mentor Connect
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Create your account</h1>
          <p className="text-gray-500 mt-2">Join thousands of students, alumni, and mentors</p>
        </div>

        {/* Form Card */}
        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Name */}
            <Input
              label="Full Name"
              placeholder="Arjun Kumar"
              icon={User}
              error={errors.name?.message}
              required
              {...register('name')}
            />

            {/* Email */}
            <Input
              label="Email Address"
              type="email"
              placeholder="arjun@example.com"
              icon={Mail}
              error={errors.email?.message}
              required
              {...register('email')}
            />

            {/* Password */}
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 8 chars, upper, lower, number"
              icon={Lock}
              rightIcon={showPassword ? EyeOff : Eye}
              onRightIconClick={() => setShowPassword(!showPassword)}
              error={errors.password?.message}
              required
              {...register('password')}
            />

            {/* Confirm Password */}
            <Input
              label="Confirm Password"
              type={showConfirm ? 'text' : 'password'}
              placeholder="Re-enter your password"
              icon={Lock}
              rightIcon={showConfirm ? EyeOff : Eye}
              onRightIconClick={() => setShowConfirm(!showConfirm)}
              error={errors.confirmPassword?.message}
              required
              {...register('confirmPassword')}
            />

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                I am a... <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setValue('role', role.value, { shouldValidate: true })}
                    className={`
                      flex flex-col items-center gap-1.5 p-3 rounded-xl border-2
                      transition-all duration-200 cursor-pointer
                      ${selectedRole === role.value
                        ? role.color + ' border-2 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="text-2xl">{role.emoji}</span>
                    <span className="font-semibold text-sm">{role.label}</span>
                    <span className="text-xs text-center leading-tight opacity-75">
                      {role.description}
                    </span>
                  </button>
                ))}
              </div>
              {errors.role && (
                <p className="mt-1.5 text-sm text-red-500">⚠ {errors.role.message}</p>
              )}
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-500 text-center">
              By creating an account, you agree to our{' '}
              <span className="text-primary-600 cursor-pointer hover:underline">
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="text-primary-600 cursor-pointer hover:underline">
                Privacy Policy
              </span>
            </p>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isLoading}
            >
              Create Account
            </Button>

          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;