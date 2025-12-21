
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Note, User } from '../types';
import { summarizeNote, getStudyQuestions } from '../services/geminiService';
import { ADMIN_UPI_ID, ADMIN_NAME } from '../constants';
import AdPlacement from './AdPlacement';

interface NoteDetailsProps {
  notes: Note[];
  user: User;
  onPurchase: (noteId: string, price: number) => void;
  onDeleteNote: (id: string) => void;
  onRateNote: (noteId: string, rating: number) => void;
  onAdImpression: () => void;
  adsEnabled: boolean;
}

const NoteDetails: React.FC<NoteDetailsProps> = ({ notes, user, onPurchase, onDeleteNote, onRateNote, onAdImpression, adsEnabled }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const note = notes.find(n => n.id === id);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const isPurchased = user.purchasedNotes.includes(id || '');
  const canAccess = note?.isFree || isPurchased;
  
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [studyQuestions, setStudyQuestions] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'qr' | 'verifying'>('method');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    setAiSummary(null);
    setStudyQuestions([]);
    setShowPaymentModal(false);
    setPaymentStep('method');
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

  const initiatePurchase = () => {
    setShowPaymentModal(true);
    setPaymentStep('method');
  };

  const confirmPayment = () => {
    if (!transactionId || transactionId.length < 6) {
      alert("Please enter a valid Transaction ID (UTR) to verify your payment.");
      return;
    }
    setPaymentStep('verifying');
    setTimeout(() => {
      if (note) {
        onPurchase(note.id, note.price);
        setShowPaymentModal(false);
        setPaymentStep('method');
        setTransactionId('');
      }
    }, 3000);
  };

  if (!note) return (
    <div className="py-20 text-center">
      <h2 className="text-2xl font-bold">Note not found</h2>
      <Link to="/" className="text-indigo-600 mt-4 block">Return to Marketplace</Link>
    </div>
  );

  const upiUrl = `upi://pay?pa=${ADMIN_UPI_ID}&pn=${encodeURIComponent(ADMIN_NAME)}&am=${note.price}&cu=INR&tn=${encodeURIComponent('Buying: ' + note.title)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiUrl)}`;

  const handleUpiDeepLink = () => {
    window.location.href = upiUrl;
  };

  return (
    <div className="animate-fade-in relative">
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border border-white/20">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Secure Checkout</h3>
                  <p className="text-slate-500 text-xs">Instantly unlock your study material</p>
                </div>
                <button onClick={() => setShowPaymentModal(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-500 w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {paymentStep === 'method' && (
                <div className="space-y-6">
                  <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 text-center mb-6">
                    <p className="text-[10px] text-indigo-400 uppercase font-black tracking-widest mb-1">Total to Pay</p>
                    <div className="text-3xl font-black text-indigo-600">₹{note.price.toFixed(2)}</div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest ml-1 mb-2">Pay via UPI App</p>
                    <button onClick={handleUpiDeepLink} className="w-full flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-50 transition-all group">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-lg">
                          <i className="fa-solid fa-mobile-screen-button"></i>
                        </div>
                        <span className="font-bold text-slate-800">Any UPI App</span>
                      </div>
                      <i className="fa-solid fa-chevron-right text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all"></i>
                    </button>

                    <div className="grid grid-cols-3 gap-3">
                      <button onClick={handleUpiDeepLink} className="flex flex-col items-center p-3 border border-slate-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                        <div className="w-10 h-10 rounded-lg overflow-hidden mb-2">
                           <img src="https://vms.edu.in/wp-content/uploads/2023/10/gpay.png" alt="GPay" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-[10px] font-black text-slate-600">GPay</span>
                      </button>
                      <button onClick={handleUpiDeepLink} className="flex flex-col items-center p-3 border border-slate-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                        <div className="w-10 h-10 rounded-lg overflow-hidden mb-2 p-1 bg-white">
                           <img src="https://logowik.com/content/uploads/images/phonepe-icon8269.jpg" alt="PhonePe" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[10px] font-black text-slate-600">PhonePe</span>
                      </button>
                      <button onClick={handleUpiDeepLink} className="flex flex-col items-center p-3 border border-slate-200 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                        <div className="w-10 h-10 rounded-lg overflow-hidden mb-2 p-1 bg-white">
                           <img src="https://static.vecteezy.com/system/resources/previews/013/441/317/original/paytm-logo-icon-editorial-free-vector.jpg" alt="Paytm" className="w-full h-full object-contain" />
                        </div>
                        <span className="text-[10px] font-black text-slate-600">Paytm</span>
                      </button>
                    </div>
                  </div>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                    <div className="relative flex justify-center"><span className="bg-white px-4 text-xs font-bold text-slate-300">OR</span></div>
                  </div>

                  <button 
                    onClick={() => setPaymentStep('qr')}
                    className="w-full py-4 rounded-2xl border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center space-x-2"
                  >
                    <i className="fa-solid fa-qrcode"></i>
                    <span>Show QR Code</span>
                  </button>
                </div>
              )}

              {paymentStep === 'qr' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="text-center">
                    <div className="bg-slate-50 p-6 rounded-3xl inline-block mb-4 shadow-inner border border-slate-100">
                      <img src={qrCodeUrl} alt="Scan to Pay" className="w-56 h-56 mx-auto mix-blend-multiply" />
                    </div>
                    <p className="text-slate-500 text-xs font-medium">Scan this QR with any UPI app to pay</p>
                    <div className="mt-4 text-xl font-black text-slate-900">₹{note.price.toFixed(2)}</div>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">UTR / Transaction ID (Mandatory)</label>
                      <input 
                        type="text"
                        placeholder="Enter 12-digit UTR number"
                        className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono shadow-sm"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-3">
                       <button onClick={() => setPaymentStep('method')} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-all">Back</button>
                       <button onClick={confirmPayment} className="flex-[2] bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Verify Payment</button>
                    </div>
                  </div>
                </div>
              )}

              {paymentStep === 'verifying' && (
                <div className="py-20 text-center space-y-6 animate-fade-in">
                  <div className="relative flex justify-center">
                    <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                       <i className="fa-solid fa-shield-check text-indigo-600 text-3xl animate-pulse"></i>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-black text-slate-900">Checking Transaction</h4>
                    <p className="text-slate-500 text-sm mt-2">Connecting to banking server...</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 px-8 py-4 flex items-center justify-center space-x-4 border-t border-slate-100">
               <i className="fa-solid fa-lock text-slate-400 text-[10px]"></i>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Bank-to-Bank Transfer</span>
            </div>
          </div>
        </div>
      )}

      <nav className="mb-6 flex items-center space-x-2 text-sm text-slate-500">
        <Link to="/" className="hover:text-indigo-600 transition-colors">Marketplace</Link>
        <i className="fa-solid fa-chevron-right text-[10px]"></i>
        <span className="text-slate-900 font-medium truncate max-w-[200px]">{note.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm overflow-hidden relative">
            <div className="flex flex-wrap items-center gap-2 mb-4">
               <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">{note.category}</span>
               <div className="flex items-center ml-auto bg-amber-50 px-3 py-1 rounded-full">
                  <i className="fa-solid fa-star text-amber-500 text-[10px] mr-1.5"></i>
                  <span className="text-amber-700 text-xs font-black">{note.rating}</span>
               </div>
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-4 leading-tight">{note.title}</h1>
            
            <div className="prose prose-slate max-w-none">
              <div ref={contentRef} className="relative rounded-2xl bg-slate-50 border border-slate-100 overflow-hidden scroll-mt-24">
                <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
                   <h3 className="text-xl font-bold">Document View</h3>
                </div>
                
                {canAccess ? (
                  <div className="bg-white p-6 min-h-[400px]">
                    {note.pdfUrl ? (
                      <iframe src={`${note.pdfUrl}#toolbar=0`} className="w-full h-[600px] border-none" title="PDF Reader" />
                    ) : (
                      <div className="text-slate-700 leading-relaxed font-mono text-sm whitespace-pre-wrap">{note.content}</div>
                    )}
                  </div>
                ) : (
                  <div className="relative p-12 bg-white text-center flex flex-col items-center">
                    <div className="bg-indigo-600 text-white w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-200 rotate-3">
                      <i className="fa-solid fa-lock text-3xl"></i>
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 mb-2">Knowledge Locked</h4>
                    <p className="text-slate-600 mb-8 max-w-xs leading-relaxed">Join the high-achieving students who already purchased this study material.</p>
                    <button onClick={initiatePurchase} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center space-x-3">
                       <i className="fa-solid fa-bolt"></i>
                       <span>Unlock Instant Access</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {canAccess && (
            <div className="bg-gradient-to-br from-indigo-50 to-white rounded-3xl p-8 border border-indigo-100 relative overflow-hidden">
               <div className={`flex items-center justify-between transition-opacity duration-300 ${loadingAI ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 flex items-center">
                    <i className="fa-solid fa-wand-magic-sparkles text-indigo-500 mr-3"></i>AI Study Buddy
                  </h3>
                  <p className="text-slate-600">Let Gemini generate summaries and key questions.</p>
                </div>
                {!aiSummary && <button onClick={handleAskAI} className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Deep Analyze</button>}
              </div>
              {loadingAI && <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm z-20"><div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>}
              {aiSummary && <div className="mt-8 bg-white p-8 rounded-3xl border border-indigo-50 animate-fade-in shadow-sm"><div className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">{aiSummary}</div></div>}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl sticky top-24">
            {!canAccess ? (
              <div className="mb-6">
                <span className="text-slate-500 text-[10px] uppercase font-black tracking-widest ml-1">Investment</span>
                <div className="text-5xl font-black text-slate-900 mt-2">₹{note.price.toFixed(2)}</div>
                <button onClick={initiatePurchase} className="w-full mt-8 bg-indigo-600 text-white py-5 rounded-2xl font-black hover:bg-indigo-700 transition-all flex items-center justify-center space-x-3 shadow-2xl shadow-indigo-100 active:scale-95">
                  <i className="fa-solid fa-cart-plus"></i>
                  <span>Buy Access Now</span>
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-tighter flex items-center justify-center">
                  <i className="fa-solid fa-shield-halved mr-2 text-emerald-500"></i> Secure UPI Verification
                </p>
              </div>
            ) : (
              <div className="mb-6 text-center">
                <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-2xl font-black text-xs uppercase inline-block mb-4 tracking-widest">
                  Purchased Library Item
                </div>
                <div className="text-2xl font-black text-slate-900">Access Granted</div>
              </div>
            )}
            <hr className="my-6 border-slate-50" />
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Material Author</h4>
              <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-slate-200 overflow-hidden shadow-sm">
                  <img src={`https://ui-avatars.com/api/?name=${note.author}&background=random`} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <span className="text-sm font-black text-slate-900 block">{note.author}</span>
                  <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Top Contributor</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar Ads */}
          {adsEnabled && <AdPlacement type="sidebar" onImpression={onAdImpression} />}
        </div>
      </div>
    </div>
  );
};

export default NoteDetails;
