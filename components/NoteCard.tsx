
import React from 'react';
import { Link } from 'react-router-dom';
import { Note, User } from '../types';

interface NoteCardProps {
  note: Note;
  user?: User;
  onDelete?: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, user, onDelete }) => {
  const isAdmin = user?.role === 'admin';

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(note.id);
    }
  };

  return (
    <Link 
      to={`/note/${note.id}`}
      className="group relative bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
    >
      {isAdmin && onDelete && (
        <button 
          onClick={handleDelete}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
          title="Delete Note"
        >
          <i className="fa-solid fa-trash-can text-xs"></i>
        </button>
      )}

      <div className="relative h-48 overflow-hidden bg-slate-100">
        <img 
          src={note.thumbnailUrl} 
          alt={note.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 flex space-x-2">
          <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm uppercase">
            {note.category}
          </span>
          {note.isFree ? (
            <span className="bg-emerald-500 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">FREE</span>
          ) : (
             <span className="bg-indigo-600 px-3 py-1 rounded-full text-xs font-bold text-white shadow-sm">₹{note.price.toFixed(2)}</span>
          )}
        </div>
      </div>
      
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
          {note.title}
        </h3>
        <p className="text-slate-500 text-sm line-clamp-2 mb-4">
          {note.description}
        </p>
        
        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
               <img src={`https://ui-avatars.com/api/?name=${note.author}&size=32`} alt="" />
            </div>
            <span className="text-xs text-slate-600 font-medium">{note.author}</span>
          </div>
          <div className="flex items-center space-x-1">
            <i className="fa-solid fa-star text-amber-400 text-xs"></i>
            <span className="text-xs font-bold text-slate-700">{note.rating}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NoteCard;
