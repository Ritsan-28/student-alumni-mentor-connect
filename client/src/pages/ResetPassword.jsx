import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import authService from '../api/authService';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';
  const [form, setForm] = useState({ otp: '', newPassword: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      toast.success('Password reset successfully! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reset password</h1>
          <p className="text-gray-500 mt-2">Enter the code from your email</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Reset Code (OTP)"
              name="otp"
              placeholder="6-digit code"
              value={form.otp}
              onChange={handleChange}
              maxLength={6}
              required
            />
            <Input
              label="New Password"
              name="newPassword"
              type="password"
              icon={Lock}
              placeholder="Min 8 chars, upper, lower, number"
              value={form.newPassword}
              onChange={handleChange}
              required
            />
            <Input
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              icon={Lock}
              placeholder="Re-enter new password"
              value={form.confirmPassword}
              onChange={handleChange}
              required
            />
            <Button type="submit" className="w-full" size="lg" loading={isLoading}>
              Reset Password
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/login" className="text-sm text-gray-400 hover:text-gray-600">
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;