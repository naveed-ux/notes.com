
import React, { useEffect } from 'react';

interface AdPlacementProps {
  type: 'leaderboard' | 'sidebar' | 'native';
  onImpression?: () => void;
}

const AdPlacement: React.FC<AdPlacementProps> = ({ type, onImpression }) => {
  useEffect(() => {
    // FIXED: Only trigger impression on mount
    if (onImpression) {
      onImpression();
    }
  }, []); // Empty dependency array is critical here to avoid infinite loops

  const adContent = {
    leaderboard: {
      title: "Master Data Science & AI in 2024",
      desc: "Enroll in our top-rated certification course. 40% discount for NoteNexus students!",
      icon: "fa-solid fa-robot",
      btn: "Claim Offer",
      color: "indigo"
    },
    sidebar: {
      title: "Need Faster Hosting?",
      desc: "Deploy your projects in seconds with Nexus Cloud. Use code NEXUS20.",
      icon: "fa-solid fa-server",
      btn: "Get Started",
      color: "slate"
    },
    native: {
      title: "Premium Planners for Students",
      desc: "Organize your academic life with our physical & digital planners.",
      icon: "fa-solid fa-calendar-check",
      btn: "View Catalog",
      color: "emerald"
    }
  };

  const content = adContent[type];

  if (type === 'leaderboard') {
    return (
      <div className="w-full bg-indigo-50 border border-indigo-100 rounded-3xl p-6 mb-12 flex flex-col sm:flex-row items-center justify-between group overflow-hidden relative shadow-sm">
        <div className="absolute top-3 right-4 px-2 py-0.5 bg-indigo-100 text-[9px] font-black text-indigo-400 rounded uppercase tracking-widest border border-indigo-200">Sponsored</div>
        <div className="flex items-center space-x-6">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
            <i className={`${content.icon} text-2xl`}></i>
          </div>
          <div>
            <h4 className="text-lg font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{content.title}</h4>
            <p className="text-sm text-slate-500 max-w-lg">{content.desc}</p>
          </div>
        </div>
        <button className="mt-6 sm:mt-0 bg-slate-900 text-white px-8 py-3 rounded-2xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100">
          {content.btn}
        </button>
      </div>
    );
  }

  if (type === 'sidebar') {
    return (
      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 relative overflow-hidden group shadow-lg">
        <div className="absolute top-4 right-4 px-2 py-0.5 bg-slate-100 text-[9px] font-black text-slate-400 rounded uppercase tracking-widest border border-slate-200">AdSense</div>
        <div className="w-full aspect-square bg-slate-50 rounded-3xl mb-6 flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-400 transition-all">
          <i className={`${content.icon} text-6xl`}></i>
        </div>
        <h4 className="text-xl font-black text-slate-900 mb-2 leading-tight">{content.title}</h4>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">{content.desc}</p>
        <button className="w-full bg-slate-900 text-white py-4 rounded-2xl text-sm font-bold hover:bg-indigo-600 transition-all shadow-lg">
          {content.btn}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden p-1 relative flex flex-col h-full shadow-sm group hover:shadow-md transition-shadow">
      <div className="absolute top-3 right-3 z-10 px-1.5 py-0.5 bg-emerald-100 text-[8px] font-black text-emerald-600 rounded uppercase tracking-tighter border border-emerald-200">Partner</div>
      <div className="h-44 bg-slate-50 rounded-xl mb-4 flex items-center justify-center group-hover:bg-emerald-50 transition-colors overflow-hidden">
        <i className={`${content.icon} text-emerald-200 text-5xl group-hover:scale-110 transition-transform duration-500`}></i>
      </div>
      <div className="px-4 pb-4 flex-grow flex flex-col">
        <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">{content.title}</h4>
        <p className="text-xs text-slate-500 line-clamp-2 mb-4">{content.desc}</p>
        <button className="mt-auto w-full bg-slate-100 text-slate-600 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all">
          {content.btn}
        </button>
      </div>
    </div>
  );
};

export default AdPlacement;
