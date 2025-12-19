
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Marketplace from './components/Marketplace';
import NoteDetails from './components/NoteDetails';
import UploadForm from './components/UploadForm';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Auth from './components/Auth';
import { Note, User } from './types';
import { MOCK_NOTES } from './constants';

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(MOCK_NOTES);
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleUpload = (newNote: Note) => {
    if (user?.role !== 'admin') return;
    setNotes(prev => [newNote, ...prev]);
    setUser(prev => prev ? ({
      ...prev,
      uploadedNotes: [...prev.uploadedNotes, newNote.id]
    }) : null);
  };

  const handlePurchase = (noteId: string, price: number) => {
    if (!user) return;
    if (user.balance < price) {
      alert("Insufficient balance!");
      return;
    }
    if (user.purchasedNotes.includes(noteId)) {
      alert("You already own this note.");
      return;
    }
    setUser(prev => prev ? ({
      ...prev,
      balance: prev.balance - price,
      purchasedNotes: [...prev.purchasedNotes, noteId]
    }) : null);
    alert("Purchase successful! Note added to your library.");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Auth onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<Marketplace notes={notes} />} />
            <Route 
              path="/note/:id" 
              element={
                <NoteDetails 
                  notes={notes} 
                  user={user} 
                  onPurchase={handlePurchase} 
                />
              } 
            />
            <Route 
              path="/upload" 
              element={
                user.role === 'admin' ? (
                  <UploadForm onUpload={handleUpload} user={user} />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
            <Route 
              path="/dashboard" 
              element={<Dashboard notes={notes} user={user} />} 
            />
            <Route 
              path="/profile" 
              element={<Profile user={user} notes={notes} />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <footer className="bg-slate-900 text-slate-400 py-12 mt-12 border-t border-slate-800">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <div className="bg-indigo-600 p-1.5 rounded-lg">
                <i className="fa-solid fa-book-open text-white text-lg"></i>
              </div>
              <span className="text-white text-xl font-bold tracking-tight">NoteNexus</span>
            </div>
            <p className="mb-6">The world's premium marketplace for academic excellence.</p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors">Contact Us</a>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800 text-sm">
              &copy; {new Date().getFullYear()} NoteNexus. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
