import { NutritionTags, SPPG } from '../types';

/**
 * Calculates completeness score for 4 Sehat 5 Sempurna MBG meal.
 */
export function calculateNutritionScore(tags: NutritionTags): {
  score: number;
  maxScore: number;
  label: string;
  completenessPercent: number;
} {
  const items = [tags.karbo, tags.protein, tags.sayur, tags.buah, tags.susu];
  const count = items.filter(Boolean).length;
  const percent = Math.round((count / 5) * 100);

  let label = 'Kurang Lengkap';
  if (count === 5) {
    label = 'Sempurna (4 Sehat 5 Sempurna)';
  } else if (count === 4) {
    label = 'Sangat Baik (4 Sehat)';
  } else if (count >= 3) {
    label = 'Cukup Baik';
  }

  return {
    score: count,
    maxScore: 5,
    label,
    completenessPercent: percent,
  };
}

/**
 * Calculates Nutri-Score grade based on 4 Sehat 5 Sempurna completeness.
 */
export function calculateNutriScoreGrade(score: number): {
  grade: 'A' | 'B' | 'C';
  percentage: number;
  label: string;
  color: string;
} {
  if (score >= 5) {
    return {
      grade: 'A',
      percentage: 100,
      label: 'Gizi Seimbang Optimal (Grade A)',
      color: 'text-emerald-400 bg-emerald-950/80 border-emerald-500/50',
    };
  }
  if (score >= 4) {
    return {
      grade: 'B',
      percentage: 80,
      label: 'Sangat Baik (Grade B)',
      color: 'text-teal-400 bg-teal-950/80 border-teal-500/50',
    };
  }
  return {
    grade: 'C',
    percentage: 60,
    label: 'Cukup Bergizi (Grade C)',
    color: 'text-amber-400 bg-amber-950/80 border-amber-500/50',
  };
}

/**
 * Formats Food Waste status into Indonesian label with icon.
 */
export function formatWasteStatus(status?: string): {
  label: string;
  icon: string;
  badgeClass: string;
} {
  switch (status) {
    case 'habis':
      return {
        label: 'Habis Bersih (Zero Waste)',
        icon: '🍽️',
        badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40',
      };
    case 'sisa_sayur':
      return {
        label: 'Sisa Sayur Sedikit',
        icon: '🥗',
        badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-500/40',
      };
    case 'sisa_karbo':
      return {
        label: 'Porsi Nasi Berlebih',
        icon: '🍚',
        badgeClass: 'bg-blue-950/80 text-blue-300 border-blue-500/40',
      };
    default:
      return {
        label: 'Porsi Tuntas',
        icon: '✨',
        badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
      };
  }
}

/**
 * Formats distance in km or meters for Indonesian locale.
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
}

/**
 * Formats counts for social media metrics (1.2k, etc.)
 */
export function formatCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return count.toString();
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\bsman\s*/g, 'sma negeri ')
    .replace(/\bsmpn\s*/g, 'smp negeri ')
    .replace(/\bsmkn\s*/g, 'smk negeri ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Filters and searches SPPG centers based on query and active chip.
 */
export function filterSPPGs(
  sppgs: SPPG[],
  activeFilter: string,
  searchQuery: string
): SPPG[] {
  const rawQuery = searchQuery.trim().toLowerCase();
  const normalizedQuery = normalizeText(searchQuery);

  return sppgs
    .filter((sppg) => {
      // Search matching name, address, or schools served
      if (rawQuery) {
        const matchName = sppg.name.toLowerCase().includes(rawQuery);
        const matchAddress = sppg.address.toLowerCase().includes(rawQuery);
        const matchSchool = sppg.schoolsServed.some((s) => {
          const sLower = s.toLowerCase();
          const sNorm = normalizeText(s);
          return (
            sLower.includes(rawQuery) ||
            sNorm.includes(normalizedQuery) ||
            sLower.includes(normalizedQuery)
          );
        });

        if (!matchName && !matchAddress && !matchSchool) {
          return false;
        }
      }

      // Filter category
      if (activeFilter === 'open') {
        return sppg.isOpen;
      }
      if (activeFilter === 'top_rated') {
        return sppg.rating >= 4.7;
      }
      if (activeFilter === 'nearest') {
        return sppg.distanceKm <= 1.5;
      }

      return true;
    })
    .sort((a, b) => {
      if (activeFilter === 'nearest') {
        return a.distanceKm - b.distanceKm;
      }
      if (activeFilter === 'top_rated') {
        return b.rating - a.rating;
      }
      return 0;
    });
}
