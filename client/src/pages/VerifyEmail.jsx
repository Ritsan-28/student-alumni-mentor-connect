import { useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';
import Button from '../components/common/Button';
import authService from '../api/authService';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef([]);

  // Handle OTP input — auto-advance to next box
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // only digits allowed

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // take only last character
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace — go back to previous box
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste — fill all 6 boxes at once
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pasted)) {
      const newOtp = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
      setOtp(newOtp);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyEmail({ email, otp: otpString });
      toast.success('Email verified! You can now login.');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed';
      toast.error(message);
      // Clear OTP boxes on error
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Mail className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Check your email</h1>
          <p className="text-gray-500 mt-2">
            We sent a 6-digit code to
          </p>
          <p className="text-primary-600 font-semibold">{email}</p>
        </div>

        {/* Card */}
        <div className="card">
          <p className="text-sm text-gray-500 text-center mb-6">
            Enter the verification code below
          </p>

          {/* OTP Input Boxes */}
          <div className="flex gap-3 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`
                  w-12 h-14 text-center text-xl font-bold
                  border-2 rounded-xl outline-none transition-all duration-200
                  ${digit
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-300 text-gray-900'
                  }
                  focus:border-primary-500 focus:ring-2 focus:ring-primary-200
                `}
              />
            ))}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            className="w-full"
            size="lg"
            loading={isLoading}
          >
            Verify Email
          </Button>

          {/* Resend */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Didn't receive the code?{' '}
              <button
                onClick={async () => {
                  setIsResending(true);
                  try {
                    await authService.forgotPassword({ email });
                    toast.success('New code sent to your email!');
                  } catch {
                    toast.error('Could not resend code');
                  } finally {
                    setIsResending(false);
                  }
                }}
                disabled={isResending}
                className="text-primary-600 font-semibold hover:underline disabled:opacity-50"
              >
                {isResending ? 'Sending...' : 'Resend code'}
              </button>
            </p>
          </div>

          {/* Back to register */}
          <div className="mt-3 text-center">
            <Link to="/register" className="text-sm text-gray-400 hover:text-gray-600">
              ← Back to Register
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VerifyEmail;