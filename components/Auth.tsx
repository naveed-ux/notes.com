
import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { sendOtpEmail } from '../services/emailService';

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
  
  // OTP State - NEVER rendered or logged
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpInput, setOtpInput] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(0);

  // ADMIN CREDENTIALS
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
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSendOtp = async () => {
    setLoading(true);
    setError('');
    
    // Generate 6-digit code - processed only in memory
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);
    
    // Send to the Gmail provided by the user
    const result = await sendOtpEmail(email, name || 'User', code);
    
    if (result.success) {
      setStep('otp');
      setLoading(false);
      setTimer(60);
      // ABSOLUTELY NO in-app notification of the code.
    } else {
      setError('Communication failed. Please check your internet or configuration.');
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
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const normalizedEmail = email.trim().toLowerCase();
      
      // Admin Check
      if (normalizedEmail === ADMIN_EMAIL.toLowerCase()) {
        if (password === ADMIN_PASS) {
          onLogin({
            id: 'admin-001',
            name: 'Noveed Mir',
            email: ADMIN_EMAIL,
            role: 'admin',
            balance: 450.75,
            purchasedNotes: [],
            uploadedNotes: ['1', '2', '4']
          });
          return;
        } else {
          setError('Invalid credentials.');
          setLoading(false);
          return;
        }
      }

      const savedUsers = JSON.parse(localStorage.getItem('nn_users') || '[]');
      const existingUser = savedUsers.find((u: any) => u.email.toLowerCase() === normalizedEmail);

      if (existingUser) {
        if (existingUser.password === password) {
          onLogin(existingUser);
        } else {
          setError('Incorrect password.');
          setLoading(false);
        }
      } else {
        setError('No account found. Please register.');
        setLoading(false);
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
      setError('Please enter the full 6-digit code.');
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

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

      const savedUsers = JSON.parse(localStorage.getItem('nn_users') || '[]');
      savedUsers.push(newUser);
      localStorage.setItem('nn_users', JSON.stringify(savedUsers));

      onLogin(newUser);
    } else {
      setError('Invalid verification code. Check your Gmail inbox carefully.');
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    setError('');
    if (isNaN(Number(value))) return;
    const newOtp = [...otpInput];
    newOtp[index] = value.substring(value.length - 1);
    setOtpInput(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
      
      <div className="mb-8 text-center animate-fade-in">
         <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-200">
           <i className="fa-solid fa-book-open text-white text-3xl"></i>
         </div>
         <h1 className="text-3xl font-black text-slate-900 tracking-tight">NoteNexus</h1>
         <p className="text-slate-500 font-medium text-sm">Safe & Secure Authentication</p>
      </div>

      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-slide-up relative z-10">
        <div className="p-10">
          {step === 'form' ? (
            <>
              <div className="flex mb-8 bg-slate-100 p-1.5 rounded-2xl">
                <button 
                  type="button"
                  disabled={loading}
                  onClick={() => { setIsLogin(true); setError(''); }}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'} disabled:opacity-50`}
                >
                  Sign In
                </button>
                <button 
                  type="button"
                  disabled={loading}
                  onClick={() => { setIsLogin(false); setError(''); }}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'} disabled:opacity-50`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-[11px] font-bold flex items-start animate-shake border border-rose-100">
                    <i className="fa-solid fa-triangle-exclamation mr-3 text-sm mt-0.5"></i>
                    <span className="flex-1">{error}</span>
                  </div>
                )}

                {!isLogin && (
                  <div className="space-y-1.5 animate-fade-in">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative">
                      <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                      <input 
                        type="text" 
                        disabled={loading}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 shadow-sm bg-slate-50/50"
                        placeholder="Noveed Mir"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gmail Address</label>
                  <div className="relative">
                    <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      type="email" 
                      disabled={loading}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 shadow-sm bg-slate-50/50"
                      placeholder="example@gmail.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                  <div className="relative">
                    <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input 
                      type="password" 
                      disabled={loading}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 shadow-sm bg-slate-50/50"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-indigo-600 active:scale-[0.98] transition-all shadow-xl shadow-slate-200 flex items-center justify-center group disabled:opacity-70"
                >
                  {loading ? (
                    <i className="fa-solid fa-circle-notch fa-spin text-lg"></i>
                  ) : (
                    <>
                      <span>{isLogin ? 'Sign In' : 'Continue to Verification'}</span>
                      <i className={`fa-solid ${isLogin ? 'fa-right-to-bracket' : 'fa-paper-plane'} text-xs ml-3 group-hover:translate-x-1 transition-transform`}></i>
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="animate-fade-in space-y-8">
              <div className="text-center space-y-2">
                <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fa-solid fa-envelope-open-text text-emerald-600 text-2xl"></i>
                </div>
                <h2 className="text-2xl font-black text-slate-900">Verification Code</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  The OTP has been sent to:<br />
                  <span className="font-bold text-indigo-600">{email}</span>
                </p>
                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-[10px] text-indigo-700 font-bold uppercase tracking-tight">
                  <i className="fa-solid fa-circle-info mr-2"></i>
                  Please check your Gmail inbox now.
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-between gap-2">
                  {otpInput.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !digit && idx > 0) {
                          document.getElementById(`otp-${idx - 1}`)?.focus();
                        }
                      }}
                      className="w-12 h-14 text-center text-xl font-black bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-rose-500 text-[11px] font-bold text-center bg-rose-50 p-2 rounded-lg border border-rose-100">{error}</p>
                )}

                <button 
                  onClick={handleVerifyOtp}
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xl shadow-indigo-100 flex items-center justify-center"
                >
                  {loading ? <i className="fa-solid fa-circle-notch fa-spin"></i> : 'Confirm Verification'}
                </button>

                <div className="text-center space-y-4">
                  {timer > 0 ? (
                    <p className="text-slate-400 text-xs">Request new code in <span className="text-indigo-600 font-bold">{timer}s</span></p>
                  ) : (
                    <button 
                      onClick={handleSendOtp}
                      disabled={loading}
                      className="text-indigo-600 text-xs font-bold hover:underline"
                    >
                      Resend OTP to Gmail
                    </button>
                  )}
                  
                  <button 
                    onClick={() => { setStep('form'); setError(''); }}
                    className="block w-full text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-600"
                  >
                    <i className="fa-solid fa-arrow-left mr-2"></i> Use different email
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-xs font-medium relative z-10">
        NoteNexus Secure Identity Manager &copy; {new Date().getFullYear()}
      </p>

      {/* Aesthetic Background Accents */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[35rem] h-[35rem] bg-indigo-50 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[35rem] h-[35rem] bg-violet-50 rounded-full blur-3xl opacity-50"></div>
    </div>
  );
};

export default Auth;
