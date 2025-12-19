
import React from 'react';
import { User, Note } from '../types';
import NoteCard from './NoteCard';

interface ProfileProps {
  user: User;
  notes: Note[];
}

const Profile: React.FC<ProfileProps> = ({ user, notes }) => {
  const isAdmin = user.role === 'admin';
  const purchasedNotes = notes.filter(n => user.purchasedNotes.includes(n.id));

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Profile Header Card */}
      <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600"></div>
        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-12 space-y-4 md:space-y-0 md:space-x-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-[2rem] bg-white p-1.5 shadow-xl border border-slate-100">
                <img 
                  src={`https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff&size=256`} 
                  alt={user.name} 
                  className="w-full h-full rounded-[1.75rem] object-cover"
                />
              </div>
              {isAdmin && (
                <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white w-8 h-8 rounded-xl flex items-center justify-center border-4 border-white shadow-lg">
                  <i className="fa-solid fa-crown text-xs"></i>
                </div>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left pb-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user.name}</h1>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 mt-2">
                <span className="flex items-center text-slate-500 text-sm">
                  <i className="fa-solid fa-envelope mr-2 text-indigo-400"></i>
                  {user.email}
                </span>
                <span className="flex items-center text-slate-500 text-sm">
                  <i className="fa-solid fa-shield-halved mr-2 text-indigo-400"></i>
                  {isAdmin ? 'Administrator' : 'Premium Student'}
                </span>
              </div>
            </div>

            <div className="pb-2">
              <button className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100 flex items-center">
                <i className="fa-solid fa-pen-to-square mr-2 text-xs"></i>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Statistics Column */}
        <div className="space-y-6">
          {isAdmin && (
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Financial Overview</h3>
              <div className="space-y-6">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                    Platform Earnings
                  </div>
                  <div className="text-4xl font-black text-indigo-600 tracking-tight">
                    ₹{user.balance.toFixed(2)}
                  </div>
                </div>
                
                <button className="w-full bg-indigo-50 text-indigo-600 py-4 rounded-2xl font-bold hover:bg-indigo-100 transition-all flex items-center justify-center space-x-2">
                  <i className="fa-solid fa-plus-circle text-sm"></i>
                  <span>Withdraw Funds</span>
                </button>
              </div>
            </div>
          )}

          <div className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Account Status</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">Member Since</span>
                  <span className="font-bold">March 2024</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">Total Purchased</span>
                  <span className="font-bold">{user.purchasedNotes.length} Notes</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-slate-800">
                  <span className="text-slate-400 text-sm">Total Reviews</span>
                  <span className="font-bold">12 Reviews</span>
                </div>
              </div>
            </div>
            <i className="fa-solid fa-shield-halved absolute -bottom-8 -right-8 text-white/5 text-[10rem] -rotate-12"></i>
          </div>
        </div>

        {/* Purchased Notes Grid Column */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">My Purchased Collection</h2>
            <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              {purchasedNotes.length} Items
            </span>
          </div>

          {purchasedNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {purchasedNotes.map(note => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-200 shadow-sm">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-book-open text-slate-300 text-4xl"></i>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No notes purchased</h3>
              <p className="text-slate-500 mb-8 max-w-xs mx-auto">Start building your knowledge library by browsing the latest expert notes.</p>
              <a href="#/" className="inline-flex items-center bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                Explore Marketplace
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
