import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, ArrowLeft } from 'lucide-react';
import Button from '../components/common/Button';
import authService from '../api/authService';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  // Auto-focus first input box on component mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // Cooldown timer logic for code resending
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle core verification action
  const handleVerify = useCallback(async (otpArray) => {
    const currentOtp = otpArray || otp;
    const otpString = currentOtp.join('');
    
    if (otpString.length !== 6) {
      toast.error('Please enter all 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyEmail({ email, otp: otpString });
      toast.success('Email verified! Redirecting to login...');
      navigate('/login');
    } catch (error) {
      const message = error.response?.data?.message || 'Verification failed';
      toast.error(message);
      // Reset input layout state on rejection
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  }, [email, otp, navigate]);

  // Handles character updates inside single inputs
  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; 

    const newOtp = [...otp];
    const targetValue = value.length > 1 ? value.charAt(value.length - 1) : value;
    newOtp[index] = targetValue;
    setOtp(newOtp);

    // If this change fills the 6-digit code, auto-submit right from the user event
    if (newOtp.join('').length === 6) {
      handleVerify(newOtp);
      return;
    }

    // Auto-advance structural focus to next target
    if (targetValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
      setTimeout(() => inputRefs.current[index + 1]?.select(), 0);
    }
  };

  // Keyboard accessibility and deletion flow
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Global paste handler over row element
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().slice(0, 6);
    
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      while (newOtp.length < 6) newOtp.push('');
      
      setOtp(newOtp);
      
      // If full code pasted, auto-submit directly from event handler
      if (pastedData.length === 6) {
        handleVerify(newOtp);
      } else {
        const focusIndex = Math.min(pastedData.length, 5);
        inputRefs.current[focusIndex]?.focus();
      }
    } else {
      toast.error('Pasted code must contain numbers only');
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    try {
      await authService.resendVerificationCode({ email });
      toast.success('A fresh 6-digit code has been sent!');
      setCountdown(30);
    } catch (error) {
      const message = error.response?.data?.message || 'Could not resend code';
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Brand Display Context */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-full mb-4 shadow-sm">
            <Mail className="h-6 w-6 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Verify your email</h1>
          <p className="text-sm text-gray-500 mt-2">
            We've sent a 6-digit code to
          </p>
          <p className="text-sm font-semibold text-gray-700 mt-0.5 break-all">{email || 'your email'}</p>
        </div>

        {/* Input Interface Block */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider text-center mb-5">
            Security Code
          </p>

          <div className="flex gap-2.5 justify-center mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onFocus={(e) => e.target.select()}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className={`
                  w-12 h-14 text-center text-2xl font-bold
                  border-2 rounded-xl outline-none transition-all duration-150
                  ${digit
                    ? 'border-primary-500 bg-primary-50/50 text-primary-700 font-extrabold'
                    : 'border-gray-200 text-gray-900 focus:border-primary-500'
                  }
                  focus:ring-4 focus:ring-primary-500/10
                `}
              />
            ))}
          </div>

          <Button
            onClick={() => handleVerify()}
            className="w-full font-medium py-3 rounded-xl shadow-sm transition-all duration-150 active:scale-[0.99]"
            size="lg"
            loading={isLoading}
            disabled={otp.join('').length !== 6}
          >
            Verify Email
          </Button>

          {/* Fallback code requests */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Didn't receive the code?{' '}
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isResending || countdown > 0}
                className="text-primary-600 font-semibold hover:text-primary-700 hover:underline disabled:opacity-50 disabled:no-underline transition-colors duration-150"
              >
                {isResending 
                  ? 'Sending...' 
                  : countdown > 0 
                    ? `Resend in ${countdown}s` 
                    : 'Resend code'
                }
              </button>
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center">
            <Link 
              to="/register" 
              className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Register
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default VerifyEmail;