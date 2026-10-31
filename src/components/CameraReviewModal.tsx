import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { SPPG, ReviewPost, NutritionTags } from '../types';
import {
  Camera,
  X,
  FlipHorizontal,
  Zap,
  Grid,
  Star,
  Check,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';

interface CameraReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  sppgs: SPPG[];
  initialSPPG?: SPPG | null;
  initialSchoolName?: string;
  onSubmitReview: (newPost: ReviewPost) => void;
}

export const CameraReviewModal: React.FC<CameraReviewModalProps> = ({
  isOpen,
  onClose,
  sppgs,
  initialSPPG,
  initialSchoolName,
  onSubmitReview,
}) => {
  const [step, setStep] = useState<'camera' | 'details'>('camera');
  const [isFlashing, setIsFlashing] = useState(false);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [facingMode, setFacingMode] = useState<'back' | 'front'>('back');

  // Selected media preview
  const sampleMedia = [
    '/src/assets/images/mbg_lunch_tray_1_1793460565139.jpg',
    '/src/assets/images/mbg_lunch_tray_2_1793460564429.jpg',
  ];
  const [selectedPhoto, setSelectedPhoto] = useState<string>(sampleMedia[0]);
  const [selectedSticker, setSelectedSticker] = useState<string>('🔥 Hangat & Segar 45°C');
  const [wasteStatus, setWasteStatus] = useState<'habis' | 'sisa_sayur' | 'sisa_karbo'>('habis');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Form states
  const [selectedSPPGId, setSelectedSPPGId] = useState<string>(
    initialSPPG?.id || sppgs[0]?.id || ''
  );
  const [schoolName, setSchoolName] = useState(initialSchoolName || 'SMA Negeri 1 Jakarta');

  React.useEffect(() => {
    if (initialSchoolName) {
      setSchoolName(initialSchoolName);
    }
  }, [initialSchoolName]);
  const [rating, setRating] = useState(5);
  const [caption, setCaption] = useState(
    'Makan siang MBG hari ini mantap banget! Lauknya gurih dan sayurnya segar! 10/10 ⭐'
  );
  const [nutritionTags, setNutritionTags] = useState<NutritionTags>({
    karbo: true,
    protein: true,
    sayur: true,
    buah: true,
    susu: true,
  });

  if (!isOpen) return null;

  const currentSPPG = sppgs.find((s) => s.id === selectedSPPGId) || sppgs[0];

  // Handle Real File Upload from Phone / Device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setSelectedPhoto(event.target.result as string);
          setStep('details');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Shutter Snap action
  const handleSnap = () => {
    setIsFlashing(true);
    setTimeout(() => {
      setIsFlashing(false);
      setStep('details');
    }, 350);
  };

  const handleToggleNutrition = (key: keyof NutritionTags) => {
    setNutritionTags((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAddHashtag = (tag: string) => {
    if (!caption.includes(tag)) {
      setCaption((prev) => `${prev.trim()} ${tag}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newPost: ReviewPost = {
      id: `post-${Date.now()}`,
      sppgId: currentSPPG.id,
      sppgName: currentSPPG.name,
      schoolName: schoolName.trim() || 'SMA Pelajar Indonesia',
      authorName: 'Sari Dewi Anggraini',
      authorHandle: 'sari_dewi_smansa',
      authorAvatar: '/src/assets/images/student_avatar_indo_1793460566045.jpg',
      mediaUrl: selectedPhoto,
      mediaType: 'image',
      caption: caption.trim(),
      tags: ['#MakanBergiziGratis', '#SiGizi', '#ReviewMBG'],
      rating,
      nutritionTags,
      sticker: selectedSticker,
      wasteStatus,
      likesCount: 1,
      commentsCount: 0,
      sharesCount: 0,
      isLiked: true,
      isBookmarked: false,
      timestamp: 'Baru saja',
      comments: [],
    };

    onSubmitReview(newPost);
    onClose();
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md sm:p-4 p-0">
      <div className="relative w-full sm:max-w-md h-full sm:h-[92vh] sm:max-h-[820px] bg-slate-950 sm:rounded-3xl rounded-none overflow-hidden sm:border border-slate-800 shadow-2xl flex flex-col">
        {/* Flash overlay */}
        {isFlashing && (
          <div className="absolute inset-0 bg-white z-50 transition-opacity duration-300 pointer-events-none" />
        )}

        {/* Top Header */}
        <div className="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-white shrink-0 z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-sm font-bold tracking-tight">
              {step === 'camera' ? 'Kamera MBG SiGizi' : 'Rincian Ulasan Makanan'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup kamera"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: Camera Viewfinder */}
        {step === 'camera' && (
          <div className="relative flex-1 flex flex-col justify-between overflow-hidden bg-black">
            {/* Viewfinder Area */}
            <div className="relative w-full flex-1 overflow-hidden">
              <img
                src={selectedPhoto}
                alt="Bidik Sajian MBG"
                className="w-full h-full object-cover"
              />

              {/* Grid Lines Overlay */}
              {showGrid && (
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-r border-b border-white/20" />
                  <div className="border-b border-white/20" />
                  <div className="border-r border-white/20" />
                  <div className="border-r border-white/20" />
                  <div className="" />
                </div>
              )}

              {/* Top Viewfinder Controls */}
              <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
                <button
                  type="button"
                  onClick={() => setIsFlashActive(!isFlashActive)}
                  aria-label="Toggle Flash"
                  className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${
                    isFlashActive
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-black/50 text-white hover:bg-black/70'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                </button>

                <div className="bg-black/50 backdrop-blur-md text-[11px] text-white/90 px-3 py-1 rounded-full border border-white/10 font-medium">
                  {facingMode === 'back' ? 'Kamera Belakang (1x)' : 'Kamera Depan'}
                </div>

                <button
                  type="button"
                  onClick={() => setShowGrid(!showGrid)}
                  aria-label="Toggle Grid"
                  className={`w-9 h-9 rounded-full backdrop-blur-md flex items-center justify-center transition-colors ${
                    showGrid
                      ? 'bg-emerald-500 text-white'
                      : 'bg-black/50 text-white/60 hover:bg-black/70'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
              </div>

              {/* Viewfinder Center Focus Target */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-40 h-40 border-2 border-emerald-400/60 rounded-3xl animate-pulse flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
              </div>

              {/* Quick photo presets picker */}
              <div className="absolute bottom-4 inset-x-4 z-10 flex items-center justify-center gap-2">
                <span className="text-[10px] text-white/70 font-semibold bg-black/60 px-2 py-0.5 rounded-full">
                  Pilih Contoh Menu:
                </span>
                {sampleMedia.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPhoto(url)}
                    className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-transform ${
                      selectedPhoto === url
                        ? 'border-emerald-400 scale-110 shadow-lg'
                        : 'border-white/40 opacity-70'
                    }`}
                  >
                    <img src={url} alt="sample" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Hidden file input for uploading from device/gallery */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            {/* Bottom Camera Action Bar */}
            <div className="h-28 bg-slate-950/95 border-t border-slate-900 px-5 flex items-center justify-between shrink-0">
              {/* Upload from Gallery / Device button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-2xl border-2 border-dashed border-emerald-500/70 bg-slate-900 flex flex-col items-center justify-center text-emerald-400 hover:bg-slate-800 transition-colors"
                aria-label="Unggah foto dari galeri HP"
              >
                <Upload className="w-5 h-5" />
                <span className="text-[8px] font-bold mt-0.5">Galeri</span>
              </button>

              {/* Big Shutter Button */}
              <button
                type="button"
                onClick={handleSnap}
                aria-label="Ambil foto ulasan"
                className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-95 transition-transform"
              >
                <div className="w-full h-full rounded-full bg-emerald-500 hover:bg-emerald-400 shadow-xl shadow-emerald-950 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-slate-950 stroke-[2.5]" />
                </div>
              </button>

              {/* Switch Camera */}
              <button
                type="button"
                onClick={() => setFacingMode((prev) => (prev === 'back' ? 'front' : 'back'))}
                aria-label="Putar kamera"
                className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
              >
                <FlipHorizontal className="w-5 h-5 text-emerald-400" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Review Form & Nutrition Checklist */}
        {step === 'details' && (
          <form
            onSubmit={handleSubmit}
            className="flex-1 flex flex-col justify-between overflow-y-auto no-scrollbar p-4 space-y-3.5 text-white"
          >
            {/* Photo preview + SPPG selector */}
            <div className="flex gap-3">
              <div
                onClick={() => setStep('camera')}
                className="w-24 h-28 rounded-2xl overflow-hidden border border-emerald-500/50 bg-slate-900 shrink-0 relative cursor-pointer group"
              >
                <img
                  src={selectedPhoto}
                  alt="Review preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                {/* Sticker preview overlay */}
                {selectedSticker && (
                  <div className="absolute top-1.5 inset-x-1 flex justify-center pointer-events-none">
                    <span className="text-[8px] font-black bg-white/95 text-slate-950 px-1 py-0.5 rounded shadow -rotate-3 truncate max-w-[85px]">
                      {selectedSticker}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Ubah Foto
                </div>
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Satuan Pelayanan (SPPG):
                  </label>
                  <select
                    value={selectedSPPGId}
                    onChange={(e) => setSelectedSPPGId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {sppgs.map((sppg) => (
                      <option key={sppg.id} value={sppg.id}>
                        {sppg.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Nama Sekolahmu:
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Contoh: SMA Negeri 1 Jakarta"
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Star Rating Picker */}
            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Nilai Rasa & Kebersihan Makanan:
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      aria-label={`Beri ${star} bintang`}
                      className="p-1 text-slate-600 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-emerald-400 ml-2">
                  {rating === 5
                    ? '⭐⭐⭐⭐⭐ 10/10 Enak & Segar!'
                    : rating === 4
                    ? '⭐⭐⭐⭐ Sangat Enak'
                    : rating === 3
                    ? '⭐⭐⭐ Cukup'
                    : 'Perlu Perbaikan'}
                </span>
              </div>
            </div>

            {/* 4 Sehat 5 Sempurna Checklist */}
            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Cek Kelengkapan Gizi MBG:
                </label>
                <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded-md">
                  4 Sehat 5 Sempurna
                </span>
              </div>

              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleToggleNutrition('karbo')}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-colors ${
                    nutritionTags.karbo
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center ${
                      nutritionTags.karbo ? 'bg-emerald-500 text-black' : 'border border-slate-600'
                    }`}
                  >
                    {nutritionTags.karbo && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>🍚 Nasi/Karbo</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleNutrition('protein')}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-colors ${
                    nutritionTags.protein
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center ${
                      nutritionTags.protein ? 'bg-emerald-500 text-black' : 'border border-slate-600'
                    }`}
                  >
                    {nutritionTags.protein && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>🍗 Ayam/Ikan/Telur</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleNutrition('sayur')}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-colors ${
                    nutritionTags.sayur
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center ${
                      nutritionTags.sayur ? 'bg-emerald-500 text-black' : 'border border-slate-600'
                    }`}
                  >
                    {nutritionTags.sayur && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>🥦 Sayuran Hijau</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleNutrition('buah')}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-colors ${
                    nutritionTags.buah
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center ${
                      nutritionTags.buah ? 'bg-emerald-500 text-black' : 'border border-slate-600'
                    }`}
                  >
                    {nutritionTags.buah && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>🍉 Buah Segar</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleNutrition('susu')}
                  className={`col-span-2 flex items-center gap-2 p-2 rounded-xl border text-left transition-colors ${
                    nutritionTags.susu
                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-200 font-bold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center ${
                      nutritionTags.susu ? 'bg-emerald-400 text-black' : 'border border-slate-600'
                    }`}
                  >
                    {nutritionTags.susu && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>🥛 Susu UHT Kotak MBG (Penyempurna)</span>
                </button>
              </div>
            </div>

            {/* Stiker MBG Interaktif (Snapchat/Instagram style) */}
            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>Tempel Stiker MBG:</span>
                <span className="text-[10px] text-emerald-400 font-normal">Gaya Snapchat/IG</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  '🔥 Hangat & Segar 45°C',
                  '✨ Porsi Habis 100%',
                  '🥛 Susu Juara Dingin',
                  '⭐ 10/10 Rasanya Juara',
                  '🥦 Duta Sayur Hijau',
                  '🍱 Bento Estetik',
                ].map((stk) => (
                  <button
                    key={stk}
                    type="button"
                    onClick={() => setSelectedSticker(selectedSticker === stk ? '' : stk)}
                    className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border transition-all ${
                      selectedSticker === stk
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md scale-105'
                        : 'bg-slate-800/80 text-white/80 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {stk}
                  </button>
                ))}
              </div>
            </div>

            {/* Pelacak Sisa Makanan (Food Waste Tracker) */}
            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
              <label className="text-xs font-bold text-slate-300 block mb-1.5 flex items-center justify-between">
                <span>Pelacak Sisa Makanan (Zero Waste):</span>
                <span className="text-[10px] text-slate-400">Evaluasi Dapur SPPG</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setWasteStatus('habis')}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                    wasteStatus === 'habis'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold ring-1 ring-emerald-400'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="text-base">🍽️</span>
                  <span className="text-[10px] mt-0.5">Habis Bersih</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWasteStatus('sisa_sayur')}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                    wasteStatus === 'sisa_sayur'
                      ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold ring-1 ring-amber-400'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="text-base">🥗</span>
                  <span className="text-[10px] mt-0.5">Sisa Sayur</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWasteStatus('sisa_karbo')}
                  className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                    wasteStatus === 'sisa_karbo'
                      ? 'bg-blue-950 border-blue-500 text-blue-300 font-bold ring-1 ring-blue-400'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400'
                  }`}
                >
                  <span className="text-base">🍚</span>
                  <span className="text-[10px] mt-0.5">Porsi Nasi Leboh</span>
                </button>
              </div>
            </div>

            {/* Caption Input & Quick Hashtags */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Ulasan Pelajar:
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                placeholder="Ceritakan rasanya, porsi cukup atau kenyang, dan menu favoritmu..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {['#MakanBergiziGratis', '#SiGizi', '#MenuMantap', '#HabisTakTersisa'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleAddHashtag(tag)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-emerald-400 px-2 py-0.5 rounded-md"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Bottom Submit Action */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setStep('camera')}
                className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold shadow-lg shadow-emerald-950 flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                Publikasikan Ulasan Sekarang
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};
