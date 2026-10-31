import React, { useState } from 'react';
import { ReviewPost, SPPG, SchoolGroupStory } from '../types';
import {
  calculateNutritionScore,
  calculateNutriScoreGrade,
  formatWasteStatus,
  formatCount,
} from '../utils/nutrition';
import { StoryBar } from './StoryBar';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Star,
  MapPin,
  GraduationCap,
  Sparkles,
  Send,
  X,
  CheckCircle,
  Award,
} from 'lucide-react';

interface FeedViewProps {
  posts: ReviewPost[];
  schoolStories: SchoolGroupStory[];
  onLikePost: (postId: string) => void;
  onBookmarkPost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onNavigateToSPPGOnMap: (sppgId: string) => void;
  onOpenCreateReview: () => void;
  onOpenReviewForSchool?: (schoolName: string) => void;
}

export const FeedView: React.FC<FeedViewProps> = ({
  posts,
  schoolStories,
  onLikePost,
  onBookmarkPost,
  onAddComment,
  onNavigateToSPPGOnMap,
  onOpenCreateReview,
  onOpenReviewForSchool,
}) => {
  const [activeCommentPost, setActiveCommentPost] = useState<ReviewPost | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [doubleTapHeartPostId, setDoubleTapHeartPostId] = useState<string | null>(null);
  const [showShareToast, setShowShareToast] = useState(false);

  // Handle double tap to like (Instagram/Snapchat style)
  const handleDoubleTap = (post: ReviewPost) => {
    if (!post.isLiked) {
      onLikePost(post.id);
    }
    setDoubleTapHeartPostId(post.id);
    setTimeout(() => {
      setDoubleTapHeartPostId(null);
    }, 900);
  };

  const handleShare = (post: ReviewPost) => {
    if (navigator.share) {
      navigator
        .share({
          title: `Ulasan MBG oleh @${post.authorHandle}`,
          text: post.caption,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCommentPost || !commentInput.trim()) return;
    onAddComment(activeCommentPost.id, commentInput.trim());
    setCommentInput('');
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-black select-none">
      {/* Toast Alert for Share */}
      {showShareToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl flex items-center gap-1.5 animate-bounce">
          <CheckCircle className="w-4 h-4" />
          Tautan ulasan berhasil disalin!
        </div>
      )}

      {/* Top Header Zone: Brand Bar + School Stories Carousel */}
      <div className="shrink-0 z-30 w-full bg-gradient-to-b from-black/95 via-black/80 to-transparent border-b border-white/10 backdrop-blur-md">
        {/* Row 1: Brand & MBG Status */}
        <div className="px-3 pt-2 pb-1 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black tracking-tight text-white">SiGizi</span>
            <span className="text-white/40 text-[10px]">·</span>
            <span className="text-white/80 text-[11px] font-semibold">Ulasan MBG</span>
          </div>

          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full">
            <Award className="w-3 h-3 text-emerald-400" />
            <span>4 Sehat 5 Sempurna</span>
          </div>
        </div>

        {/* Row 2: School Stories Carousel */}
        <StoryBar
          stories={schoolStories}
          onOpenCreateReview={onOpenCreateReview}
          onOpenReviewForSchool={onOpenReviewForSchool}
        />
      </div>

      {/* Scrollable Vertical Posts Container (Takes 100% remaining height, snaps each post) */}
      <div className="flex-1 min-h-0 w-full overflow-y-auto no-scrollbar snap-y snap-mandatory">
        {posts.map((post) => {
          const nutrition = calculateNutritionScore(post.nutritionTags);
          const nutriScore = calculateNutriScoreGrade(nutrition.score);
          const waste = formatWasteStatus(post.wasteStatus);

          return (
            <article
              key={post.id}
              className="relative w-full h-full min-h-[440px] snap-start shrink-0 flex flex-col justify-end overflow-hidden bg-slate-950 select-none"
            >
              {/* Full-Bleed Media Area (Instagram / Snapchat Reels Hybrid) */}
              <div
                className="absolute inset-0 z-0 cursor-pointer"
                onDoubleClick={() => handleDoubleTap(post)}
              >
                <img
                  src={post.mediaUrl}
                  alt={post.caption}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                {/* Subtle Vignette Gradient for text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/30 pointer-events-none" />
              </div>

              {/* Double Tap Big Heart Animation */}
              {doubleTapHeartPostId === post.id && (
                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-ping">
                  <Heart className="w-24 h-24 fill-rose-500 text-rose-500 drop-shadow-2xl" />
                </div>
              )}

              {/* Snapchat / IG Style Interactive Sticker Overlay on Food */}
              {post.sticker && (
                <div className="absolute top-4 right-3.5 z-20 pointer-events-none animate-pulse">
                  <div className="backdrop-blur-md bg-white/95 text-slate-950 font-black text-xs px-3 py-1.5 rounded-2xl shadow-2xl border border-white/60 -rotate-3 flex items-center gap-1.5 ring-2 ring-emerald-500/50">
                    <span>{post.sticker}</span>
                  </div>
                </div>
              )}

              {/* Right Action Bar (Instagram & Snapchat Floating Column) */}
              <div className="absolute right-2.5 bottom-3 z-20 flex flex-col items-center gap-3.5 text-white">
                {/* Like Button */}
                <button
                  onClick={() => onLikePost(post.id)}
                  aria-label={`Sukai ulasan (${post.likesCount})`}
                  className="flex flex-col items-center group active:scale-90 transition-transform"
                >
                  <div
                    className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border shadow-lg transition-colors ${
                      post.isLiked
                        ? 'bg-rose-500/30 border-rose-500 text-rose-500'
                        : 'bg-black/50 border-white/20 text-white hover:bg-black/70'
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 transition-all ${
                        post.isLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-white'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-bold mt-0.5 text-white drop-shadow-md">
                    {formatCount(post.likesCount)}
                  </span>
                </button>

                {/* Comment Button */}
                <button
                  onClick={() => setActiveCommentPost(post)}
                  aria-label={`Buka komentar (${post.commentsCount})`}
                  className="flex flex-col items-center group active:scale-90 transition-transform"
                >
                  <div className="w-10 h-10 rounded-full backdrop-blur-md bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-black/70 shadow-lg">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold mt-0.5 text-white drop-shadow-md">
                    {formatCount(post.commentsCount)}
                  </span>
                </button>

                {/* Bookmark Button */}
                <button
                  onClick={() => onBookmarkPost(post.id)}
                  aria-label="Simpan ulasan"
                  className="flex flex-col items-center group active:scale-90 transition-transform"
                >
                  <div
                    className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center border shadow-lg transition-colors ${
                      post.isBookmarked
                        ? 'bg-amber-500/30 border-amber-400 text-amber-400'
                        : 'bg-black/50 border-white/20 text-white hover:bg-black/70'
                    }`}
                  >
                    <Bookmark
                      className={`w-4 h-4 ${post.isBookmarked ? 'fill-amber-400' : ''}`}
                    />
                  </div>
                  <span className="text-[10px] font-bold mt-0.5 text-white drop-shadow-md">
                    {post.isBookmarked ? 'Simpan' : 'Simpan'}
                  </span>
                </button>

                {/* Share Button */}
                <button
                  onClick={() => handleShare(post)}
                  aria-label="Bagikan ulasan"
                  className="flex flex-col items-center group active:scale-90 transition-transform"
                >
                  <div className="w-10 h-10 rounded-full backdrop-blur-md bg-black/50 border border-white/20 flex items-center justify-center text-white hover:bg-black/70 shadow-lg">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold mt-0.5 text-white drop-shadow-md">Bagi</span>
                </button>
              </div>

              {/* Bottom Compact Glassmorphic Card (Fits all phone heights without clipping) */}
              <div className="relative z-20 mr-14 ml-3 mb-2.5">
                <div className="backdrop-blur-xl bg-black/60 border border-white/25 rounded-2xl p-3 text-white shadow-2xl">
                  {/* Header: Avatar, Username, Stars */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-400 border border-white/40 shadow-md shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white tracking-tight truncate">
                            @{post.authorHandle}
                          </span>
                          <span className="text-[8px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full shrink-0">
                            Pelajar
                          </span>
                        </div>
                        <p className="text-[10px] text-white/80 flex items-center gap-1 mt-0.5 truncate">
                          <GraduationCap className="w-3 h-3 text-emerald-300 shrink-0" />
                          <span className="truncate">{post.schoolName}</span>
                        </p>
                      </div>
                    </div>

                    {/* 5 Stars Rating display */}
                    <div className="flex items-center gap-0.5 shrink-0 bg-black/50 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/15 shadow-sm">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3 h-3 ${
                            star <= post.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* SPPG Location Badge (Clickable: navigates to map) */}
                  <button
                    onClick={() => onNavigateToSPPGOnMap(post.sppgId)}
                    className="mt-1.5 text-[10px] font-semibold text-emerald-200 hover:text-white flex items-center gap-1 bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-400/30 px-2 py-0.5 rounded-lg transition-colors text-left w-full"
                  >
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate flex-1">{post.sppgName}</span>
                    <span className="text-[9px] text-emerald-300 underline shrink-0">
                      Lihat Peta
                    </span>
                  </button>

                  {/* Student Review Caption */}
                  <p className="mt-1.5 text-xs text-white/95 leading-snug line-clamp-3">
                    {post.caption}
                  </p>

                  {/* Hashtags & Waste Status Row */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1">
                    {post.wasteStatus && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded border flex items-center gap-1 ${waste.badgeClass}`}
                      >
                        <span>{waste.icon}</span>
                        <span>{waste.label}</span>
                      </span>
                    )}
                    {post.tags.slice(0, 2).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold text-emerald-300 hover:underline cursor-pointer"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="text-[9px] text-white/50 ml-auto">{post.timestamp}</span>
                  </div>

                  {/* 4 Sehat 5 Sempurna Nutrition Verification Strip */}
                  <div className="mt-2 pt-1.5 border-t border-white/15 flex items-center justify-between text-[9px]">
                    <span className="text-white/70 font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-300" />
                      Gizi:
                    </span>
                    <div className="flex items-center gap-1 font-bold">
                      <span
                        className={`px-1 py-0.2 rounded ${
                          post.nutritionTags.karbo
                            ? 'bg-emerald-500/80 text-white'
                            : 'bg-white/10 text-white/40'
                        }`}
                      >
                        Karbo
                      </span>
                      <span
                        className={`px-1 py-0.2 rounded ${
                          post.nutritionTags.protein
                            ? 'bg-emerald-500/80 text-white'
                            : 'bg-white/10 text-white/40'
                        }`}
                      >
                        Protein
                      </span>
                      <span
                        className={`px-1 py-0.2 rounded ${
                          post.nutritionTags.sayur
                            ? 'bg-emerald-500/80 text-white'
                            : 'bg-white/10 text-white/40'
                        }`}
                      >
                        Sayur
                      </span>
                      <span
                        className={`px-1 py-0.2 rounded ${
                          post.nutritionTags.buah
                            ? 'bg-emerald-500/80 text-white'
                            : 'bg-white/10 text-white/40'
                        }`}
                      >
                        Buah
                      </span>
                      <span
                        className={`px-1 py-0.2 rounded ${
                          post.nutritionTags.susu
                            ? 'bg-emerald-400 text-slate-950 font-black'
                            : 'bg-white/10 text-white/40'
                        }`}
                      >
                        Susu MBG
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Comment Drawer Bottom Sheet */}
      {activeCommentPost && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg mx-auto bg-slate-900 border-t border-slate-800 rounded-t-3xl p-4 max-h-[75vh] flex flex-col shadow-2xl">
            {/* Sheet Handle & Title */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="w-8" />
              <div className="flex flex-col items-center">
                <div className="w-10 h-1 bg-slate-700 rounded-full mb-2" />
                <h3 className="text-sm font-bold text-white">
                  Komentar Pelajar ({activeCommentPost.comments.length})
                </h3>
              </div>
              <button
                onClick={() => setActiveCommentPost(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full"
                aria-label="Tutup komentar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto no-scrollbar py-3 space-y-3">
              {activeCommentPost.comments.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Belum ada komentar untuk menu ini. Jadilah yang pertama berkomentar! 💬
                </div>
              ) : (
                activeCommentPost.comments.map((comment) => (
                  <div key={comment.id} className="flex items-start gap-2.5">
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full bg-slate-800 shrink-0"
                    />
                    <div className="flex-1 bg-slate-800/80 rounded-2xl p-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{comment.author}</span>
                        <span className="text-[10px] text-slate-400">{comment.time}</span>
                      </div>
                      <p className="text-slate-300 mt-1">{comment.text}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Comment Input */}
            <form onSubmit={handleSendComment} className="pt-2 border-t border-slate-800 flex gap-2">
              <input
                type="text"
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Tulis ulasan rasa atau saran menu..."
                className="flex-1 bg-slate-800 text-white text-xs rounded-xl px-3 py-2.5 border border-slate-700 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                disabled={!commentInput.trim()}
                aria-label="Kirim komentar"
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3.5 py-2.5 rounded-xl font-bold flex items-center justify-center transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
