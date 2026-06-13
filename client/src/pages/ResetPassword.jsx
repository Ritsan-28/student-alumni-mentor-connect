import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import authService from '../api/authService';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  
  const [form, setForm] = useState({ otp: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Quick structural password confirmation check
    if (form.newPassword !== form.confirmPassword) {
      return toast.error("Passwords don't match");
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email,
        otp: form.otp,
        newPassword: form.newPassword,
      });
      toast.success('Password updated! Please log in with your new credentials.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Verification or update failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col items-center justify-center px-4 relative overflow-hidden">
      
      {/* Decorative Blur Ambient Elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/60 via-slate-50 to-slate-50 -z-10" />
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-200/20 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-md relative">

        {/* Brand Link and Headers */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 group cursor-pointer mb-5">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-sm tracking-wider">MC</span>
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-xl">
              Mentor<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Connect</span>
            </span>
          </Link>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reset password</h1>
          <p className="text-slate-500 mt-2 text-sm">Enter the authentication code securely routed to your device</p>
        </div>

        {/* Main Interface Box */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <Input
              label="Reset Code (OTP)"
              name="otp"
              placeholder="6-digit verification code"
              icon={KeyRound}
              value={form.otp}
              onChange={handleChange}
              maxLength={6}
              required
              className="focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl tracking-widest font-mono text-center placeholder:font-sans placeholder:tracking-normal"
            />

            <Input
              label="New Password"
              name="newPassword"
              type={showPassword ? 'text' : 'password'}
              icon={Lock}
              rightIcon={showPassword ? EyeOff : Eye}
              onRightIconClick={() => setShowPassword(!showPassword)}
              placeholder="••••••••"
              value={form.newPassword}
              onChange={handleChange}
              required
              className="focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl"
            />

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              icon={Lock}
              rightIcon={showConfirm ? EyeOff : Eye}
              onRightIconClick={() => setShowConfirm(!showConfirm)}
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={handleChange}
              required
              className="focus:border-indigo-500 focus:ring-indigo-500/20 rounded-xl"
            />

            <Button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg transition-all flex items-center justify-center"
              size="lg" 
              loading={isLoading}
            >
              Update Password
            </Button>
          </form>

          {/* Redirection Layer Footer */}
          <div className="mt-6 pt-2 text-center border-t border-slate-100">
            <Link 
              to="/login" 
              className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              ← Back to Login window
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ResetPassword;