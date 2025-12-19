
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Note, User } from '../types';
import { summarizeNote, getStudyQuestions } from '../services/geminiService';
import { ADMIN_UPI_ID, ADMIN_NAME } from '../constants';

interface NoteDetailsProps {
  notes: Note[];
  user: User;
  onPurchase: (noteId: string, price: number) => void;
  onDeleteNote: (id: string) => void;
}

const NoteDetails: React.FC<NoteDetailsProps> = ({ notes, user, onPurchase, onDeleteNote }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const note = notes.find(n => n.id === id);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isPurchased = user.purchasedNotes.includes(id || '');
  const canAccess = note?.isFree || isPurchased;
  const isAdmin = user.role === 'admin';

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [studyQuestions, setStudyQuestions] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'qr' | 'verifying'>('qr');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    setAiSummary(null);
    setStudyQuestions([]);
    setShowPaymentModal(false);
    setPaymentStep('qr');
    setTransactionId('');
  }, [id]);

  const handleAskAI = async () => {
    if (!note) return;
    setLoadingAI(true);
    try {
      const summary = await summarizeNote(note.content);
      const questions = await getStudyQuestions(note.content);
      setAiSummary(summary);
      setStudyQuestions(questions);
    } catch (error) {
      console.error("AI Error:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  const scrollToContent = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const initiatePurchase = () => {
    setShowPaymentModal(true);
  };

  const confirmPayment = () => {
    if (!transactionId || transactionId.length < 6) {
      alert("Please enter a valid Transaction ID (UTR) to verify your payment.");
      return;
    }
    setPaymentStep('verifying');
    // Simulate admin verification process
    setTimeout(() => {
      if (note) {
        onPurchase(note.id, note.price);
        setShowPaymentModal(false);
        setPaymentStep('qr');
        setTransactionId('');
      }
    }, 3000);
  };

  const handleDelete = () => {
    if (note) {
      onDeleteNote(note.id);
      navigate('/');
    }
  };

  if (!note) return (
    <div className="py-20 text-center">
      <h2 className="text-2xl font-bold">Note not found</h2>
      <Link to="/" className="text-indigo-600 mt-4 block">Return to Marketplace</Link>
    </div>
  );

  const upiUrl = `upi://pay?pa=${ADMIN_UPI_ID}&pn=${encodeURIComponent(ADMIN_NAME)}&am=${note.price}&cu=INR&tn=${encodeURIComponent('Buying: ' + note.title + ' User: ' + user.email)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div className="animate-fade-in relative">
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900">Secure Checkout</h3>
                <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              {paymentStep === 'qr' ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="bg-indigo-50 p-4 rounded-2xl inline-block mb-4">
                      <img src={qrCodeUrl} alt="UPI QR Code" className="w-40 h-40 mx-auto mix-blend-multiply" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Pay with any UPI App</p>
                      <p className="text-2xl font-black text-slate-900">₹{note.price.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        Transaction ID / UTR Number
                      </label>
                      <input 
                        type="text"
                        placeholder="Enter 12-digit UTR number"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-mono"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                      />
                      <p className="text-[9px] text-slate-400 px-1 leading-tight">
                        * This ID is found in your UPI app's payment receipt. It helps us match the payment to your account.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <a href={upiUrl} className="bg-slate-100 text-slate-900 py-3 rounded-xl font-bold text-xs flex items-center justify-center hover:bg-slate-200 transition-all border border-slate-200">
                        <i className="fa-solid fa-mobile-screen-button mr-2"></i> Pay In App
                      </a>
                      <button 
                        onClick={confirmPayment} 
                        disabled={!transactionId || transactionId.length < 6}
                        className="bg-indigo-600 text-white py-3 rounded-xl font-bold text-xs hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Submit & Verify
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-6">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i className="fa-solid fa-magnifying-glass-dollar text-indigo-600 text-2xl"></i>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-black text-slate-900">Verifying Payment</h4>
                    <p className="text-sm text-slate-500 px-8">Matching Transaction ID <strong>{transactionId}</strong> with bank records...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <nav className="mb-6 flex items-center space-x-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-indigo-600 transition-colors">Marketplace</Link>
        <i className="fa-solid fa-chevron-right text-[10px]"></i>
        <span className="text-slate-900 font-medium truncate max-w-[200px] sm:max-w-md">{note.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 mb-4">
               <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{note.category}</span>
               {note.tags.map(tag => (
                 <span key={tag} className="text-slate-500 bg-slate-100 px-3 py-1 rounded-full text-xs">#{tag}</span>
               ))}
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-4 leading-tight">{note.title}</h1>
            
            <div className="prose prose-slate max-w-none">
              <h3 className="text-xl font-bold mb-4">About this Note</h3>
              <p className="text-slate-600 mb-8">{note.description}</p>
              
              <div ref={contentRef} className="relative rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden scroll-mt-24">
                <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
                   <h3 className="text-xl font-bold flex items-center">
                      <i className="fa-solid fa-file-shield text-indigo-500 mr-2"></i>
                      {note.pdfUrl ? 'Secure PDF Reader' : 'Note Content'}
                   </h3>
                   {canAccess && note.pdfUrl && (
                     <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-2 py-1 rounded uppercase">Read Only Mode</span>
                   )}
                </div>
                
                {canAccess ? (
                  <div className="relative group">
                    {note.pdfUrl ? (
                      <div className="relative w-full h-[600px] bg-slate-800" onContextMenu={(e) => e.preventDefault()}>
                        <iframe 
                          src={`${note.pdfUrl}#toolbar=0&navpanes=0&scrollbar=0`} 
                          className="w-full h-full border-none pointer-events-auto"
                          title="Secure PDF Viewer"
                        />
                        <div className="absolute inset-0 pointer-events-none select-none z-10 flex items-center justify-center">
                           <div className="text-white/5 text-6xl font-black -rotate-45 select-none pointer-events-none">NOTENEXUS SECURE VIEW</div>
                        </div>
                        <div className="absolute inset-0 z-20" style={{ pointerEvents: 'none' }} />
                      </div>
                    ) : (
                      <div className="text-slate-700 leading-relaxed whitespace-pre-wrap font-mono text-sm bg-white p-6 min-h-[300px]">
                        {note.content}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative p-12 bg-white">
                    <div className="blur-md select-none opacity-20 leading-relaxed space-y-4">
                       <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                       <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit id est laborum.</p>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white/40 backdrop-blur-sm">
                      <div className="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-xl">
                        <i className="fa-solid fa-lock text-2xl"></i>
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">Note is Locked</h4>
                      <p className="text-slate-600 mb-6 max-w-xs">Purchase this note to access the full {note.pdfUrl ? 'PDF document' : 'content'} within the app.</p>
                      <button 
                        onClick={initiatePurchase}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg"
                      >
                        Unlock for ₹{note.price.toFixed(2)}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {canAccess && (
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-8 border border-indigo-100 shadow-sm relative overflow-hidden">
               <div className={`flex items-center justify-between transition-opacity duration-300 ${loadingAI ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                <div>
                   <h3 className="text-2xl font-black text-slate-900 flex items-center">
                    <i className="fa-solid fa-wand-magic-sparkles text-indigo-500 mr-3"></i>
                    AI Note Assistant
                  </h3>
                  <p className="text-slate-600">Get summaries and study questions from the content.</p>
                </div>
                {!aiSummary && !loadingAI && (
                   <button onClick={handleAskAI} className="bg-white border-2 border-indigo-600 text-indigo-600 px-6 py-2 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all group">
                     <i className="fa-solid fa-sparkles mr-2"></i> Deep Analysis
                   </button>
                )}
              </div>

              {loadingAI && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm animate-fade-in z-20">
                  <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                  <h4 className="text-lg font-black text-indigo-900 animate-pulse">Gemini is processing...</h4>
                </div>
              )}

              {aiSummary && (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                  <div className="bg-white p-6 rounded-2xl border border-indigo-50">
                    <h4 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
                       <i className="fa-solid fa-align-left mr-2"></i> Smart Summary
                    </h4>
                    <div className="text-slate-700 text-sm leading-relaxed prose prose-sm max-w-none">{aiSummary}</div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl border border-indigo-50">
                    <h4 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
                       <i className="fa-solid fa-clipboard-question mr-2"></i> Study Questions
                    </h4>
                    <ul className="space-y-4">
                      {studyQuestions.map((q, idx) => (
                        <li key={idx} className="bg-slate-50 p-3 rounded-lg border-l-4 border-indigo-400 text-sm text-slate-700 italic">"{q}"</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg sticky top-24">
            {canAccess ? (
              <div className="mb-6">
                <span className="text-emerald-600 text-xs uppercase font-bold tracking-widest bg-emerald-50 px-3 py-1 rounded-full">Access Granted</span>
                <div className="text-2xl font-black text-slate-900 mt-3">Ready to Study</div>
              </div>
            ) : (
              <div className="mb-6">
                <span className="text-slate-500 text-sm uppercase font-bold tracking-widest">Pricing</span>
                <div className="text-4xl font-black text-slate-900">₹{note.price.toFixed(2)}</div>
              </div>
            )}

            <div className="space-y-3">
              {canAccess ? (
                <button onClick={scrollToContent} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center space-x-2">
                  <i className="fa-solid fa-eye"></i>
                  <span>{note.pdfUrl ? 'Open PDF Reader' : 'View Content'}</span>
                </button>
              ) : (
                <button onClick={initiatePurchase} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2">
                  <i className="fa-solid fa-cart-shopping"></i>
                  <span>Buy Access Now</span>
                </button>
              )}
            </div>

            <hr className="my-6 border-slate-100" />
            
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Features</h4>
              <ul className="space-y-3">
                <li className="flex items-start text-sm text-slate-600">
                  <i className="fa-solid fa-circle-check text-emerald-500 mt-1 mr-3"></i>
                  <span>Secure in-app viewing</span>
                </li>
                <li className="flex items-start text-sm text-slate-600">
                  <i className="fa-solid fa-circle-check text-emerald-500 mt-1 mr-3"></i>
                  <span>Non-downloadable content</span>
                </li>
                <li className="flex items-start text-sm text-slate-600">
                  <i className="fa-solid fa-circle-check text-emerald-500 mt-1 mr-3"></i>
                  <span>Admin matched via UTR</span>
                </li>
              </ul>
            </div>
          </div>

          {isAdmin && (
            <div className="bg-slate-900 text-white rounded-3xl p-8 relative overflow-hidden">
              <h4 className="text-xl font-bold mb-4 relative z-10">Admin Access</h4>
              <div className="space-y-3 relative z-10">
                <button onClick={handleDelete} className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-3 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center space-x-2">
                  <i className="fa-solid fa-trash-can text-sm"></i>
                  <span>Delete Publication</span>
                </button>
              </div>
              <i className="fa-solid fa-shield-halved absolute -bottom-4 -right-4 text-white/5 text-8xl -rotate-12"></i>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteDetails;
