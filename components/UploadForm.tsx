
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Category, Note, User } from '../types';
import { suggestTags } from '../services/geminiService';

interface UploadFormProps {
  onUpload: (note: Note) => void;
  user: User;
}

const UploadForm: React.FC<UploadFormProps> = ({ onUpload, user }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    price: 0,
    category: Category.OTHER,
    isFree: false
  });
  const [tags, setTags] = useState<string[]>([]);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [suggestingTags, setSuggestingTags] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeThumbnail = () => {
    setThumbnailUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const newNote: Note = {
      id: Math.random().toString(36).substr(2, 9),
      title: formData.title,
      description: formData.description,
      content: formData.content,
      author: user.name, // Use actual logged-in user name
      price: formData.isFree ? 0 : Number(formData.price),
      category: formData.category,
      rating: 5.0,
      tags: tags,
      createdAt: new Date().toISOString().split('T')[0],
      isFree: formData.isFree,
      thumbnailUrl: thumbnailUrl || `https://picsum.photos/seed/${formData.title}/600/400`
    };

    setTimeout(() => {
      onUpload(newNote);
      setLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  const handleSuggestTags = async () => {
    if (!formData.title || !formData.content) {
      alert("Please enter title and content first to get smart tag suggestions.");
      return;
    }
    setSuggestingTags(true);
    try {
      const suggested = await suggestTags(formData.title, formData.content);
      setTags(prev => Array.from(new Set([...prev, ...suggested])));
    } catch (error) {
      console.error(error);
    } finally {
      setSuggestingTags(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex items-center space-x-4 mb-8">
        <div className="bg-indigo-100 p-3 rounded-2xl">
           <i className="fa-solid fa-cloud-arrow-up text-indigo-600 text-2xl"></i>
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900">Publish Your Expertise</h1>
          <p className="text-slate-500">Share your knowledge as <span className="text-indigo-600 font-bold">{user.name}</span>.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-sm space-y-6">
          
          {/* Thumbnail Upload Section */}
          <div className="space-y-4">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Note Thumbnail</label>
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`relative w-full sm:w-64 h-40 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                  thumbnailUrl ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-indigo-300'
                }`}
              >
                {thumbnailUrl ? (
                  <>
                    <img src={thumbnailUrl} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-bold">Change Image</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <i className="fa-solid fa-image text-slate-400 text-3xl mb-2"></i>
                    <p className="text-xs text-slate-500 font-medium">Click to upload custom thumbnail</p>
                    <p className="text-[10px] text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-3">
                <p className="text-sm text-slate-500 leading-relaxed">
                  A high-quality thumbnail helps your note stand out. If no image is uploaded, we'll generate a unique pattern for you.
                </p>
                {thumbnailUrl && (
                  <button 
                    type="button"
                    onClick={removeThumbnail}
                    className="text-xs text-red-500 font-bold hover:text-red-700 transition-colors flex items-center"
                  >
                    <i className="fa-solid fa-trash-can mr-1"></i>
                    Remove Thumbnail
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-50">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Note Title</label>
              <input 
                required
                type="text" 
                placeholder="e.g. Master Organic Chemistry II"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Category</label>
              <select 
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all bg-white"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as Category})}
              >
                {Object.values(Category).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Short Description</label>
            <textarea 
              required
              placeholder="What will students learn from this note?"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Note Content (Markdown Supported)</label>
            <textarea 
              required
              placeholder="Paste or type your detailed study notes here..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-64 resize-none font-mono text-sm"
              value={formData.content}
              onChange={e => setFormData({...formData, content: e.target.value})}
            />
          </div>

          <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="isFree"
                      className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                      checked={formData.isFree}
                      onChange={e => setFormData({...formData, isFree: e.target.checked})}
                    />
                    <label htmlFor="isFree" className="text-slate-700 font-bold cursor-pointer">List for Free</label>
                  </div>
                  {!formData.isFree && (
                    <div className="flex items-center space-x-2">
                       <span className="text-slate-600 font-bold">₹</span>
                       <input 
                        type="number" 
                        step="0.01"
                        placeholder="Price"
                        className="w-24 px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                       />
                    </div>
                  )}
                </div>
                <div className="text-right">
                   <p className="text-xs text-slate-500 mb-1">Author Revenue Share</p>
                   <p className="text-emerald-600 font-bold">85% of Sale Price</p>
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Tags</label>
                <button 
                  type="button"
                  onClick={handleSuggestTags}
                  disabled={suggestingTags}
                  className="text-xs text-indigo-600 font-bold flex items-center hover:text-indigo-800 transition-colors disabled:opacity-50"
                >
                  {suggestingTags ? <i className="fa-solid fa-spinner fa-spin mr-1"></i> : <i className="fa-solid fa-wand-magic-sparkles mr-1"></i>}
                  Suggest with AI
                </button>
             </div>
             <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <span key={idx} className="bg-white border border-slate-200 px-3 py-1 rounded-full text-sm text-slate-600 flex items-center shadow-sm">
                    {tag}
                    <button 
                      type="button" 
                      onClick={() => setTags(tags.filter((_, i) => i !== idx))}
                      className="ml-2 text-slate-400 hover:text-red-500"
                    >
                      <i className="fa-solid fa-xmark text-xs"></i>
                    </button>
                  </span>
                ))}
                <input 
                  type="text"
                  placeholder="Add a tag..."
                  className="bg-transparent text-sm outline-none px-2 py-1 flex-grow border-b border-dashed border-slate-300 focus:border-indigo-400 transition-colors"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (val && !tags.includes(val)) setTags([...tags, val]);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }}
                />
             </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
           <button 
            type="button" 
            onClick={() => navigate('/')}
            className="px-8 py-4 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all"
           >
             Cancel
           </button>
           <button 
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-12 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center disabled:opacity-50"
           >
             {loading ? <i className="fa-solid fa-circle-notch fa-spin mr-2"></i> : null}
             Publish Now
           </button>
        </div>
      </form>
    </div>
  );
};

export default UploadForm;
