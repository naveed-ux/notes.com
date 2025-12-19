
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const isAdmin = user.role === 'admin';

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors">
              <i className="fa-solid fa-book-open text-white"></i>
            </div>
            <span className="text-slate-900 text-xl font-bold tracking-tight">NoteNexus</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`${isActive('/') ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-indigo-600'} transition-colors`}
            >
              Marketplace
            </Link>
            <Link 
              to="/dashboard" 
              className={`${isActive('/dashboard') ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-indigo-600'} transition-colors`}
            >
              My Library
            </Link>
            {isAdmin && (
              <Link 
                to="/upload" 
                className={`flex items-center space-x-2 ${isActive('/upload') ? 'text-indigo-600 font-semibold' : 'text-slate-600 hover:text-indigo-600'} transition-colors`}
              >
                <i className="fa-solid fa-cloud-arrow-up text-indigo-400"></i>
                <span>Admin Panel</span>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-6">
            {isAdmin && (
              <div className="hidden sm:flex flex-col items-end mr-2 text-right">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider leading-none mb-1">
                  Revenue
                </span>
                <span className="text-emerald-600 font-bold leading-none">₹{user.balance.toFixed(2)}</span>
              </div>
            )}
            
            <div className="flex items-center space-x-3 group relative">
              <Link to="/profile" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center border-2 border-slate-100 overflow-hidden cursor-pointer hover:border-indigo-400 transition-all relative">
                  <img src={`https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`} alt="Avatar" />
                  {isAdmin && (
                    <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white w-4 h-4 rounded-full flex items-center justify-center border border-white">
                      <i className="fa-solid fa-crown text-[8px]"></i>
                    </div>
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-bold text-slate-900 leading-tight">{user.name}</div>
                  <div className="text-[10px] text-slate-400 font-medium">View Profile</div>
                </div>
              </Link>
              
              <div className="h-6 w-px bg-slate-200 mx-1"></div>
              
              <button 
                onClick={onLogout}
                className="text-slate-400 hover:text-red-500 transition-colors flex flex-col items-center"
                title="Log Out"
              >
                <i className="fa-solid fa-right-from-bracket text-lg"></i>
                <span className="text-[9px] font-bold uppercase mt-0.5">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
