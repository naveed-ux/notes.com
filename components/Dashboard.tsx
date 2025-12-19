
import React from 'react';
import { Link } from 'react-router-dom';
import { User, Note } from '../types';
import NoteCard from './NoteCard';

interface DashboardProps {
  user: User;
  notes: Note[];
}

const Dashboard: React.FC<DashboardProps> = ({ user, notes }) => {
  const isAdmin = user.role === 'admin';
  const purchased = notes.filter(n => user.purchasedNotes.includes(n.id));
  const uploaded = notes.filter(n => user.uploadedNotes.includes(n.id));

  return (
    <div className="space-y-12 animate-fade-in">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-200">
        <div>
           <div className="flex items-center space-x-3 mb-2">
             <h1 className="text-4xl font-black text-slate-900">My Study Library</h1>
             {isAdmin && (
               <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center">
                 <i className="fa-solid fa-crown mr-1.5"></i> Admin
               </span>
             )}
           </div>
           <p className="text-slate-500">
             {isAdmin 
               ? "Manage your global inventory and monitor site-wide earnings." 
               : "Access all your purchased study materials in one place."}
           </p>
        </div>
        
        {isAdmin && (
          <div className="flex items-center space-x-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
             <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-50">
                <i className="fa-solid fa-chart-line text-indigo-600 text-xl"></i>
             </div>
             <div>
                <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                  Total Sales Revenue
                </div>
                <div className="text-2xl font-black text-slate-900">₹{user.balance.toFixed(2)}</div>
             </div>
             <button className="bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-xs font-bold ml-4 hover:bg-indigo-600 transition-all shadow-lg shadow-slate-100">
                Withdraw Funds
             </button>
          </div>
        )}
      </header>

      <section>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
             <div className="bg-slate-900 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-100">
               <i className="fa-solid fa-bookmark text-white text-sm"></i>
             </div>
             <h2 className="text-2xl font-bold text-slate-800">Purchased Materials</h2>
             <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{purchased.length}</span>
          </div>
          {!isAdmin && purchased.length > 0 && (
            <Link to="/" className="text-indigo-600 font-bold text-sm hover:underline">Find more notes</Link>
          )}
        </div>
        
        {purchased.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {purchased.map(note => <NoteCard key={note.id} note={note} />)}
          </div>
        ) : (
          <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-200 shadow-sm">
             <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <i className="fa-solid fa-ghost text-slate-300 text-4xl"></i>
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Your library is empty</h3>
             <p className="text-slate-500 mb-8 max-w-xs mx-auto">Get ahead in your classes by browsing top-rated notes from our community.</p>
             <Link to="/" className="inline-flex items-center bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
               <i className="fa-solid fa-magnifying-glass mr-2 text-sm"></i>
               Browse Marketplace
             </Link>
          </div>
        )}
      </section>

      {/* Admin specific Uploads Section */}
      {isAdmin && (
        <section className="pt-12 border-t border-slate-100 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
             <div className="flex items-center space-x-3">
               <div className="bg-indigo-600 w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
                 <i className="fa-solid fa-cloud-arrow-up text-white text-sm"></i>
               </div>
               <h2 className="text-2xl font-bold text-slate-800">My Uploaded Notes</h2>
               <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-bold">{uploaded.length}</span>
             </div>
             
             <Link 
               to="/upload" 
               className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center shadow-lg shadow-emerald-100"
             >
               <i className="fa-solid fa-plus mr-2 text-sm"></i>
               Upload New Note
             </Link>
          </div>

          {uploaded.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {uploaded.map(note => <NoteCard key={note.id} note={note} />)}
            </div>
          ) : (
            <div className="bg-indigo-50/40 rounded-[2.5rem] p-16 text-center border-2 border-dashed border-indigo-200">
               <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fa-solid fa-file-invoice-dollar text-indigo-400 text-4xl"></i>
               </div>
               <h3 className="text-xl font-bold text-indigo-900 mb-2">No notes uploaded yet</h3>
               <p className="text-slate-500 mb-8 max-w-xs mx-auto">Share your high-quality academic notes and start earning from your knowledge.</p>
               <Link to="/upload" className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
                 Upload Your First Note
               </Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Dashboard;
