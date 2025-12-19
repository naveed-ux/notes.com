
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Note, User } from '../types';
import { summarizeNote, getStudyQuestions } from '../services/geminiService';
import { ADMIN_UPI_ID, ADMIN_NAME } from '../constants';

interface NoteDetailsProps {
  notes: Note[];
  user: User;
  onPurchase: (noteId: string, price: number) => void;
}

const NoteDetails: React.FC<NoteDetailsProps> = ({ notes, user, onPurchase }) => {
  const { id } = useParams<{ id: string }>();
  const note = notes.find(n => n.id === id);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isPurchased = user.purchasedNotes.includes(id || '');
  const canAccess = note?.isFree || isPurchased;
  const isAdmin = user.role === 'admin';

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [studyQuestions, setStudyQuestions] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  
  // Payment Modal States
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'qr' | 'verifying'>('qr');

  useEffect(() => {
    setAiSummary(null);
    setStudyQuestions([]);
    setShowPaymentModal(false);
    setPaymentStep('qr');
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
    setPaymentStep('verifying');
    // Simulate payment verification delay
    setTimeout(() => {
      if (note) {
        onPurchase(note.id, note.price);
        setShowPaymentModal(false);
        setPaymentStep('qr');
      }
    }, 2500);
  };

  if (!note) return (
    <div className="py-20 text-center">
      <h2 className="text-2xl font-bold">Note not found</h2>
      <Link to="/" className="text-indigo-600 mt-4 block">Return to Marketplace</Link>
    </div>
  );

  // UPI Link Generation
  const upiUrl = `upi://pay?pa=${ADMIN_UPI_ID}&pn=${encodeURIComponent(ADMIN_NAME)}&am=${note.price}&cu=INR&tn=${encodeURIComponent('Buying: ' + note.title)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div className="animate-fade-in relative">
      {/* Payment Modal Overlay */}
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
                <div className="space-y-6 text-center">
                  <div className="bg-indigo-50 p-4 rounded-2xl inline-block">
                    <img src={qrCodeUrl} alt="UPI QR Code" className="w-48 h-48 mx-auto mix-blend-multiply" />
                  </div>
                  
                  <div>
                    <p className="text-slate-500 text-sm mb-1">Scan this QR to pay</p>
                    <p className="text-2xl font-black text-slate-900">₹{note.price.toFixed(2)}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <a href={upiUrl} className="bg-slate-900 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center hover:bg-indigo-600 transition-all">
                      <i className="fa-solid fa-mobile-screen-button mr-2"></i> Open App
                    </a>
                    <button onClick={confirmPayment} className="bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all">
                      I have paid
                    </button>
                  </div>

                  <div className="flex items-center justify-center space-x-4 opacity-40 grayscale">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo.png" alt="UPI" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Google_Pay_Logo.svg/512px-Google_Pay_Logo.svg.png" alt="GPay" className="h-4" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Paytm_Logo_%28standalone%29.svg/1200px-Paytm_Logo_%28standalone%29.svg.png" alt="Paytm" className="h-3" />
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center space-y-6">
                  <div className="relative inline-block">
                    <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i className="fa-solid fa-shield-check text-indigo-600 text-2xl"></i>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900">Verifying Transaction</h4>
                    <p className="text-slate-500 text-sm mt-2">Connecting to bank servers to confirm your payment...</p>
                  </div>
                </div>
              )}
            </div>
            <div className="bg-slate-50 p-4 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest border-t border-slate-100">
              Encrypted & Secure Peer-to-Peer Transfer
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
            <div className="flex items-center space-x-6 mb-8 py-4 border-y border-slate-50">
              <div className="flex items-center space-x-3">
                <img src={`https://ui-avatars.com/api/?name=${note.author}`} className="w-10 h-10 rounded-full" />
                <div>
                  <div className="text-sm font-bold text-slate-900">{note.author}</div>
                  <div className="text-xs text-slate-500">Top Contributor</div>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-100"></div>
              <div>
                <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">Rating</div>
                <div className="flex items-center space-x-1">
                  <i className="fa-solid fa-star text-amber-400"></i>
                  <span className="font-bold text-slate-900">{note.rating}</span>
                </div>
              </div>
            </div>

            <div className="prose prose-slate max-w-none">
              <h3 className="text-xl font-bold mb-4">Description</h3>
              <p className="text-slate-600 mb-8">{note.description}</p>
              
              <div ref={contentRef} className="relative p-6 rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden scroll-mt-24">
                <h3 className="text-xl font-bold mb-6 flex items-center">
                   <i className="fa-solid fa-file-lines text-indigo-500 mr-2"></i>
                   Note Content
                </h3>
                
                {canAccess ? (
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap font-mono text-sm bg-white p-6 rounded-xl border border-slate-100">
                    {note.content}
                  </div>
                ) : (
                  <div className="relative">
                    <div className="blur-sm select-none opacity-40 leading-relaxed space-y-4">
                       <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                       <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                    </div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white/30 backdrop-blur-md rounded-xl">
                      <div className="bg-indigo-600 text-white w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
                        <i className="fa-solid fa-lock text-2xl"></i>
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">Premium Content</h4>
                      <p className="text-slate-600 mb-6">Purchase this note to unlock the full content and study guides.</p>
                      <button 
                        onClick={initiatePurchase}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-200"
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
                  <p className="text-slate-600">Get summaries and test your knowledge with Gemini AI.</p>
                </div>
                {!aiSummary && !loadingAI && (
                   <button 
                    onClick={handleAskAI}
                    className="bg-white border-2 border-indigo-600 text-indigo-600 px-6 py-2 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center group"
                   >
                     <i className="fa-solid fa-sparkles mr-2 group-hover:rotate-12 transition-transform"></i>
                     Deep Analysis
                   </button>
                )}
              </div>

              {loadingAI && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm animate-fade-in z-20">
                  <div className="relative mb-6">
                    <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <i className="fa-solid fa-brain text-indigo-400 animate-pulse text-xl"></i>
                    </div>
                  </div>
                  <div className="text-center space-y-2">
                    <h4 className="text-xl font-black text-indigo-900 animate-pulse tracking-tight">Gemini is thinking...</h4>
                    <p className="text-slate-500 text-sm font-medium">Distilling key insights & crafting study questions</p>
                  </div>
                </div>
              )}

              <div className={`mt-8 transition-opacity duration-500 ${loadingAI ? 'opacity-0' : 'opacity-100'}`}>
                {aiSummary && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                    <div className="bg-white p-6 rounded-2xl border border-indigo-50 shadow-sm">
                      <h4 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
                         <i className="fa-solid fa-align-left mr-2"></i>
                         Smart Summary
                      </h4>
                      <div className="text-slate-700 text-sm leading-relaxed prose prose-sm max-w-none">
                        {aiSummary}
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl border border-indigo-50 shadow-sm">
                      <h4 className="text-lg font-bold text-indigo-900 mb-4 flex items-center">
                         <i className="fa-solid fa-clipboard-question mr-2"></i>
                         Study Questions
                      </h4>
                      <ul className="space-y-4">
                        {studyQuestions.map((q, idx) => (
                          <li key={idx} className="bg-slate-50 p-3 rounded-lg border-l-4 border-indigo-400 text-sm text-slate-700 italic">
                            "{q}"
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-lg sticky top-24">
            {canAccess ? (
              <div className="mb-6">
                <span className="text-emerald-600 text-xs uppercase font-bold tracking-widest bg-emerald-50 px-3 py-1 rounded-full">
                  Access Granted
                </span>
                <div className="text-2xl font-black text-slate-900 mt-3">You own this note</div>
              </div>
            ) : (
              <div className="mb-6">
                <span className="text-slate-500 text-sm uppercase font-bold tracking-widest">Pricing</span>
                <div className="text-4xl font-black text-slate-900">₹{note.price.toFixed(2)}</div>
              </div>
            )}

            <div className="space-y-3">
              {canAccess ? (
                <button 
                  onClick={scrollToContent}
                  className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-100 flex items-center justify-center space-x-2"
                >
                  <i className="fa-solid fa-eye"></i>
                  <span>View Note</span>
                </button>
              ) : (
                <button 
                  onClick={initiatePurchase}
                  className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center space-x-2"
                >
                  <i className="fa-solid fa-cart-shopping"></i>
                  <span>Buy Access Now</span>
                </button>
              )}
              
              <div className="text-center text-xs text-slate-400 py-2">
                <i className="fa-solid fa-shield-check mr-1"></i> Secure checkout powered by NoteNexus
              </div>
            </div>

            <hr className="my-6 border-slate-100" />
            
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">What's Included</h4>
              <ul className="space-y-3">
                <li className="flex items-start text-sm text-slate-600">
                  <i className="fa-solid fa-circle-check text-emerald-500 mt-1 mr-3"></i>
                  <span>Full editable text access</span>
                </li>
                <li className="flex items-start text-sm text-slate-600">
                  <i className="fa-solid fa-circle-check text-emerald-500 mt-1 mr-3"></i>
                  <span>AI-Generated study guides</span>
                </li>
                <li className="flex items-start text-sm text-slate-600">
                  <i className="fa-solid fa-circle-check text-emerald-500 mt-1 mr-3"></i>
                  <span>Lifetime updates from author</span>
                </li>
                <li className="flex items-start text-sm text-slate-600">
                  <i className="fa-solid fa-circle-check text-emerald-500 mt-1 mr-3"></i>
                  <span>Downloadable PDF format</span>
                </li>
              </ul>
            </div>
          </div>

          {isAdmin && (
            <div className="bg-slate-900 text-white rounded-3xl p-8 overflow-hidden relative">
              <h4 className="text-xl font-bold mb-4 relative z-10">Admin Control</h4>
              <p className="text-slate-400 mb-6 text-sm relative z-10">You have administrative access to edit or manage this publication.</p>
              <Link 
                to="/upload" 
                className="block w-full text-center bg-indigo-500 text-white py-3 rounded-xl font-bold hover:bg-indigo-400 transition-all relative z-10"
              >
                Upload New
              </Link>
              <i className="fa-solid fa-shield-halved absolute -bottom-4 -right-4 text-white/5 text-8xl -rotate-12"></i>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoteDetails;
