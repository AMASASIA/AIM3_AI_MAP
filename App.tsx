import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { OkePage } from './pages/OkePage';
import { VoicePage } from './pages/VoicePage';
import { SettingsPage } from './pages/SettingsPage';
import { MapPage } from './pages/MapPage';
import { AppRoute } from './types';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-paper text-ink pb-24 font-serif selection:bg-black selection:text-white">
        {/* Header Area - Bright Luxury / NYTimes Style */}
        <header className="px-6 py-5 border-b border-black mb-6 bg-paper sticky top-0 z-40 flex flex-col items-center">
           <h1 className="font-display text-3xl font-bold tracking-widest uppercase text-black">
             AIM3
           </h1>
           <div className="flex items-center space-x-3 mt-1">
             <div className="h-[1px] w-8 bg-black"></div>
             <p className="text-[10px] font-sans tracking-[0.2em] uppercase text-black font-semibold">
               Bright Luxury AI-MAP
             </p>
             <div className="h-[1px] w-8 bg-black"></div>
           </div>
        </header>

        {/* Main Content Area */}
        <main className="px-4 animate-[fadeIn_0.5s_ease-in-out]">
          <Routes>
            <Route path={AppRoute.HOME} element={<Navigate to={AppRoute.MAP} replace />} />
            <Route path={AppRoute.MAP} element={<MapPage />} />
            <Route path={AppRoute.OKE} element={<OkePage />} />
            <Route path={AppRoute.VOICE} element={<VoicePage />} />
            <Route path={AppRoute.SETTINGS} element={<SettingsPage />} />
          </Routes>
        </main>

        <Navigation />
      </div>
    </HashRouter>
  );
}

export default App;