
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { sendOtpEmail } from '../services/emailService';
import { fetchProfileByEmail, createProfile, isSupabaseConfigured } from '../services/supabaseService';

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthStep = 'form' | 'otp';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState<AuthStep>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [generatedOtp, setGeneratedOtp] = useState(''); 
  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);

  const ADMIN_EMAIL = "naveedmir211@gmail.com";
  const ADMIN_PASS = "naveed11@";

  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const validateEmail = (email: string) => {
    return String(email).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
  };

  const handleSendOtp = async () => {
    const targetEmail = email.trim();
    if (!targetEmail) {
      setError('Please enter your email address first.');
      return;
    }

    setLoading(true);
    setError('');
    
    // Cloud check
    if (isSupabaseConfigured && !isLogin) {
      const existing = await fetchProfileByEmail(targetEmail);
      if (existing) {
        setError('An account with this email already exists. Please Sign In.');
        setLoading(false);
        return;
      }
    }

    // Generate a random 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    
    const result = await sendOtpEmail(targetEmail, name || 'User', code);
    
    if (result.success) {
      setStep('otp');
      setLoading(false);
      setTimer(60);
    } else {
      setError(result.error || 'Could not send verification email.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !validateEmail(email)) {
      setError('Please enter a valid Gmail address.');
      return;
    }
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (isLogin) {
      setLoading(true);
      const normalizedEmail = email.trim().toLowerCase();
      
      // Admin bypass
      if (normalizedEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASS) {
        if (isSupabaseConfigured) {
          let adminUser = await fetchProfileByEmail(normalizedEmail);
          if (!adminUser) {
            adminUser = {
              id: 'admin-001',
              name: 'Noveed Mir',
              email: ADMIN_EMAIL,
              role: 'admin',
              balance: 0,
              purchasedNotes: [],
              uploadedNotes: [],
              password: ADMIN_PASS
            };
            await createProfile(adminUser);
          }
          onLogin(adminUser);
        } else {
          // Local Admin
          onLogin({
            id: 'admin-local',
            name: 'Noveed Mir (Local)',
            email: ADMIN_EMAIL,
            role: 'admin',
            balance: 0,
            purchasedNotes: [],
            uploadedNotes: [],
            password: ADMIN_PASS
          });
        }
        return;
      }

      if (isSupabaseConfigured) {
        const existingUser = await fetchProfileByEmail(normalizedEmail);
        if (existingUser) {
          if (existingUser.password === password) {
            onLogin(existingUser);
          } else {
            setError('Incorrect password.');
            setLoading(false);
          }
        } else {
          setError('No cloud account found. Please register.');
          setLoading(false);
        }
      } else {
        // Simple local mock login for dev without Supabase
        onLogin({
          id: `u-${Math.random().toString(36).substr(2, 5)}`,
          name: email.split('@')[0],
          email: email,
          role: 'user',
          balance: 0.00,
          purchasedNotes: [],
          uploadedNotes: [],
          password: password
        });
      }
    } else {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      handleSendOtp();
    }
  };

  const handleVerifyOtp = async () => {
    const enteredOtp = otpInput.join('');
    if (enteredOtp.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }

    setLoading(true);

    if (enteredOtp === generatedOtp) {
      const role: UserRole = email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';
      const newUser: User = {
        id: `u-${Math.random().toString(36).substr(2, 5)}`,
        name: name,
        email: email,
        role: role,
        balance: 0.00,
        purchasedNotes: [],
        uploadedNotes: [],
        password: password
      };

      try {
        if (isSupabaseConfigured) {
          await createProfile(newUser);
        }
        onLogin(newUser);
      } catch (err) {
        setError('Failed to create cloud profile.');
        setLoading(false);
      }
    } else {
      setError('Invalid code. Please check your Gmail inbox.');
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    setError('');
    if (isNaN(Number(value))) return;
    const newOtp = [...otpInput];
    newOtp[index] = value.substring(value.length - 1);
    setOtpInput(newOtp);
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      <div className="mb-8 text-center animate-fade-in">
         <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-200">
           <i className="fa-solid fa-book-open text-white text-3xl"></i>
         </div>
         <h1 className="text-3xl font-black text-slate-900 tracking-tight text-center">NoteNexus</h1>
         <p className="text-slate-500 font-medium text-sm">Official Academic Marketplace</p>
         {!isSupabaseConfigured && (
            <span className="mt-2 inline-block bg-amber-100 text-amber-700 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded">
              Local Preview Mode
            </span>
         )}
      </div>

      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-slide-up relative z-10">
        <div className="p-10">
          {step === 'form' ? (
            <>
              <div className="flex mb-8 bg-slate-100 p-1.5 rounded-2xl">
                <button type="button" disabled={loading} onClick={() => { setIsLogin(true); setError(''); }} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Sign In</button>
                <button type="button" disabled={loading} onClick={() => { setIsLogin(false); setError(''); }} className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Register</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-[11px] font-bold border border-rose-100 animate-shake flex flex-col">
                    <div className="flex items-start">
                      <i className="fa-solid fa-triangle-exclamation mr-2 mt-0.5"></i>
                      <span>{error}</span>
                    </div>
                  </div>
                )}
                {!isLogin && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input type="text" disabled={loading} value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50" placeholder="e.g. John Doe" />
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gmail Address</label>
                  <input type="email" disabled={loading} value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50" placeholder="yourname@gmail.com" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <input type="password" disabled={loading} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50/50" placeholder="••••••••" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-indigo-600 transition-all flex items-center justify-center disabled:opacity-70">
                  {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : (isLogin ? 'Sign In' : 'Register & Send OTP')}
                </button>
              </form>
            </>
          ) : (
            <div className="animate-fade-in space-y-8 text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fa-solid fa-envelope-open-text text-emerald-600 text-2xl"></i>
              </div>
              <h2 className="text-2xl font-black text-slate-900">Enter OTP Code</h2>
              <p className="text-sm text-slate-500">
                A 6-digit verification code has been sent to <span className="font-bold text-indigo-600">{email}</span>. Please check your inbox.
              </p>
              
              <div className="flex justify-between gap-2">
                {otpInput.map((digit, idx) => (
                  <input key={idx} id={`otp-${idx}`} type="text" maxLength={1} value={digit} onChange={(e) => handleOtpChange(idx, e.target.value)} onKeyDown={(e) => e.key === 'Backspace' && !digit && idx > 0 && document.getElementById(`otp-${idx - 1}`)?.focus()} className="w-12 h-14 text-center text-xl font-black bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none" />
                ))}
              </div>
              {error && <p className="text-rose-500 text-[11px] font-bold">{error}</p>}
              
              <div className="space-y-4">
                <button onClick={handleVerifyOtp} disabled={loading} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl">Confirm & Verify</button>
                <button onClick={() => setStep('form')} className="block w-full text-slate-400 text-[10px] font-black uppercase tracking-widest mt-4">Edit email address</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <p className="mt-8 text-slate-400 text-xs font-medium">Cloud Identity Sync &copy; {new Date().getFullYear()}</p>
    </div>
  );
};

export default Auth;
