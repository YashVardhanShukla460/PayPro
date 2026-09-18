import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, ArrowRight, Lock, Mail, User, AlertCircle, Building2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, isLoading } = useAuth();

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'HR_ADMIN' | 'MANAGER' | 'EMPLOYEE'>('HR_ADMIN');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      if (isRegistering) {
        await register(name, email, password, role);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  // Quick 1-click test credentials
  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setErrorMessage(null);
    setEmail(quickEmail);
    setPassword(quickPass);
    try {
      await login(quickEmail, quickPass);
    } catch (err: any) {
      setErrorMessage(err.message || 'Quick login failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] flex flex-col justify-between text-[#18191B]">
      {/* Top Banner */}
      <header className="border-b border-[#E2E4DE] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#1B4332] text-white flex items-center justify-center font-mono text-sm font-bold rounded">
            P
          </div>
          <div>
            <span className="font-bold text-sm tracking-wider text-[#18191B]">
              PEOPLEPAY360
            </span>
            <span className="text-[11px] text-[#5F6773] block leading-none mt-0.5">
              Integrated HR & Payroll Operations Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#5F6773]">
          <Building2 className="w-3.5 h-3.5 text-[#1B4332]" />
          <span>Acme Technologies • Live SQLite Environment</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-white border border-[#E2E4DE] rounded-md shadow-sm p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#EAF2EC] text-[#1B4332] rounded mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secure Authentication</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#18191B]">
              {isRegistering ? 'Create Workspace Account' : 'Sign In to PeoplePay360'}
            </h1>
            <p className="text-xs text-[#5F6773] mt-1">
              {isRegistering
                ? 'Register your profile to access HR & payroll operations'
                : 'Access enterprise contracts, attendance registry, and pay runs'}
            </p>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-[#FEE2E2] border border-[#FECACA] rounded text-xs text-[#991B1B] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isRegistering && (
              <div>
                <label className="block font-semibold text-[#18191B] mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#8A92A0] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikram Malhotra"
                    className="w-full pl-9 pr-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-[#18191B] mb-1">Work Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#8A92A0] absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-9 pr-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#18191B] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#8A92A0] absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 border border-[#E2E4DE] rounded text-xs focus:outline-none focus:border-[#1B4332]"
                />
              </div>
            </div>

            {isRegistering && (
              <div>
                <label className="block font-semibold text-[#18191B] mb-1">Select Access Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#E2E4DE] rounded bg-white text-xs focus:outline-none focus:border-[#1B4332]"
                >
                  <option value="HR_ADMIN">HR Admin / Payroll Director (Full Privileges)</option>
                  <option value="MANAGER">Manager / Department Lead</option>
                  <option value="EMPLOYEE">Employee (Self-Service View)</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-[#1B4332] text-white font-semibold rounded text-xs hover:bg-[#143427] transition-colors flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Authenticating...' : isRegistering ? 'Register Account' : 'Sign In'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="mt-4 pt-4 border-t border-[#E2E4DE] text-center text-xs">
            {isRegistering ? (
              <button
                onClick={() => setIsRegistering(false)}
                className="text-[#1B4332] font-semibold hover:underline"
              >
                Already have an account? Sign in here
              </button>
            ) : (
              <button
                onClick={() => setIsRegistering(true)}
                className="text-[#1B4332] font-semibold hover:underline"
              >
                Need an account? Register new user
              </button>
            )}
          </div>

          {/* Quick Demo Credentials (1-Click Evaluation) */}
          <div className="mt-6 pt-5 border-t border-[#E2E4DE]">
            <span className="text-[10px] font-bold text-[#5F6773] uppercase tracking-wider block mb-2">
              1-Click Instant Role Evaluation
            </span>
            <div className="space-y-1.5">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@peoplepay360.com', 'admin123')}
                className="w-full text-left p-2 rounded border border-[#E2E4DE] bg-[#FBFBF9] hover:bg-[#EAF2EC] hover:border-[#C2DBC7] transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-xs text-[#18191B]">HR Admin • Vikram Malhotra</div>
                  <div className="text-[10px] text-[#5F6773]">admin@peoplepay360.com</div>
                </div>
                <span className="text-[10px] font-mono text-[#1B4332] font-semibold">HR_ADMIN →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('priya.verma@peoplepay360.internal', 'priya123')}
                className="w-full text-left p-2 rounded border border-[#E2E4DE] bg-[#FBFBF9] hover:bg-[#EAF2EC] hover:border-[#C2DBC7] transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-xs text-[#18191B]">Manager • Priya Verma</div>
                  <div className="text-[10px] text-[#5F6773]">priya.verma@peoplepay360.internal</div>
                </div>
                <span className="text-[10px] font-mono text-[#1B4332] font-semibold">MANAGER →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('rahul.sharma@peoplepay360.internal', 'rahul123')}
                className="w-full text-left p-2 rounded border border-[#E2E4DE] bg-[#FBFBF9] hover:bg-[#EAF2EC] hover:border-[#C2DBC7] transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-xs text-[#18191B]">Employee • Rahul Sharma</div>
                  <div className="text-[10px] text-[#5F6773]">rahul.sharma@peoplepay360.internal</div>
                </div>
                <span className="text-[10px] font-mono text-[#1B4332] font-semibold">EMPLOYEE →</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#E2E4DE] px-6 py-3 text-center text-[11px] text-[#5F6773]">
        PeoplePay360 Integrated HR & Payroll Operations • Built for Enterprise Scale
      </footer>
    </div>
  );
};
