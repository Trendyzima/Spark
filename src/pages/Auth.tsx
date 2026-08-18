import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/lib/auth';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@supabase/supabase-js';
import type { AuthUser } from '@/types';

function mapSupabaseUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email!,
    username: user.user_metadata?.username || user.user_metadata?.full_name || user.email!.split('@')[0],
    avatar: user.user_metadata?.avatar_url || user.user_metadata?.picture,
  };
}

export function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authService.sendOtp(email);
      toast({
        title: 'OTP Sent',
        description: `Check your email at ${email}`,
      });
      setStep('otp');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      setLoading(true);
      try {
        const user = await authService.signInWithPassword(email, otp);
        login(mapSupabaseUser(user));
        navigate('/setup-profile');
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        setLoading(false);
      }
    } else {
      setStep('password');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await authService.verifyOtpAndSetPassword(email, otp, password, username);
      login(mapSupabaseUser(user));
      navigate('/setup-profile');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await authService.signInWithPassword(email, password);
      login(mapSupabaseUser(user));
      navigate('/setup-profile');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 gradient-primary">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-2xl">
            <Heart className="w-10 h-10 text-primary fill-current" />
          </div>
          <h1 className="text-5xl font-bold text-white">Spark</h1>
          <p className="text-white/90 text-lg">Find your perfect match</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-muted-foreground">
              {step === 'email' && 'Enter your email to continue'}
              {step === 'otp' && 'Enter the OTP sent to your email'}
              {step === 'password' && (isLogin ? 'Enter your password' : 'Set up your account')}
            </p>
          </div>

          {step === 'email' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12"
              />
              <Button
                type="submit"
                className="w-full h-12 gradient-primary text-white"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Continue'}
              </Button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={isLogin ? handleLogin : handleVerifyOtp} className="space-y-4">
              <Input
                type="text"
                placeholder="Enter 4-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={4}
                required
                className="h-12 text-center text-2xl tracking-widest"
              />
              {isLogin && (
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                />
              )}
              <Button
                type="submit"
                className="w-full h-12 gradient-primary text-white"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Continue'}
              </Button>
            </form>
          )}

          {step === 'password' && !isLogin && (
            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="h-12"
              />
              <Input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12"
              />
              <Button
                type="submit"
                className="w-full h-12 gradient-primary text-white"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          )}

          <div className="text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setStep('email');
                setOtp('');
                setPassword('');
              }}
              className="text-sm text-primary hover:underline"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
