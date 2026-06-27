import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Eye, EyeOff, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

const Spinner = ({ size = 14, className = "" }) => (
  <svg className={`animate-spin ${className}`} style={{ width: size, height: size }} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const GitHubIcon = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0012 2z" />
  </svg>
);

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});

  // Loading states for different actions
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningInGithub, setIsSigningInGithub] = useState(false);
  const [isSigningInGoogle, setIsSigningInGoogle] = useState(false);
  const [isSigningInDemo, setIsSigningInDemo] = useState(false);

  const { login, register, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Real-time input change & validation helper
  const handleInputChange = (field, val) => {
    if (field === 'email') setEmail(val);
    if (field === 'password') setPassword(val);
    if (field === 'username') setUsername(val);

    setErrors(prev => {
      const nextErrors = { ...prev };
      if (field === 'email') {
        if (!val) {
          nextErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(val)) {
          nextErrors.email = 'Email is invalid';
        } else {
          delete nextErrors.email;
        }
      }
      if (field === 'password') {
        if (!val) {
          nextErrors.password = 'Password is required';
        } else if (val.length < 8) {
          nextErrors.password = 'Password must be at least 8 characters';
        } else {
          delete nextErrors.password;
        }
      }
      if (field === 'username') {
        if (!val) {
          nextErrors.username = 'Username is required';
        } else if (!/^[a-zA-Z0-9_]+$/.test(val)) {
          nextErrors.username = 'Username can only contain letters, numbers, and underscores';
        } else {
          delete nextErrors.username;
        }
      }
      return nextErrors;
    });
  };

  const validate = () => {
    const tempErrors = {};
    if (!email) tempErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) tempErrors.email = 'Email is invalid';

    if (!password) tempErrors.password = 'Password is required';
    else if (password.length < 8) tempErrors.password = 'Password must be at least 8 characters';

    if (!isLogin) {
      if (!username) tempErrors.username = 'Username is required';
      else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        tempErrors.username = 'Username can only contain letters, numbers, and underscores';
      }
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSigningIn(true);
    if (isLogin) {
      const res = await login(email, password);
      if (res.success) {
        toast.success('Successfully logged in');
        navigate('/dashboard');
      } else {
        toast.error(res.error);
      }
    } else {
      const res = await register(username, email, password);
      if (res.success) {
        toast.success('Registration successful');
        navigate('/dashboard');
      } else {
        toast.error(res.error);
      }
    }
    setIsSigningIn(false);
  };

  // Automated Frictionless Demo Guest Login Flow
  const handleDemoLogin = async () => {
    setIsSigningInDemo(true);
    const demoEmail = 'demo@example.com';
    const demoPassword = 'Password123!';
    
    // Attempt Login
    let res = await login(demoEmail, demoPassword);
    if (res.success) {
      toast.success('Logged in as Guest Demo user', { icon: '💼' });
      navigate('/dashboard');
    } else {
      // If user does not exist or login failed, attempt to automatically register first
      toast.loading('Initializing demo environment...', { id: 'demo-init', duration: 1500 });
      const regRes = await register('DemoGuest', demoEmail, demoPassword);
      if (regRes.success) {
        toast.success('Demo guest account initialized & logged in!', { id: 'demo-init' });
        navigate('/dashboard');
      } else {
        toast.error('Could not initialize demo user: ' + regRes.error, { id: 'demo-init' });
      }
    }
    setIsSigningInDemo(false);
  };

  const handleOAuthLogin = async (provider) => {
    if (provider === 'github') {
      setIsSigningInGithub(true);
      setTimeout(() => {
        toast('GitHub SSO simulated!', { icon: '🐙' });
        setIsSigningInGithub(false);
      }, 1000);
    } else {
      setIsSigningInGoogle(true);
      setTimeout(() => {
        toast('Google SSO simulated!', { icon: '🔍' });
        setIsSigningInGoogle(false);
      }, 1000);
    }
  };

  const getPasswordStrength = (val) => {
    if (!val) return { score: 0, label: '', color: 'bg-muted' };
    if (val.length < 8) return { score: 1, label: 'Too Short', color: 'bg-error-text' };

    let score = 1;
    if (val.length >= 10) score += 1;
    if (/[0-9]/.test(val)) score += 1;
    if (/[A-Z]/.test(val)) score += 1;
    if (/[^A-Za-z0-9]/.test(val)) score += 1;

    if (score <= 2) return { score: 2, label: 'Weak', color: 'bg-error-text' };
    if (score === 3) return { score: 3, label: 'Moderate', color: 'bg-warning-text' };
    return { score: 4, label: 'Strong', color: 'bg-success-text' };
  };

  const strength = getPasswordStrength(password);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const isAnyLoading = isSigningIn || isSigningInGithub || isSigningInGoogle || isSigningInDemo;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 min-h-[calc(100vh-3.5rem)] bg-page">
      {/* Left Column - Product Marketing / Context (Hidden on mobile) */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-subtle border-r border-border-default select-none">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-accent-primary flex items-center justify-center">
            <span className="text-white font-bold text-base">P</span>
          </div>
          <span className="font-bold text-lg text-text-primary tracking-tight">Optimus PM</span>
        </div>

        <div className="space-y-6 my-auto max-w-md">
          <h2 className="text-3xl font-extrabold tracking-tight text-text-primary leading-tight">
            Refined Project Control.
          </h2>
          <p className="text-sm text-text-secondary leading-relaxed">
            Organize tasks, collaborate with team members, and check active metrics from a single clean interface.
          </p>

          <div className="space-y-4 pt-4 border-t border-border-default">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-accent-subtle text-accent-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</div>
              <div>
                <h4 className="text-xs font-bold text-text-primary">Drag-and-Drop Board</h4>
                <p className="text-[11px] text-text-secondary">Instant visual task tracking with automatic server persistence.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-accent-subtle text-accent-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</div>
              <div>
                <h4 className="text-xs font-bold text-text-primary">OWASP Security Standard</h4>
                <p className="text-[11px] text-text-secondary">Strict rate limiters, salted hashing, and rotation tokens protect your account.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-accent-subtle text-accent-primary flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</div>
              <div>
                <h4 className="text-xs font-bold text-text-primary">Team Management</h4>
                <p className="text-[11px] text-text-secondary">Invite members instantly and assign them directly to cards.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-text-tertiary">
          Optimus PM — Created for OptimusAutomate Tracks
        </div>
      </div>

      {/* Right Column - Auth Form */}
      <div className="flex items-center justify-center p-8 bg-page">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center md:text-left">
            <div className="mx-auto md:mx-0 flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary mb-4 md:hidden">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary">
              {isLogin ? 'Sign in to your account' : 'Create a new account'}
            </h2>
            <p className="mt-1 text-xs text-text-secondary">
              {isLogin ? 'Or ' : 'Already have an account? '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                  setPassword('');
                }}
                className="font-semibold text-accent-primary hover:text-accent-hover transition-colors"
                disabled={isAnyLoading}
              >
                {isLogin ? 'create a new account' : 'sign in instead'}
              </button>
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <Input
                id="username"
                label="Username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                error={errors.username}
                disabled={isAnyLoading}
              />
            )}

            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={errors.email}
              disabled={isAnyLoading}
            />

            <div className="relative">
              <Input
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={errors.password}
                disabled={isAnyLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bottom-2.5 text-text-secondary hover:text-text-primary focus:outline-none"
                disabled={isAnyLoading}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Checkbox and Forgot Password link */}
            <div className="flex items-center justify-between mt-1 select-none">
              <label className="flex items-center gap-2 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="rounded border-border-default text-accent-primary focus:ring-accent-primary/20 h-3.5 w-3.5 bg-page"
                  disabled={isAnyLoading}
                />
                <span className="text-text-secondary">Remember me</span>
              </label>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toast('Password reset link simulated!', { icon: '🔑' });
                }}
                className="text-xs text-accent-primary hover:text-accent-hover font-semibold"
              >
                Forgot Password?
              </a>
            </div>

            {/* Password strength checklist */}
            {!isLogin && password && (
              <div className="mt-3 space-y-2 border border-border-default rounded p-3 bg-subtle">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-text-secondary font-medium">Password Strength:</span>
                  <span className="font-bold text-text-primary">{strength.label}</span>
                </div>
                <div className="h-1 w-full bg-muted rounded overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: `${(strength.score / 4) * 100}%` }} />
                </div>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1 text-[10px] text-text-secondary select-none">
                  <div className="flex items-center gap-1.5">
                    <span className={hasMinLength ? 'text-success-text font-bold' : 'text-text-tertiary'}>{hasMinLength ? '✓' : '•'}</span>
                    <span className={hasMinLength ? 'text-text-primary' : 'text-text-secondary'}>8+ Characters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={hasUppercase ? 'text-success-text font-bold' : 'text-text-tertiary'}>{hasUppercase ? '✓' : '•'}</span>
                    <span className={hasUppercase ? 'text-text-primary' : 'text-text-secondary'}>Uppercase Letter</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={hasNumber ? 'text-success-text font-bold' : 'text-text-tertiary'}>{hasNumber ? '✓' : '•'}</span>
                    <span className={hasNumber ? 'text-text-primary' : 'text-text-secondary'}>Number (0-9)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={hasSpecial ? 'text-success-text font-bold' : 'text-text-tertiary'}>{hasSpecial ? '✓' : '•'}</span>
                    <span className={hasSpecial ? 'text-text-primary' : 'text-text-secondary'}>Special Character</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2 mt-6">
              <Button
                type="submit"
                variant="primary"
                className="w-full py-2.5 flex items-center justify-center gap-2"
                disabled={isAnyLoading}
              >
                {isSigningIn && <Spinner />}
                {isSigningIn ? 'Processing...' : isLogin ? 'Sign in' : 'Create Account'}
              </Button>

              {isLogin && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleDemoLogin}
                  className="w-full py-2.5 flex items-center justify-center gap-2 border border-border-strong bg-subtle hover:bg-muted text-text-primary font-bold shadow-none"
                  disabled={isAnyLoading}
                >
                  {isSigningInDemo && <Spinner />}
                  {isSigningInDemo ? 'Accessing Workspace...' : 'Sign in as Demo Guest'}
                </Button>
              )}
            </div>
          </form>

          {/* Social OAuth Split Line */}
          <div className="relative my-6 flex items-center justify-center border-t border-border-default">
            <span className="absolute bg-page px-3 text-[10px] text-text-tertiary uppercase font-bold tracking-wider select-none">
              Or continue with
            </span>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Button
              variant="secondary"
              onClick={() => handleOAuthLogin('github')}
              className="py-2 text-xs flex items-center justify-center gap-2 font-semibold shadow-none border border-border-default"
              disabled={isAnyLoading}
            >
              {isSigningInGithub ? <Spinner /> : <GitHubIcon />} GitHub
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleOAuthLogin('google')}
              className="py-2 text-xs flex items-center justify-center gap-2 font-semibold shadow-none border border-border-default"
              disabled={isAnyLoading}
            >
              {isSigningInGoogle ? (
                <Spinner />
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
              )}
              Google
            </Button>
          </div>

          {/* Security Context Banner */}
          <div className="border border-border-default rounded p-3 bg-subtle text-[10px] text-text-secondary flex gap-2.5 items-start mt-6">
            <Shield size={15} className="text-accent-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-text-primary">Enterprise Security Active</p>
              <p className="leading-relaxed mt-0.5">Your credentials are encrypted using bcrypt (12 rounds). Session access tokens are automatically rotated and cookies are signed with HttpOnly flag.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
