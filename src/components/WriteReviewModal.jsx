import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RiStarFill, 
  RiCloseLine, 
  RiSendPlaneFill, 
  RiCheckboxCircleFill, 
  RiUser3Line, 
  RiChatQuoteLine, 
  RiSparklingFill,
  RiShieldCheckLine,
  RiRefreshLine
} from 'react-icons/ri';
import { useApp } from '../context/AppContext';

const ROLE_OPTIONS = [
  'Verified Buyer',
  'Interior Designer',
  'Tech Enthusiast',
  'Architect & Stylist',
  'Luxury Collector',
  'Verified Customer'
];

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80'
];

const RATING_LABELS = {
  5: 'Excellent (5/5) — Exceeded Expectations!',
  4: 'Very Good (4/5) — Highly Satisfied',
  3: 'Average (3/5) — Meets Expectations',
  2: 'Fair (2/5) — Could Be Better',
  1: 'Poor (1/5) — Disappointed'
};

const WriteReviewModal = ({ isOpen, onClose, onSubmitReview }) => {
  const { user } = useApp();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Verified Buyer');
  const [comment, setComment] = useState('');
  const [avatar, setAvatar] = useState(AVATAR_PRESETS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill user data when modal opens
  useEffect(() => {
    if (isOpen) {
      if (user?.name) {
        setName(user.name);
      }
      if (user?.avatar) {
        setAvatar(user.avatar);
      }
      setError('');
      setIsSubmitting(false);
    }
  }, [isOpen, user]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanComment = comment.trim();

    if (!cleanName) {
      setError('Please provide your name or display nickname.');
      return;
    }
    if (cleanComment.length < 10) {
      setError('Please write at least 10 characters for your review comment.');
      return;
    }
    if (cleanComment.length > 600) {
      setError('Review comment cannot exceed 600 characters.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (onSubmitReview) {
        onSubmitReview({
          name: cleanName,
          role: role || 'Verified Buyer',
          rating: Number(rating) || 5,
          comment: cleanComment,
          avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanName)}`
        });
      }

      // Reset form
      setComment('');
      setRating(5);
      onClose();
    } catch (err) {
      setError('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const activeStarCount = hoverRating || rating;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden z-10 my-auto"
        >
          {/* Header Banner */}
          <div className="relative px-6 pt-6 pb-5 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-slate-50 via-white to-amber-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <RiSparklingFill className="text-amber-500 text-xs" />
                  Verified Buyer Feedback
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close dialog"
              >
                <RiCloseLine size={20} />
              </button>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2">
              Write Your Review
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Share your genuine feedback with thousands of customers across Dubai & UAE.
            </p>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Rating Selector */}
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Your Overall Rating <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                  {activeStarCount} / 5 Stars
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded-lg transition-transform hover:scale-125 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <RiStarFill
                      size={28}
                      className={
                        activeStarCount >= star
                          ? 'text-amber-400 drop-shadow-sm transition-colors'
                          : 'text-slate-200 dark:text-slate-700 transition-colors'
                      }
                    />
                  </button>
                ))}
              </div>

              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 pt-1">
                {RATING_LABELS[activeStarCount] || RATING_LABELS[5]}
              </p>
            </div>

            {/* Name & Role Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <RiUser3Line className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    maxLength={50}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Buyer Badge / Role
                </label>
                <div className="relative">
                  <RiShieldCheckLine className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    maxLength={35}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Verified Buyer, Interior Designer"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Quick Role Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 mr-1">Quick Select:</span>
              {ROLE_OPTIONS.slice(0, 4).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setRole(opt)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    role === opt
                      ? 'bg-primary-500/10 border-primary-500/40 text-primary-600 dark:text-primary-400 font-bold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400 dark:text-slate-400'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Choose Your Avatar
              </label>
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary-500 shrink-0 shadow-sm">
                  <img
                    src={avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name || 'User')}`}
                    alt="Selected Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {AVATAR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(preset)}
                      className={`relative w-9 h-9 rounded-full overflow-hidden border-2 transition-transform hover:scale-105 shrink-0 ${
                        avatar === preset
                          ? 'border-primary-500 ring-2 ring-primary-500/30'
                          : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const seed = Math.random().toString(36).substring(7);
                      setAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`);
                    }}
                    title="Generate Random Avatar"
                    className="w-9 h-9 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-primary-500 hover:border-primary-500 transition-colors shrink-0"
                  >
                    <RiRefreshLine size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Review Comment Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Your Experience / Review <span className="text-rose-500">*</span>
                </label>
                <span className={`text-xs ${comment.length > 550 ? 'text-amber-500 font-bold' : 'text-slate-400'}`}>
                  {comment.length} / 600
                </span>
              </div>
              <div className="relative">
                <textarea
                  required
                  rows={4}
                  maxLength={600}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you loved about the product quality, packaging, delivery speed, or customer service..."
                  className="w-full p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs font-semibold text-rose-600 dark:text-rose-400"
              >
                {error}
              </motion.div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !name.trim() || comment.trim().length < 10}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-700 hover:to-primary-700 shadow-md shadow-primary-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
              >
                <RiSendPlaneFill size={15} />
                {isSubmitting ? 'Submitting...' : 'Post Review'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WriteReviewModal;
