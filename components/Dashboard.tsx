
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Note, AdConfig } from '../types';
import NoteCard from './NoteCard';

interface DashboardProps {
  user: User;
  notes: Note[];
  onDeleteNote: (id: string) => void;
  revenueShare: number;
  setRevenueShare: (val: number) => void;
  adConfig: AdConfig;
  setAdConfig: React.Dispatch<React.SetStateAction<AdConfig>>;
}

const Dashboard: React.FC<DashboardProps> = ({ user, notes, onDeleteNote, revenueShare, setRevenueShare, adConfig, setAdConfig }) => {
  const isAdmin = user.role === 'admin';
  const purchased = notes.filter(n => user.purchasedNotes.includes(n.id));
  const uploaded = notes.filter(n => user.uploadedNotes.includes(n.id));

  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);

  const adRev = user.adRevenue || 0;
  const totalEarnings = user.balance + adRev;

  const handleWithdraw = () => {
    if (totalEarnings < 500) {
      alert("Minimum withdrawal amount is ₹500.00");
      return;
    }
    setWithdrawing(true);
    setTimeout(() => {
      setWithdrawing(false);
      setWithdrawn(true);
      alert("Withdrawal request submitted! You will receive ₹" + totalEarnings.toFixed(2) + " via your registered UPI ID within 24 hours.");
    }, 2500);
  };

  return (
    <div className="space-y-12 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
           <div className="flex items-center space-x-3 mb-2">
             <h1 className="text-4xl font-black text-slate-900">Earnings Center</h1>
             {isAdmin && <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center"><i className="fa-solid fa-crown mr-1.5"></i> Admin</span>}
           </div>
           <p className="text-slate-500">Managing your platform's monetization and content.</p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center space-x-6 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
             <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-50 text-emerald-600">
                   <i className="fa-solid fa-wallet text-xl"></i>
                </div>
                <div>
                   <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Available Balance</div>
                   <div className="text-2xl font-black text-slate-900">₹{totalEarnings.toFixed(2)}</div>
                </div>
             </div>
             <button 
              onClick={handleWithdraw}
              disabled={withdrawing || withdrawn}
              className={`px-6 py-3 rounded-2xl font-bold transition-all ${withdrawn ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-900 text-white hover:bg-indigo-600'}`}
             >
               {withdrawing ? <i className="fa-solid fa-circle-notch fa-spin"></i> : (withdrawn ? 'Request Sent' : 'Withdraw')}
             </button>
          </div>
        )}
      </header>

      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ad Monetization Hub */}
          <section className="lg:col-span-2 bg-slate-900 rounded-[2.5rem] p-8 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center">
                    <i className="fa-solid fa-rectangle-ad text-emerald-400 mr-3"></i>Ad Revenue Stream
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">Global platform ads performance.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${adConfig.enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {adConfig.enabled ? 'Live' : 'Paused'}
                  </span>
                  <button 
                    onClick={() => setAdConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`w-14 h-7 rounded-full transition-all relative ${adConfig.enabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${adConfig.enabled ? 'left-8' : 'left-1'}`}></div>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Impressions</div>
                  <div className="text-2xl font-black text-white">{adConfig.currentImpressions.toLocaleString()}</div>
                </div>
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Ad Earnings</div>
                  <div className="text-2xl font-black text-emerald-400">₹{adRev.toFixed(4)}</div>
                </div>
                <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700">
                  <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Avg. CPM</div>
                  <div className="text-2xl font-black text-indigo-400">₹{adConfig.cpm.toFixed(2)}</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 items-end">
                <div className="flex-grow space-y-1.5 w-full">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Adjust Ad Rates (CPM - ₹ per 1k views)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                    <input 
                      type="number" step="0.50" value={adConfig.cpm}
                      onChange={(e) => setAdConfig(prev => ({ ...prev, cpm: Number(e.target.value) }))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-8 pr-4 py-4 text-white outline-none focus:border-emerald-500 transition-all font-mono"
                    />
                  </div>
                </div>
                <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-xl text-[10px] text-indigo-300 italic leading-relaxed w-full sm:w-64">
                  Pro-tip: Higher CPM rates increase earnings but may limit advertiser participation.
                </div>
              </div>
            </div>
            <i className="fa-solid fa-money-bill-trend-up absolute -bottom-10 -right-10 text-white/5 text-[15rem] pointer-events-none"></i>
          </section>

          {/* Sales Configuration */}
          <section className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col justify-center">
            <h2 className="text-xl font-black text-slate-900 flex items-center mb-6">
              <i className="fa-solid fa-percent text-indigo-500 mr-3"></i>Fee Structure
            </h2>
            <div className="space-y-6">
               <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-center">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Platform Fee (Admin)</div>
                  <div className="text-4xl font-black text-indigo-600 mb-4">{revenueShare}%</div>
                  <input 
                    type="range" min="0" max="100" step="1" value={revenueShare}
                    onChange={(e) => setRevenueShare(parseInt(e.target.value))}
                    className="w-full h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
               </div>
               <p className="text-[10px] text-slate-400 text-center italic">This controls how much of each note sale you keep versus the author.</p>
            </div>
          </section>
        </div>
      )}

      {/* Content Library */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
           <div className="flex items-center space-x-3">
             <div className="bg-indigo-600 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"><i className="fa-solid fa-book text-white"></i></div>
             <h2 className="text-2xl font-bold text-slate-800">Note Inventory</h2>
           </div>
           {isAdmin && (
             <Link to="/upload" className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center shadow-lg shadow-emerald-100">
               <i className="fa-solid fa-plus mr-2 text-sm"></i>Upload New
             </Link>
           )}
        </div>
        
        {uploaded.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {uploaded.map(note => <NoteCard key={note.id} note={note} user={user} onDelete={onDeleteNote} />)}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-200 shadow-sm">
             <i className="fa-solid fa-cloud-arrow-up text-slate-200 text-6xl mb-6"></i>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Your inventory is empty</h3>
             <p className="text-slate-500 mb-8">Start uploading notes to generate sales and ad revenue.</p>
             <Link to="/upload" className="text-indigo-600 font-bold hover:underline">Upload First Note</Link>
          </div>
        )}
      </section>

      {/* Purchases */}
      {!isAdmin && (
        <section className="pt-12 border-t border-slate-100">
          <div className="flex items-center space-x-3 mb-8">
            <div className="bg-slate-900 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"><i className="fa-solid fa-bookmark text-white"></i></div>
            <h2 className="text-2xl font-bold text-slate-800">My Study Collection</h2>
          </div>
          {purchased.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {purchased.map(note => <NoteCard key={note.id} note={note} user={user} onDelete={onDeleteNote} />)}
            </div>
          ) : (
            <p className="text-slate-400 text-center py-12 italic">You haven't purchased any notes yet.</p>
          )}
        </section>
      )}
    </div>
  );
};

export default Dashboard;
