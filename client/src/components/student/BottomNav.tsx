import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, QrCode, Trophy, Gift, User as UserIcon } from 'lucide-react';
import { clsx } from 'clsx';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/quests', label: 'Quests', icon: Compass },
    { to: '/leaderboard', label: 'Ranks', icon: Trophy },
    { to: '/scan', label: 'Scan', icon: QrCode, isHero: true },
    { to: '/rewards', label: 'Rewards', icon: Gift },
    { to: '/profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <>
      {/* Mobile Bottom Tab Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t-2.5 border-ink px-3 py-2 md:hidden"
      >
        <div className="flex items-center justify-around max-w-md mx-auto relative">
          {navItems.map((item) => {
            const Icon = item.icon;

            if (item.isHero) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    clsx(
                      '-top-6 relative p-3.5 rounded-full border-2.5 border-ink shadow-hard-lg active:translate-y-1 active:shadow-hard transition-transform',
                      isActive ? 'bg-yellow text-ink scale-110' : 'bg-violet text-white hover:scale-105'
                    )
                  }
                  aria-label="Scan QR Code"
                >
                  <Icon className="w-7 h-7 stroke-[2.5]" />
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all',
                    isActive
                      ? 'text-ink font-heading font-extrabold scale-105'
                      : 'text-gray-500 hover:text-ink font-medium'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={clsx(
                        'p-1.5 rounded-xl transition-all',
                        isActive && 'bg-cream border-2 border-ink shadow-hard-sm'
                      )}
                    >
                      <Icon className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <span className="text-[11px] font-heading">{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Desktop Top/Side Navigation */}
      <nav
        aria-label="Desktop Navigation"
        className="hidden md:flex items-center justify-center gap-3 py-2 bg-cream border-b-2 border-ink"
      >
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-2.5 border-ink shadow-hard-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-heading font-extrabold transition-all border-2',
                    isActive
                      ? 'bg-yellow text-ink border-ink shadow-hard-sm translate-x-[-1px] translate-y-[-1px]'
                      : 'border-transparent text-gray-600 hover:text-ink hover:bg-cream'
                  )
                }
              >
                <Icon className="w-4 h-4 stroke-[2.5]" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </>
  );
};
