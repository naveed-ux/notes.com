
import React, { useState } from 'react';
import { Note, Category } from '../types';
import NoteCard from './NoteCard';

interface MarketplaceProps {
  notes: Note[];
}

const Marketplace: React.FC<MarketplaceProps> = ({ notes }) => {
  const [filter, setFilter] = useState<string>('All');
  const [search, setSearch] = useState('');

  const categories = ['All', ...Object.values(Category)];

  const filteredNotes = notes.filter(note => {
    const matchesCategory = filter === 'All' || note.category === filter;
    const matchesSearch = note.title.toLowerCase().includes(search.toLowerCase()) || 
                          note.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-indigo-900 rounded-3xl p-8 mb-12 overflow-hidden shadow-2xl">
        <div className="relative z-10 md:w-2/3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Unlock the collective <span className="text-indigo-400 italic">wisdom</span> of top students.
          </h1>
          <p className="text-indigo-100 text-lg mb-8 max-w-xl">
            Access expert study materials, summaries, and exam guides curated to help you excel in your academic journey.
          </p>
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-grow max-w-md">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                placeholder="Search by topic, subject, or author..." 
                className="w-full pl-12 pr-4 py-4 rounded-xl border-none ring-0 focus:ring-2 focus:ring-indigo-400 text-slate-900"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 h-full w-1/3 opacity-10 hidden md:block">
           <i className="fa-solid fa-brain text-[200px] absolute -right-10 -top-10 rotate-12"></i>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              filter === cat 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredNotes.length > 0 ? (
          filteredNotes.map(note => (
            <NoteCard key={note.id} note={note} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="bg-slate-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
               <i className="fa-solid fa-ghost text-slate-400 text-3xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800">No notes found</h3>
            <p className="text-slate-500">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
