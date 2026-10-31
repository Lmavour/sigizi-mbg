import React, { useState } from 'react';
import { ActiveTab, ReviewPost, SPPG, SchoolGroupStory } from './types';
import {
  INITIAL_SPPGS,
  INITIAL_POSTS,
  INITIAL_NOTIFICATIONS,
  SCHOOL_GROUP_STORIES,
} from './data/mockData';
import { MapView } from './components/MapView';
import { FeedView } from './components/FeedView';
import { NotificationsView } from './components/NotificationsView';
import { ProfileView } from './components/ProfileView';
import { BottomNav } from './components/BottomNav';
import { CameraReviewModal } from './components/CameraReviewModal';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [sppgs, setSppgs] = useState<SPPG[]>(INITIAL_SPPGS);
  const [selectedSPPG, setSelectedSPPG] = useState<SPPG | null>(INITIAL_SPPGS[0]);
  const [posts, setPosts] = useState<ReviewPost[]>(INITIAL_POSTS);
  const [schoolStories, setSchoolStories] = useState<SchoolGroupStory[]>(SCHOOL_GROUP_STORIES);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [targetSPPGForReview, setTargetSPPGForReview] = useState<SPPG | null>(null);
  const [prefilledSchoolName, setPrefilledSchoolName] = useState<string>('');
  const [publishedToast, setPublishedToast] = useState<string | null>(null);

  // Like a post
  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const newIsLiked = !post.isLiked;
          return {
            ...post,
            isLiked: newIsLiked,
            likesCount: newIsLiked ? post.likesCount + 1 : post.likesCount - 1,
          };
        }
        return post;
      })
    );
  };

  // Bookmark a post
  const handleBookmarkPost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post
      )
    );
  };

  // Add comment to a post
  const handleAddComment = (postId: string, text: string) => {
    const newComment = {
      id: `comment-${Date.now()}`,
      author: 'Sari Dewi (Kamu)',
      avatar: '/src/assets/images/student_avatar_indo_1793460566045.jpg',
      text,
      time: 'Baru saja',
    };

    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            commentsCount: post.commentsCount + 1,
            comments: [newComment, ...post.comments],
          };
        }
        return post;
      })
    );
  };

  // Jump from Feed or Review to Map focusing on specific SPPG
  const handleNavigateToSPPGOnMap = (sppgId: string) => {
    const found = sppgs.find((s) => s.id === sppgId);
    if (found) {
      setSelectedSPPG(found);
    }
    setActiveTab('map');
  };

  // Open review for a specific SPPG
  const handleOpenReviewForSPPG = (sppg: SPPG) => {
    setTargetSPPGForReview(sppg);
    setIsCameraModalOpen(true);
  };

  // Submit new review from camera
  const handlePublishReview = (newPost: ReviewPost) => {
    setPosts((prev) => [newPost, ...prev]);
    setActiveTab('feed');
    setPublishedToast('Ulasan Makan Bergizi Gratis berhasil dipublikasikan!');
    setTimeout(() => {
      setPublishedToast(null);
    }, 3500);
  };

  // Mark all notifications read
  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const unreadNotifCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-emerald-950 via-slate-950 to-teal-950 flex flex-col items-center justify-center sm:p-4 select-none">
      {/* Toast Banner on successful review submission */}
      {publishedToast && (
        <div className="fixed top-4 z-50 bg-emerald-500 text-slate-950 px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-bounce">
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          <span>{publishedToast}</span>
        </div>
      )}

      {/* Mobile Device Frame Container */}
      <main className="w-full sm:max-w-[420px] h-[100dvh] sm:h-[860px] sm:max-h-[95vh] sm:rounded-[40px] bg-slate-950 overflow-hidden relative shadow-2xl sm:ring-8 sm:ring-slate-800 flex flex-col">
        {/* Dynamic Island / Mobile Speaker Simulation on Desktop */}
        <div className="hidden sm:flex absolute top-2 inset-x-0 z-40 justify-center pointer-events-none">
          <div className="w-28 h-4 bg-black rounded-full shadow-inner flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-slate-900 border border-slate-700/50 mr-2" />
            <div className="w-2 h-2 rounded-full bg-slate-800" />
          </div>
        </div>

        {/* Viewport Body */}
        <div className="w-full flex-1 min-h-0 relative overflow-hidden flex flex-col">
          {activeTab === 'map' && (
            <MapView
              sppgs={sppgs}
              selectedSPPG={selectedSPPG}
              onSelectSPPG={setSelectedSPPG}
              onOpenReviewForSPPG={handleOpenReviewForSPPG}
            />
          )}

          {activeTab === 'feed' && (
            <FeedView
              posts={posts}
              schoolStories={schoolStories}
              onLikePost={handleLikePost}
              onBookmarkPost={handleBookmarkPost}
              onAddComment={handleAddComment}
              onNavigateToSPPGOnMap={handleNavigateToSPPGOnMap}
              onOpenCreateReview={() => {
                setPrefilledSchoolName('');
                setIsCameraModalOpen(true);
              }}
              onOpenReviewForSchool={(school) => {
                setPrefilledSchoolName(school);
                setIsCameraModalOpen(true);
              }}
            />
          )}

          {activeTab === 'notifications' && (
            <NotificationsView
              notifications={notifications}
              onMarkAllAsRead={handleMarkAllNotificationsRead}
            />
          )}

          {activeTab === 'profile' && <ProfileView />}
        </div>

        {/* Fixed Bottom Navigation Bar with Camera FAB */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onOpenCameraFAB={() => {
            setTargetSPPGForReview(selectedSPPG || sppgs[0]);
            setPrefilledSchoolName('');
            setIsCameraModalOpen(true);
          }}
          unreadCount={unreadNotifCount}
        />

        {/* Camera Review Modal */}
        <CameraReviewModal
          isOpen={isCameraModalOpen}
          onClose={() => {
            setIsCameraModalOpen(false);
            setTargetSPPGForReview(null);
            setPrefilledSchoolName('');
          }}
          sppgs={sppgs}
          initialSPPG={targetSPPGForReview}
          initialSchoolName={prefilledSchoolName}
          onSubmitReview={handlePublishReview}
        />
      </main>
    </div>
  );
}
