import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNutritionScore,
  calculateNutriScoreGrade,
  formatWasteStatus,
  formatDistance,
  formatCount,
  filterSPPGs,
} from './nutrition';
import { SPPG } from '../types';

test('calculateNutriScoreGrade returns appropriate grade and color', () => {
  assert.equal(calculateNutriScoreGrade(5).grade, 'A');
  assert.equal(calculateNutriScoreGrade(5).percentage, 100);
  assert.equal(calculateNutriScoreGrade(4).grade, 'B');
  assert.equal(calculateNutriScoreGrade(3).grade, 'C');
});

test('formatWasteStatus provides correct labels and icons', () => {
  assert.equal(formatWasteStatus('habis').label, 'Habis Bersih (Zero Waste)');
  assert.equal(formatWasteStatus('habis').icon, '🍽️');
  assert.equal(formatWasteStatus('sisa_sayur').label, 'Sisa Sayur Sedikit');
});

test('calculateNutritionScore calculates full 4 Sehat 5 Sempurna correctly', () => {
  const fullTags = {
    karbo: true,
    protein: true,
    sayur: true,
    buah: true,
    susu: true,
  };
  const result = calculateNutritionScore(fullTags);
  assert.equal(result.score, 5);
  assert.equal(result.completenessPercent, 100);
  assert.equal(result.label, 'Sempurna (4 Sehat 5 Sempurna)');
});

test('calculateNutritionScore calculates partial nutrition correctly', () => {
  const partialTags = {
    karbo: true,
    protein: true,
    sayur: true,
    buah: false,
    susu: false,
  };
  const result = calculateNutritionScore(partialTags);
  assert.equal(result.score, 3);
  assert.equal(result.completenessPercent, 60);
  assert.equal(result.label, 'Cukup Baik');
});

test('formatDistance handles meters and kilometers accurately', () => {
  assert.equal(formatDistance(0.45), '450 m');
  assert.equal(formatDistance(1.24), '1.2 km');
  assert.equal(formatDistance(0.05), '50 m');
});

test('formatCount formats thousands and millions cleanly', () => {
  assert.equal(formatCount(85), '85');
  assert.equal(formatCount(1500), '1.5k');
  assert.equal(formatCount(2500000), '2.5M');
});

test('filterSPPGs filters by search query and category', () => {
  const mockSPPGs: SPPG[] = [
    {
      id: 'sppg-1',
      name: 'SPPG Menteng Bersatu',
      code: 'SPPG-01',
      category: 'pusat',
      address: 'Jl. Teuku Umar No. 12',
      lat: -6.195,
      lng: 106.832,
      rating: 4.9,
      reviewCount: 140,
      distanceKm: 0.8,
      isOpen: true,
      statusText: 'Buka Sekarang',
      operatingHours: '06:00 - 15:00 WIB',
      schoolsServed: ['SMA Negeri 1 Jakarta', 'SMPN 1 Jakarta'],
      kitchenPreview: '',
      mealPreview: '',
      dailyMenuToday: {
        mainCarb: 'Nasi Kuning',
        protein: 'Ayam Goreng Lengkuas',
        vegetables: 'Urap Sayur',
        fruit: 'Pisang',
        milk: 'Susu UHT MBG',
        calories: 680,
      },
      capacityPerDay: 2500,
      contactPhone: '0812-3456-7890',
    },
    {
      id: 'sppg-2',
      name: 'SPPG Kebayoran Dapur Mandiri',
      code: 'SPPG-02',
      category: 'mandiri',
      address: 'Jl. Kyai Maja No. 4',
      lat: -6.241,
      lng: 106.797,
      rating: 4.4,
      reviewCount: 88,
      distanceKm: 2.5,
      isOpen: false,
      statusText: 'Tutup',
      operatingHours: '06:00 - 14:00 WIB',
      schoolsServed: ['SMK Negeri 29 Jakarta'],
      kitchenPreview: '',
      mealPreview: '',
      dailyMenuToday: {
        mainCarb: 'Nasi Putih',
        protein: 'Ikan Fillet Crispy',
        vegetables: 'Sop Jagung Wortel',
        fruit: 'Semangka',
        milk: 'Susu Cokelat',
        calories: 650,
      },
      capacityPerDay: 1800,
      contactPhone: '0812-9876-5432',
    },
  ];

  // Search by school name
  const filteredBySchool = filterSPPGs(mockSPPGs, 'all', 'SMAN 1');
  assert.equal(filteredBySchool.length, 1);
  assert.equal(filteredBySchool[0].id, 'sppg-1');

  // Filter open only
  const openOnly = filterSPPGs(mockSPPGs, 'open', '');
  assert.equal(openOnly.length, 1);
  assert.equal(openOnly[0].id, 'sppg-1');

  // Filter top rated
  const topRated = filterSPPGs(mockSPPGs, 'top_rated', '');
  assert.equal(topRated.length, 1);
  assert.equal(topRated[0].id, 'sppg-1');
});
