
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // ADMIN CREDENTIALS
  const ADMIN_EMAIL = "naveedmir211@gmail.com";
  const ADMIN_PASS = "naveed11@";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    const isTargetAdminEmail = normalizedEmail === ADMIN_EMAIL.toLowerCase();

    if (isLogin) {
      // Login logic
      if (isTargetAdminEmail) {
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
        } else {
          setError('Incorrect password for admin account.');
        }
      } else if (email && password) {
        // Regular user login simulation
        onLogin({
          id: `user-${Math.random().toString(36).substr(2, 5)}`,
          name: name || email.split('@')[0],
          email: email,
          role: 'user',
          balance: 50.00,
          purchasedNotes: ['3'],
          uploadedNotes: []
        });
      } else {
        setError('Please enter both email and password.');
      }
    } else {
      // Registration logic
      if (!email || !password || (!isLogin && !name)) {
        setError('Please fill in all required fields.');
        return;
      }

      // If they try to register with admin email, they must use the admin password
      if (isTargetAdminEmail && password !== ADMIN_PASS) {
        setError('This email is reserved for Admin. Please use the correct password.');
        return;
      }

      const role: UserRole = isTargetAdminEmail ? 'admin' : 'user';
      
      onLogin({
        id: `u-${Math.random().toString(36).substr(2, 5)}`,
        name: name,
        email: email,
        role: role,
        balance: role === 'admin' ? 450.75 : 50.00,
        purchasedNotes: [],
        uploadedNotes: role === 'admin' ? ['1', '2', '4'] : []
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
      <div className="mb-8 text-center animate-fade-in">
         <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-200">
           <i className="fa-solid fa-book-open text-white text-3xl"></i>
         </div>
         <h1 className="text-3xl font-black text-slate-900 tracking-tight">NoteNexus</h1>
         <p className="text-slate-500 font-medium">Knowledge Sharing Marketplace</p>
      </div>

      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-slide-up">
        <div className="p-10">
          <div className="flex mb-8 bg-slate-100 p-1.5 rounded-2xl">
            <button 
              type="button"
              onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Sign In
            </button>
            <button 
              type="button"
              onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-xs font-bold flex items-center animate-shake border border-red-100">
                <i className="fa-solid fa-circle-exclamation mr-3 text-sm"></i>
                {error}
              </div>
            )}

            {!isLogin && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                    placeholder="Enter your name"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative">
                <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                  placeholder="name@gmail.com"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative">
                <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-300 shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100 flex items-center justify-center group"
            >
              <span>{isLogin ? 'Login to Nexus' : 'Create Account'}</span>
              <i className="fa-solid fa-chevron-right text-[10px] ml-3 group-hover:translate-x-1 transition-transform"></i>
            </button>
          </form>
        </div>
      </div>
      
      <p className="mt-8 text-slate-400 text-xs font-medium">
        Secure Academic Exchange &copy; {new Date().getFullYear()}
      </p>
    </div>
  );
};

export default Auth;
