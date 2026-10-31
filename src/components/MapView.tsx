import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { SPPG } from '../types';
import { filterSPPGs, formatDistance } from '../utils/nutrition';
import {
  Search,
  Navigation,
  Star,
  ChevronRight,
  Clock,
  Phone,
  School,
  Utensils,
  MapPin,
  Sparkles,
  Layers,
  X,
  Share2,
  CheckCircle2,
} from 'lucide-react';

interface MapViewProps {
  sppgs: SPPG[];
  selectedSPPG: SPPG | null;
  onSelectSPPG: (sppg: SPPG) => void;
  onOpenReviewForSPPG: (sppg: SPPG) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  sppgs,
  selectedSPPG,
  onSelectSPPG,
  onOpenReviewForSPPG,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'open' | 'nearest' | 'top_rated'>('all');
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isCopiedRoute, setIsCopiedRoute] = useState(false);
  const [mapLayerType, setMapLayerType] = useState<'esri_sat' | 'osm_hybrid'>('esri_sat');

  // Filtered SPPGs
  const filteredSPPGs = filterSPPGs(sppgs, activeFilter, searchQuery);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center in central Jakarta educational cluster
    const initialLat = selectedSPPG ? selectedSPPG.lat : -6.1952;
    const initialLng = selectedSPPG ? selectedSPPG.lng : 106.8318;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: false,
      attributionControl: true,
    });

    // Add Esri Satellite base layer (as requested)
    const esriSatellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; SiGizi MBG',
      }
    );

    // Hybrid label overlay for street and landmark clarity
    const esriLabels = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 19,
        opacity: 0.85,
      }
    );

    esriSatellite.addTo(map);
    esriLabels.addTo(map);

    // Custom zoom control in comfortable touch position
    L.control.zoom({ position: 'topright' }).addTo(map);

    mapInstanceRef.current = map;

    // Invalidate size to guarantee full container coverage
    setTimeout(() => {
      map.invalidateSize();
    }, 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers whenever filtered SPPGs or selected SPPG changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    filteredSPPGs.forEach((sppg) => {
      const isSelected = selectedSPPG?.id === sppg.id;

      // Custom marker icon inspired by reference image:
      // Green rounded badge with knife and fork utensil icon and pointer tail
      const iconHtml = `
        <div class="relative group cursor-pointer">
          <div class="sppg-pin-marker ${isSelected ? 'active' : ''} flex items-center justify-center">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform duration-200 ${
              isSelected
                ? 'bg-emerald-500 ring-4 ring-emerald-300 ring-offset-2 ring-offset-black scale-110'
                : 'bg-emerald-600 border-2 border-white/90 hover:bg-emerald-500'
            }">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2"/>
                <path d="M15 2v10a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2"/>
                <path d="M5 2v8a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V2"/>
                <path d="M7 2v20"/>
                <path d="M17 14v8"/>
              </svg>
            </div>
            <!-- Pointer tail -->
            <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-emerald-600 rotate-45 ${
              isSelected ? 'bg-emerald-500' : ''
            }"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-sppg-icon',
        html: iconHtml,
        iconSize: [40, 48],
        iconAnchor: [20, 46],
        popupAnchor: [0, -42],
      });

      const marker = L.marker([sppg.lat, sppg.lng], { icon: customIcon }).addTo(map);

      marker.on('click', () => {
        onSelectSPPG(sppg);
        map.flyTo([sppg.lat, sppg.lng], 15, { duration: 0.8 });
      });

      markersRef.current.set(sppg.id, marker);
    });
  }, [filteredSPPGs, selectedSPPG, onSelectSPPG]);

  // Handle recenter to user's location
  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (selectedSPPG) {
      map.flyTo([selectedSPPG.lat, selectedSPPG.lng], 15, { duration: 0.8 });
    } else if (filteredSPPGs.length > 0) {
      map.flyTo([filteredSPPGs[0].lat, filteredSPPGs[0].lng], 14, { duration: 0.8 });
    }
  };

  // Handle route directions click
  const handleGetDirections = (sppg: SPPG) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${sppg.lat},${sppg.lng}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsCopiedRoute(true);
    setTimeout(() => setIsCopiedRoute(false), 3000);
  };

  const activeSPPG = selectedSPPG || filteredSPPGs[0] || sppgs[0];

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-950">
      {/* Top Floating Search & Filter Bar */}
      <div className="absolute top-3 left-0 right-0 z-30 px-4 space-y-2.5 pointer-events-none">
        {/* Search Input Box (matching reference image) */}
        <div className="pointer-events-auto shadow-xl backdrop-blur-md bg-white/95 text-slate-900 rounded-2xl flex items-center px-3.5 py-2.5 border border-white/40">
          <Search className="w-5 h-5 text-slate-400 shrink-0 mr-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari sekolah atau SPPG terdekat..."
            aria-label="Cari sekolah atau SPPG"
            className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              aria-label="Hapus pencarian"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Chips Horizontal Carousel (matching reference image) */}
        <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all shadow-md ${
              activeFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-emerald-900/40 ring-1 ring-emerald-400'
                : 'bg-white/90 text-slate-700 hover:bg-white backdrop-blur-md'
            }`}
          >
            Semua SPPG
          </button>
          <button
            onClick={() => setActiveFilter('open')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all shadow-md ${
              activeFilter === 'open'
                ? 'bg-emerald-600 text-white shadow-emerald-900/40 ring-1 ring-emerald-400'
                : 'bg-white/90 text-slate-700 hover:bg-white backdrop-blur-md'
            }`}
          >
            Buka Sekarang
          </button>
          <button
            onClick={() => setActiveFilter('nearest')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all shadow-md ${
              activeFilter === 'nearest'
                ? 'bg-emerald-600 text-white shadow-emerald-900/40 ring-1 ring-emerald-400'
                : 'bg-white/90 text-slate-700 hover:bg-white backdrop-blur-md'
            }`}
          >
            Terdekat (&lt;1.5 km)
          </button>
          <button
            onClick={() => setActiveFilter('top_rated')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all shadow-md ${
              activeFilter === 'top_rated'
                ? 'bg-emerald-600 text-white shadow-emerald-900/40 ring-1 ring-emerald-400'
                : 'bg-white/90 text-slate-700 hover:bg-white backdrop-blur-md'
            }`}
          >
            Rating Tertinggi (★4.7+)
          </button>
        </div>
      </div>

      {/* Floating GPS Recenter Button (right side, matches reference design) */}
      <div className="absolute right-4 top-24 z-20 flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          aria-label="Pusatkan ke lokasi saya"
          className="w-11 h-11 rounded-2xl bg-white/95 text-emerald-700 shadow-xl backdrop-blur-md flex items-center justify-center border border-white/60 active:scale-95 transition-transform"
        >
          <Navigation className="w-5 h-5 fill-emerald-600 text-emerald-600" />
        </button>
      </div>

      {/* Main Fullscreen Leaflet Container */}
      <div
        ref={mapContainerRef}
        data-testid="leaflet-map"
        className="w-full flex-1"
        style={{ minHeight: '100%' }}
      />

      {/* Bottom Selected SPPG Card (identical to reference image bottom card) */}
      {activeSPPG && (
        <div className="absolute bottom-3 left-3 right-3 z-30 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-4 shadow-2xl border border-white/60 text-slate-900 transition-all">
            <div className="flex items-start justify-between gap-3">
              {/* Left Content */}
              <div
                className="flex-1 min-w-0 cursor-pointer"
                onClick={() => setIsDetailDrawerOpen(true)}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                  {activeSPPG.statusText}
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500 font-medium">
                    {formatDistance(activeSPPG.distanceKm)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 truncate mt-0.5 flex items-center gap-1.5">
                  {activeSPPG.name}
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                </h3>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-1 mt-1 text-xs">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 shrink-0" />
                  <span className="font-bold text-slate-900">{activeSPPG.rating.toFixed(1)}</span>
                  <span className="text-slate-500">({activeSPPG.reviewCount}+ ulasan pelajar)</span>
                </div>
              </div>

              {/* Thumbnail Previews (Kitchen & Food Tray) as in screenshot */}
              <div className="flex items-center gap-1.5 shrink-0">
                <div
                  onClick={() => setIsDetailDrawerOpen(true)}
                  className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 border border-slate-100 shadow-sm cursor-pointer relative"
                >
                  <img
                    src={activeSPPG.kitchenPreview}
                    alt="Dapur SPPG"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white text-center py-0.5 font-medium">
                    Dapur
                  </div>
                </div>
                <div
                  onClick={() => setIsDetailDrawerOpen(true)}
                  className="w-12 h-12 rounded-xl overflow-hidden bg-slate-200 border border-slate-100 shadow-sm cursor-pointer relative"
                >
                  <img
                    src={activeSPPG.mealPreview}
                    alt="Menu MBG Hari Ini"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-emerald-600/80 text-[8px] text-white text-center py-0.5 font-medium">
                    Menu
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Row Actions */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                onClick={() => handleGetDirections(activeSPPG)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all"
              >
                <Navigation className="w-4 h-4 fill-white" />
                {isCopiedRoute ? 'Membuka Peta...' : 'Petunjuk Arah'}
              </button>

              <button
                onClick={() => onOpenReviewForSPPG(activeSPPG)}
                className="bg-emerald-50 hover:bg-emerald-100 active:scale-[0.98] text-emerald-800 font-semibold text-xs py-2.5 px-3.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 transition-all"
              >
                <Utensils className="w-3.5 h-3.5 text-emerald-600" />
                Ulas Menu
              </button>

              <button
                onClick={() => setIsDetailDrawerOpen(true)}
                className="p-2.5 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100"
                aria-label="Detail SPPG lengkap"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expanded SPPG Detail Drawer */}
      {isDetailDrawerOpen && activeSPPG && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-lg mx-auto bg-slate-900 text-slate-100 rounded-t-3xl max-h-[85vh] overflow-y-auto no-scrollbar border-t border-slate-800 shadow-2xl p-5"
          >
            {/* Grab handle */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-4" />

            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800/80 rounded-full">
                  {activeSPPG.code} · Satuan Pelayanan MBG
                </span>
                <h2 className="text-xl font-bold text-white mt-2">{activeSPPG.name}</h2>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {activeSPPG.address}
                </p>
              </div>
              <button
                onClick={() => setIsDetailDrawerOpen(false)}
                className="p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white"
                aria-label="Tutup detail"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual Photo Showcase */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="rounded-2xl overflow-hidden relative h-36 bg-slate-800">
                <img
                  src={activeSPPG.kitchenPreview}
                  alt="Dapur Higienis"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 text-[10px] bg-black/70 text-white px-2 py-0.5 rounded-md font-medium">
                  Dapur Higienis Berstandar
                </span>
              </div>
              <div className="rounded-2xl overflow-hidden relative h-36 bg-slate-800">
                <img
                  src={activeSPPG.mealPreview}
                  alt="Sajian MBG Hari Ini"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 text-[10px] bg-emerald-900/90 text-emerald-200 px-2 py-0.5 rounded-md font-medium">
                  Sajian Bergizi Hari Ini
                </span>
              </div>
            </div>

            {/* Menu Hari Ini (Today's Nutritious Menu Card) */}
            <div className="mt-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-emerald-300">
                    Menu Makan Siang Hari Ini (4 Sehat 5 Sempurna)
                  </h4>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md">
                  {activeSPPG.dailyMenuToday.calories} kkal
                </span>
              </div>

              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">Karbohidrat</span>
                  <span className="font-semibold text-white">
                    {activeSPPG.dailyMenuToday.mainCarb}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">Lauk Pauk (Protein)</span>
                  <span className="font-semibold text-white">
                    {activeSPPG.dailyMenuToday.protein}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">Sayuran</span>
                  <span className="font-semibold text-white">
                    {activeSPPG.dailyMenuToday.vegetables}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">Buah Segar</span>
                  <span className="font-semibold text-white">
                    {activeSPPG.dailyMenuToday.fruit}
                  </span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60">
                  <span className="text-slate-400">Susu MBG</span>
                  <span className="font-semibold text-emerald-300">
                    {activeSPPG.dailyMenuToday.milk}
                  </span>
                </div>
              </div>
            </div>

            {/* Sekolah yang Dilayani */}
            <div className="mt-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <School className="w-3.5 h-3.5 text-emerald-400" />
                Sekolah Penerima Manfaat
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {activeSPPG.schoolsServed.map((school, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 border border-slate-700"
                  >
                    {school}
                  </span>
                ))}
              </div>
            </div>

            {/* Operational Info */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-400 py-2 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                {activeSPPG.operatingHours}
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                {activeSPPG.contactPhone}
              </span>
            </div>

            {/* Action Bar */}
            <div className="mt-4 pt-2 flex gap-2">
              <button
                onClick={() => {
                  setIsDetailDrawerOpen(false);
                  onOpenReviewForSPPG(activeSPPG);
                }}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm py-3 rounded-2xl shadow-lg shadow-emerald-950 flex items-center justify-center gap-2"
              >
                <Utensils className="w-4 h-4" />
                Beri Ulasan Menu MBG
              </button>
              <button
                onClick={() => handleGetDirections(activeSPPG)}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl flex items-center justify-center"
                aria-label="Petunjuk arah rute"
              >
                <Navigation className="w-4 h-4 text-emerald-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
