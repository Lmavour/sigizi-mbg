import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { SchoolGroupStory, StudentStoryItem } from '../types';
import { formatWasteStatus } from '../utils/nutrition';
import {
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Utensils,
  Star,
  GraduationCap,
  Clock,
  Heart,
  Flame,
  CheckCircle2,
  Users,
} from 'lucide-react';

interface StoryBarProps {
  stories: SchoolGroupStory[];
  onOpenCreateReview: () => void;
  onOpenReviewForSchool?: (schoolName: string) => void;
}

export const StoryBar: React.FC<StoryBarProps> = ({
  stories,
  onOpenCreateReview,
  onOpenReviewForSchool,
}) => {
  const [activeSchoolIndex, setActiveSchoolIndex] = useState<number | null>(null);
  const [activeStudentIndex, setActiveStudentIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [reactionSent, setReactionSent] = useState<string | null>(null);

  const activeSchool = activeSchoolIndex !== null ? stories[activeSchoolIndex] : null;
  const currentStudents = activeSchool ? activeSchool.students : [];
  const activeStudent = currentStudents[activeStudentIndex] || null;

  // Auto-advance progress timer for student stories inside the school
  useEffect(() => {
    if (activeSchoolIndex === null || !activeStudent || isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Next student in current school
          if (activeStudentIndex < currentStudents.length - 1) {
            setActiveStudentIndex((prevIdx) => prevIdx + 1);
            return 0;
          }
          // Next school
          else if (activeSchoolIndex < stories.length - 1) {
            setActiveSchoolIndex((prevSchool) => prevSchool! + 1);
            setActiveStudentIndex(0);
            return 0;
          }
          // All done
          else {
            setActiveSchoolIndex(null);
            setActiveStudentIndex(0);
            return 0;
          }
        }
        return prev + 2.5; // ~4s per student story
      });
    }, 100);

    return () => clearInterval(interval);
  }, [activeSchoolIndex, activeStudentIndex, isPaused, currentStudents.length, stories.length, activeStudent]);

  const handleOpenSchool = (index: number) => {
    setActiveSchoolIndex(index);
    setActiveStudentIndex(0);
    setProgress(0);
  };

  const handlePrev = () => {
    if (activeStudentIndex > 0) {
      setActiveStudentIndex(activeStudentIndex - 1);
      setProgress(0);
    } else if (activeSchoolIndex !== null && activeSchoolIndex > 0) {
      const prevSchoolIdx = activeSchoolIndex - 1;
      setActiveSchoolIndex(prevSchoolIdx);
      setActiveStudentIndex(stories[prevSchoolIdx].students.length - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (activeStudentIndex < currentStudents.length - 1) {
      setActiveStudentIndex(activeStudentIndex + 1);
      setProgress(0);
    } else if (activeSchoolIndex !== null && activeSchoolIndex < stories.length - 1) {
      setActiveSchoolIndex(activeSchoolIndex + 1);
      setActiveStudentIndex(0);
      setProgress(0);
    } else {
      setActiveSchoolIndex(null);
    }
  };

  const handleSendReaction = (emoji: string) => {
    setReactionSent(emoji);
    setTimeout(() => setReactionSent(null), 1800);
  };

  return (
    <>
      {/* Horizontal Story Bar - Groups students by their school */}
      <div className="w-full py-2.5 px-3 overflow-x-auto no-scrollbar flex items-center gap-3.5 z-20 pointer-events-auto bg-gradient-to-b from-black/80 to-transparent">
        {/* Your Story / Add Review Button */}
        <button
          onClick={onOpenCreateReview}
          className="flex flex-col items-center shrink-0 group focus:outline-none"
          aria-label="Tambah Ulasan MBG Baru"
        >
          <div className="relative w-14 h-14 rounded-full p-0.5 border-2 border-dashed border-emerald-400/80 flex items-center justify-center bg-slate-900 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-emerald-950 flex items-center justify-center text-emerald-400">
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-slate-950 shadow-md">
              <span className="text-[10px] font-black">+</span>
            </div>
          </div>
          <span className="text-[10px] font-semibold text-white/90 mt-1 max-w-[54px] truncate">
            Ulas Menu
          </span>
        </button>

        {/* School Circles with Student Count Badges */}
        {stories.map((school, idx) => (
          <button
            key={school.id}
            onClick={() => handleOpenSchool(idx)}
            className="flex flex-col items-center shrink-0 group focus:outline-none"
            aria-label={`Lihat Cerita Siswa dari ${school.schoolName}`}
          >
            <div
              className={`relative w-14 h-14 rounded-full p-0.5 flex items-center justify-center transition-transform group-hover:scale-105 ${
                school.hasUnviewed
                  ? 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-lime-400 ring-2 ring-emerald-400/50'
                  : 'bg-slate-700'
              }`}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-900 p-0.5">
                <img
                  src={school.schoolLogo}
                  alt={school.schoolName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              {/* Student count pill badge */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-slate-900/90 text-emerald-300 border border-emerald-500/50 text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-sm whitespace-nowrap">
                {school.students.length} siswa
              </div>
            </div>
            <span className="text-[10px] font-semibold text-white/90 mt-1.5 max-w-[62px] truncate">
              {school.shortName}
            </span>
          </button>
        ))}
      </div>

      {/* Story Viewer Modal - Displays the STUDENT who made the review */}
      {activeSchool && activeStudent && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none sm:p-4"
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
        >
          <div className="relative w-full sm:max-w-md h-full sm:h-[92vh] sm:max-h-[860px] sm:rounded-3xl rounded-none overflow-hidden bg-slate-950 flex flex-col justify-between shadow-2xl sm:border border-slate-800">
            {/* Top Progress Bars - Segments for each student in this school */}
            <div className="absolute top-3 inset-x-3.5 z-30 flex items-center gap-1.5">
              {currentStudents.map((std, i) => (
                <div
                  key={std.id}
                  className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-emerald-400 transition-all duration-100"
                    style={{
                      width:
                        i < activeStudentIndex
                          ? '100%'
                          : i === activeStudentIndex
                          ? `${progress}%`
                          : '0%',
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Header: Displays the STUDENT (siswanya) as requested, grouped by their school */}
            <div className="absolute top-6 inset-x-3 z-30 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Student Avatar */}
                <img
                  src={activeStudent.studentAvatar}
                  alt={activeStudent.studentName}
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full ring-2 ring-emerald-400 bg-slate-800 object-cover shadow-lg shrink-0"
                />
                <div className="min-w-0">
                  {/* Student Name & Class */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-bold text-white truncate max-w-[150px]">
                      {activeStudent.studentName}
                    </h4>
                    <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.2 rounded-full shrink-0">
                      {activeStudent.gradeClass}
                    </span>
                  </div>
                  {/* Handle & School Name */}
                  <p className="text-[10px] text-white/80 flex items-center gap-1 mt-0.5 truncate">
                    <GraduationCap className="w-3 h-3 text-emerald-300 shrink-0" />
                    <span className="truncate">
                      @{activeStudent.studentHandle} · {activeSchool.schoolName}
                    </span>
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setActiveSchoolIndex(null)}
                className="p-1.5 rounded-full bg-black/50 backdrop-blur-md text-white/80 hover:text-white shrink-0 ml-2"
                aria-label="Tutup Cerita Siswa"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tap Navigation Targets (Left / Right) */}
            <div className="absolute inset-y-20 inset-x-0 z-20 flex">
              <div
                className="w-1/3 h-full cursor-pointer"
                onClick={handlePrev}
                aria-label="Siswa sebelumnya"
              />
              <div
                className="w-2/3 h-full cursor-pointer"
                onClick={handleNext}
                aria-label="Siswa berikutnya"
              />
            </div>

            {/* Main Student Review Food Photo */}
            <div className="relative w-full h-full">
              <img
                src={activeStudent.photo}
                alt={activeStudent.menuName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/50" />
            </div>

            {/* Student's Snapchat / IG Style Sticker Overlay on Photo */}
            {activeStudent.sticker && (
              <div className="absolute top-20 right-4 z-30 pointer-events-none animate-pulse">
                <div className="backdrop-blur-md bg-white/95 text-slate-950 font-black text-xs px-3 py-1.5 rounded-2xl shadow-2xl border border-white/60 -rotate-3 flex items-center gap-1.5 ring-2 ring-emerald-500/50">
                  <span>{activeStudent.sticker}</span>
                </div>
              </div>
            )}

            {/* Reaction Floater Animation */}
            {reactionSent && (
              <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none animate-bounce">
                <span className="text-7xl drop-shadow-2xl">{reactionSent}</span>
              </div>
            )}

            {/* Bottom Card - Student Review & Menu Details */}
            <div className="absolute bottom-16 inset-x-3 z-30 p-4 rounded-3xl bg-black/70 backdrop-blur-xl border border-white/20 text-white shadow-2xl">
              {/* Student Rating & Menu Name */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= activeStudent.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-white/30'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-bold text-amber-300 ml-1">
                    {activeStudent.rating}.0/5
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30">
                  <Clock className="w-3 h-3" />
                  <span>{activeStudent.time}</span>
                </div>
              </div>

              {/* Student Quote / Review */}
              <p className="mt-2 text-xs text-white/95 leading-relaxed font-medium italic">
                "{activeStudent.caption}"
              </p>

              {/* Menu & Waste Tag */}
              <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] bg-white/10 text-emerald-300 px-2 py-0.5 rounded-md font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {activeStudent.menuName}
                </span>

                {activeStudent.wasteStatus && (
                  <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-md font-semibold">
                    {formatWasteStatus(activeStudent.wasteStatus).label}
                  </span>
                )}
              </div>

              {/* Quick Reactions Bar & Action CTA */}
              <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSendReaction('❤️')}
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-sm active:scale-90 transition-transform"
                    aria-label="Kirim suka"
                  >
                    ❤️
                  </button>
                  <button
                    onClick={() => handleSendReaction('🔥')}
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-sm active:scale-90 transition-transform"
                    aria-label="Kirim mantap"
                  >
                    🔥
                  </button>
                  <button
                    onClick={() => handleSendReaction('🥛')}
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-sm active:scale-90 transition-transform"
                    aria-label="Kirim susu"
                  >
                    🥛
                  </button>
                  <button
                    onClick={() => handleSendReaction('😋')}
                    className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-sm active:scale-90 transition-transform"
                    aria-label="Kirim lezat"
                  >
                    😋
                  </button>
                </div>

                {/* Counter of students in this school */}
                <div className="text-[10px] text-white/70 font-semibold bg-white/10 px-2.5 py-1 rounded-xl">
                  Siswa {activeStudentIndex + 1} dari {currentStudents.length}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
