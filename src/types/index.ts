export interface NutritionTags {
  karbo: boolean;
  protein: boolean;
  sayur: boolean;
  buah: boolean;
  susu: boolean;
}

export interface ReviewComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  time: string;
}

export type WasteStatus = 'habis' | 'sisa_sayur' | 'sisa_karbo';

export interface StudentStoryItem {
  id: string;
  studentName: string;
  studentHandle: string;
  studentAvatar: string;
  gradeClass: string;
  photo: string;
  rating: number;
  caption: string;
  sticker?: string;
  wasteStatus?: WasteStatus;
  time: string;
  menuName: string;
  nutritionScore: number;
}

export interface SchoolGroupStory {
  id: string;
  schoolName: string;
  shortName: string;
  schoolLogo: string;
  sppgName: string;
  students: StudentStoryItem[];
  hasUnviewed: boolean;
}

export interface ReviewPost {
  id: string;
  sppgId: string;
  sppgName: string;
  schoolName: string;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  tags: string[];
  rating: number; // 1-5
  nutritionTags: NutritionTags;
  sticker?: string;
  wasteStatus?: WasteStatus;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  timestamp: string;
  comments: ReviewComment[];
}

export interface SPPG {
  id: string;
  name: string;
  code: string;
  category: 'pusat' | 'mandiri' | 'sekolah';
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  distanceKm: number;
  isOpen: boolean;
  statusText: string;
  operatingHours: string;
  schoolsServed: string[];
  kitchenPreview: string;
  mealPreview: string;
  dailyMenuToday: {
    mainCarb: string;
    protein: string;
    vegetables: string;
    fruit: string;
    milk: string;
    calories: number;
  };
  capacityPerDay: number;
  contactPhone: string;
}

export type ActiveTab = 'map' | 'feed' | 'notifications' | 'profile';
