import React from 'react';
import { NavLink } from 'react-router-dom';
import { Map, Mic, Settings, SquareStack } from 'lucide-react';
import { AppRoute } from '../types';

export const Navigation: React.FC = () => {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
      isActive ? 'text-ink bg-stone-200' : 'text-stone-500 hover:text-ink hover:bg-stone-100'
    }`;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-ink z-50 flex justify-around items-center shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
      <NavLink to={AppRoute.MAP} className={linkClass}>
        <Map size={24} strokeWidth={1.5} />
        <span className="text-xs font-sans tracking-wider font-medium">MAP</span>
      </NavLink>
      <NavLink to={`${AppRoute.OKE}?id=0dao`} className={linkClass}>
        <SquareStack size={24} strokeWidth={1.5} />
        <span className="text-xs font-sans tracking-wider font-medium">OKE</span>
      </NavLink>
      <NavLink to={AppRoute.VOICE} className={linkClass}>
        <Mic size={24} strokeWidth={1.5} />
        <span className="text-xs font-sans tracking-wider font-medium">VOICE</span>
      </NavLink>
      <NavLink to={AppRoute.SETTINGS} className={linkClass}>
        <Settings size={24} strokeWidth={1.5} />
        <span className="text-xs font-sans tracking-wider font-medium">SET</span>
      </NavLink>
    </nav>
  );
};