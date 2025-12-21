
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Marketplace from './components/Marketplace';
import NoteDetails from './components/NoteDetails';
import UploadForm from './components/UploadForm';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Auth from './components/Auth';
import { Note, User, AdConfig } from './types';
import { MOCK_NOTES } from './constants';
import { fetchAllNotes, saveNewNote, updateNoteInCloud, deleteNoteFromCloud, updateProfile, isSupabaseConfigured } from './services/supabaseService';

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nn_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [adConfig, setAdConfig] = useState<AdConfig>(() => {
    const saved = localStorage.getItem('nn_ad_config');
    return saved ? JSON.parse(saved) : { enabled: true, cpm: 12.50, currentImpressions: 0 };
  });

  const [revenueShare, setRevenueShare] = useState<number>(85);
  const [loading, setLoading] = useState(true);

  // Persistence
  useEffect(() => {
    if (!isSupabaseConfigured && notes.length > 0) {
      localStorage.setItem('nn_notes_local', JSON.stringify(notes));
    }
  }, [notes]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('nn_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nn_user');
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('nn_ad_config', JSON.stringify(adConfig));
  }, [adConfig]);

  useEffect(() => {
    const initData = async () => {
      setLoading(true);
      try {
        if (isSupabaseConfigured) {
          const cloudNotes = await fetchAllNotes();
          setNotes(cloudNotes.length > 0 ? cloudNotes : MOCK_NOTES);
        } else {
          const local = localStorage.getItem('nn_notes_local');
          setNotes(local ? JSON.parse(local) : MOCK_NOTES);
        }
      } catch (err) {
        console.error("Initialization failed:", err);
        setNotes(MOCK_NOTES);
      }
      setLoading(false);
    };
    initData();
  }, []);

  // FIXED: Removed dependencies to prevent infinite loop on re-render
  const handleImpression = useCallback(() => {
    setAdConfig(prevConfig => {
      if (!prevConfig.enabled) return prevConfig;
      
      const earned = prevConfig.cpm / 1000;
      
      setUser(currUser => {
        if (!currUser) return null;
        return { 
          ...currUser, 
          adRevenue: (currUser.adRevenue || 0) + earned 
        };
      });

      return { 
        ...prevConfig, 
        currentImpressions: prevConfig.currentImpressions + 1 
      };
    });
  }, []);

  const handleLogin = (loggedInUser: User) => {
    if (loggedInUser.adRevenue === undefined) loggedInUser.adRevenue = 0;
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleUpload = async (newNote: Note) => {
    if (user?.role !== 'admin') return;
    try {
      if (isSupabaseConfigured) {
        await saveNewNote(newNote);
      }
      setNotes(prev => [newNote, ...prev]);
      
      const updatedUploaded = [...user.uploadedNotes, newNote.id];
      if (isSupabaseConfigured) {
        await updateProfile(user.id, { uploadedNotes: updatedUploaded });
      }
      setUser(prev => prev ? ({ ...prev, uploadedNotes: updatedUploaded }) : null);
    } catch (err) {
      console.error("Cloud sync failed:", err);
      setNotes(prev => [newNote, ...prev]);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!user || user.role !== 'admin') return;
    if (window.confirm("Are you sure you want to delete this note?")) {
      try {
        if (isSupabaseConfigured) {
          await deleteNoteFromCloud(id);
        }
        setNotes(prev => prev.filter(n => n.id !== id));
      } catch (err) {
        alert("Failed to delete.");
      }
    }
  };

  const handleRateNote = async (noteId: string, newRating: number) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    const totalRatingValue = note.rating * note.ratingCount;
    const newCount = note.ratingCount + 1;
    const newAverage = Number(((totalRatingValue + newRating) / newCount).toFixed(1));
    try {
      if (isSupabaseConfigured) {
        await updateNoteInCloud(noteId, { rating: newAverage, ratingCount: newCount });
      }
      setNotes(prev => prev.map(n => n.id === noteId ? { ...n, rating: newAverage, ratingCount: newCount } : n));
    } catch (err) {
      console.error("Failed to update rating");
    }
  };

  const handlePurchase = async (noteId: string, price: number) => {
    if (!user) return;
    if (user.purchasedNotes.includes(noteId)) {
      alert("You already own this note.");
      return;
    }
    try {
      const updatedPurchased = [...user.purchasedNotes, noteId];
      if (isSupabaseConfigured) {
        await updateProfile(user.id, { purchasedNotes: updatedPurchased });
      }
      setUser(prev => prev ? ({ ...prev, purchasedNotes: updatedPurchased, balance: prev.balance + price }) : null);
      alert(`Purchase successful! ${isSupabaseConfigured ? 'Access synced to cloud.' : 'Saved to local device.'}`);
    } catch (err) {
      console.error("Purchase sync failed:", err);
      const updatedPurchased = [...user.purchasedNotes, noteId];
      setUser(prev => prev ? ({ ...prev, purchasedNotes: updatedPurchased }) : null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-bold animate-pulse">Launching NoteNexus Marketplace...</p>
        </div>
      </div>
    );
  }

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
        {!isSupabaseConfigured && (
          <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 text-center">
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
              <i className="fa-solid fa-triangle-exclamation mr-2"></i>
              Local Mode Active (Demo)
            </p>
          </div>
        )}
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-7xl">
          <Routes>
            <Route path="/" element={<Marketplace notes={notes} user={user} onDeleteNote={handleDeleteNote} onAdImpression={handleImpression} adsEnabled={adConfig.enabled} />} />
            <Route path="/note/:id" element={<NoteDetails notes={notes} user={user} onPurchase={handlePurchase} onDeleteNote={handleDeleteNote} onRateNote={handleRateNote} onAdImpression={handleImpression} adsEnabled={adConfig.enabled} />} />
            <Route path="/upload" element={user.role === 'admin' ? <UploadForm onUpload={handleUpload} user={user} revenueShare={revenueShare} /> : <Navigate to="/" replace />} />
            <Route path="/dashboard" element={<Dashboard notes={notes} user={user} onDeleteNote={handleDeleteNote} revenueShare={revenueShare} setRevenueShare={setRevenueShare} adConfig={adConfig} setAdConfig={setAdConfig} />} />
            <Route path="/profile" element={<Profile user={user} notes={notes} onDeleteNote={handleDeleteNote} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="bg-slate-900 text-slate-400 py-12 mt-12 border-t border-slate-800">
          <div className="container mx-auto px-4 text-center">
            <div className="flex justify-center items-center space-x-2 mb-4">
              <div className="bg-indigo-600 p-1.5 rounded-lg"><i className="fa-solid fa-book-open text-white text-lg"></i></div>
              <span className="text-white text-xl font-bold tracking-tight">NoteNexus</span>
            </div>
            <p className="mb-6">The world's premium marketplace for academic excellence.</p>
            <div className="mt-8 pt-8 border-t border-slate-800 text-sm">
              &copy; {new Date().getFullYear()} NoteNexus Monetized Edition.
            </div>
          </div>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
