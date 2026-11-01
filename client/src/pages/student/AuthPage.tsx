import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Sparkles, GraduationCap, ShieldCheck, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

export const AuthPage: React.FC = () => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = (location.state as { from?: string })?.from || '/quests';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (tab === 'register' && !email.trim().toLowerCase().endsWith('@vitapstudent.ac.in')) {
      setError('Registration is strictly restricted to emails ending with @vitapstudent.ac.in');
      setIsSubmitting(false);
      return;
    }

    try {
      if (tab === 'register') {
        const user = await register(name, email, password);
        if (user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate(redirectPath);
        }
      } else {
        const user = await login(email, password);
        if (user.role === 'ADMIN') {
          navigate('/admin');
        } else {
          navigate(redirectPath);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick helper for live demo testing
  const handleQuickFill = (role: 'admin' | 'student') => {
    if (role === 'admin') {
      setTab('login');
      setEmail('admin@college.edu');
      setPassword('Admin@123');
    } else {
      setTab('login');
      setEmail('aisha@college.edu');
      setPassword('Student@123');
    }
  };

  return (
    <div className="min-h-screen bg-cream px-4 py-8 flex flex-col justify-center items-center">
      {/* Brand Header */}
      <div className="text-center max-w-md mx-auto mb-6">
        <div className="inline-flex items-center gap-2 bg-yellow text-ink border-2.5 border-ink px-4 py-1.5 rounded-full font-heading font-black text-xs uppercase tracking-wider shadow-hard-sm mb-3">
          <Sparkles className="w-4 h-4 fill-ink" />
          CAMPUS ONBOARDING PLATFORM
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-ink tracking-tight mb-2">
          Your campus is a game.
        </h1>
        <p className="font-heading font-extrabold text-xl sm:text-2xl text-violet">
          Start playing. 🚀
        </p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white border-3 border-ink rounded-3xl shadow-hard-xl p-6 sm:p-8">
        {/* Tab switch */}
        <div className="grid grid-cols-2 gap-2 bg-cream p-1.5 rounded-2xl border-2 border-ink mb-6">
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={clsx(
              'py-2 rounded-xl text-sm font-heading font-extrabold transition-all border-2',
              tab === 'login'
                ? 'bg-yellow text-ink border-ink shadow-hard-sm'
                : 'border-transparent text-gray-500 hover:text-ink'
            )}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={clsx(
              'py-2 rounded-xl text-sm font-heading font-extrabold transition-all border-2',
              tab === 'register'
                ? 'bg-yellow text-ink border-ink shadow-hard-sm'
                : 'border-transparent text-gray-500 hover:text-ink'
            )}
          >
            Register
          </button>
        </div>

        {/* Error message banner */}
        {error && (
          <div className="mb-4 p-3.5 rounded-2xl bg-pink-light/40 border-2.5 border-pink text-ink text-xs font-heading font-bold shadow-hard-sm">
            🚨 {error}
          </div>
        )}

        {/* Domain notice for registration (US-01) */}
        {tab === 'register' && (
          <div className="mb-4 p-3 rounded-2xl bg-sky/20 border-2 border-sky text-ink text-xs flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-sky-dark shrink-0 mt-0.5" />
            <span>
              <strong>VIT-AP email required:</strong> Registration is restricted to <code>@vitapstudent.ac.in</code> addresses.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <Input
              label="Full Name"
              placeholder="e.g. Maya Lin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}

          <Input
            label="College Email"
            type="email"
            placeholder="student@vitapstudent.ac.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="violet"
            size="lg"
            fullWidth
            disabled={isSubmitting}
            className="mt-2"
          >
            {isSubmitting ? 'Please wait...' : tab === 'login' ? 'Let’s Go!' : 'Create My Passport'}
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </Button>
        </form>

        {/* Demo Fast Login Buttons */}
        <div className="mt-6 pt-5 border-t-2 border-ink/10 text-center">
          <p className="text-xs font-mono font-bold text-gray-500 mb-2 uppercase tracking-wider">
            Fast Demo Logins:
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('student')}
              className="text-xs font-heading font-bold px-3 py-1.5 rounded-xl border-2 border-ink bg-yellow hover:bg-yellow-dark shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5"
            >
              👩‍🎓 Student (Aisha)
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="text-xs font-heading font-bold px-3 py-1.5 rounded-xl border-2 border-ink bg-pink text-ink hover:bg-pink-dark shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5"
            >
              🛡️ Admin Desk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
