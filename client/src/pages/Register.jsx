import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form'; // Added useWatch
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
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Must include uppercase, lowercase, and a number'
    ),
  confirmPassword: z.string(),
  role: z.enum(['student', 'alumni', 'mentor'], {
    required_error: 'Please select an option',
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
    description: 'Get mentorship & track guidance',
    activeClass: 'border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/10 text-indigo-900',
  },
  {
    value: 'alumni',
    label: 'Alumni',
    emoji: '👔',
    description: 'Give back & pass along referrals',
    activeClass: 'border-sky-600 bg-sky-50/60 ring-2 ring-sky-600/10 text-sky-900',
  },
  {
    value: 'mentor',
    label: 'Mentor',
    emoji: '⭐',
    description: 'Guide the next generation',
    activeClass: 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-600/10 text-emerald-900',
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
    control, // Destructured control to pass to useWatch
    setValue,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  // Fixed compiler error by pulling out 'role' using the custom hook
  const selectedRole = useWatch({
    control,
    name: 'role',
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
      });

      toast.success('Account created! Check your email for verification.');
      navigate('/verify-email', { state: { email: data.email } });

    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed. Try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
      
      {/* Decorative Background Accents */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/60 via-slate-50 to-slate-50 -z-10" />
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-lg relative">

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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create your account</h1>
          <p className="text-slate-500 mt-2 text-sm">Join a thriving global ecosystem of shared knowledge</p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">

            {/* Name */}
            <Input
              label="Full Name"
              placeholder="Arjun Kumar"
              icon={User}
              error={errors.name?.message}
              required
              className="focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl"
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
              className="focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl"
              {...register('email')}
            />

            {/* Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Password */}
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

              {/* Confirm Password */}
              <Input
                label="Confirm Password"
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                icon={Lock}
                rightIcon={showConfirm ? EyeOff : Eye}
                onRightIconClick={() => setShowConfirm(!showConfirm)}
                error={errors.confirmPassword?.message}
                required
                className="focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl"
                {...register('confirmPassword')}
              />
            </div>

            {/* Role Selection */}
            <div className="pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Account Type <span className="text-rose-500">*</span>
              </label>
              
              <div className="grid grid-cols-3 gap-3">
                {roles.map((role) => {
                  const isSelected = selectedRole === role.value;
                  return (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setValue('role', role.value, { shouldValidate: true })}
                      className={`
                        flex flex-col items-center justify-between p-3.5 rounded-xl border text-center
                        transition-all duration-200 cursor-pointer min-h-[128px] group
                        ${isSelected 
                          ? role.activeClass + ' border-transparent shadow-md shadow-slate-100' 
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50/50'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl transition-transform group-hover:scale-110 duration-200">{role.emoji}</span>
                        <span className="font-bold text-sm tracking-tight">{role.label}</span>
                      </div>
                      <span className={`text-[10px] leading-normal font-medium max-w-full tracking-tight px-0.5 ${isSelected ? 'text-current opacity-85' : 'text-slate-400'}`}>
                        {role.description}
                      </span>
                    </button>
                  );
                })}
              </div>
              
              {errors.role && (
                <p className="mt-2 text-xs font-semibold text-rose-500 flex items-center gap-1">
                  <span>⚠</span> {errors.role.message}
                </p>
              )}
            </div>

            {/* Terms of Service notice */}
            <p className="text-[11px] text-slate-400 text-center leading-relaxed px-4 pt-1">
              By creating an account, you explicitly acknowledge and agree to our{' '}
              <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">
                Terms of Service
              </span>{' '}
              and{' '}
              <span className="text-indigo-600 font-semibold cursor-pointer hover:underline">
                Privacy Policy
              </span>.
            </p>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center justify-center"
              size="lg"
              loading={isLoading}
            >
              Create Account
            </Button>

          </form>

          {/* Integration Separation Line */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase font-bold tracking-wider">
              <span className="bg-white px-3 text-slate-400">Already verified?</span>
            </div>
          </div>

          {/* Login Redirection Link */}
          <div className="text-center">
            <p className="text-slate-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 font-bold hover:text-indigo-700 transition-colors">
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