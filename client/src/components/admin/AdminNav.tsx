import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Compass, QrCode, CheckSquare, Gift, BarChart3, LogOut, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';

export const AdminNav: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: '/admin', label: 'Overview', icon: BarChart3, end: true },
    { to: '/admin/quests', label: 'Quests', icon: Compass },
    { to: '/admin/qr', label: 'QR Manager', icon: QrCode },
    { to: '/admin/queue', label: 'Verifications', icon: CheckSquare },
    { to: '/admin/rewards', label: 'Rewards', icon: Gift },
    { to: '/admin/stats', label: 'Analytics', icon: BarChart3 },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b-2.5 border-ink px-4 py-3 sm:px-8 shadow-hard-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Admin Badge */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="flex items-center gap-2">
              <span className="w-9 h-9 rounded-xl bg-ink text-white flex items-center justify-center font-heading text-lg border-2 border-ink">
                🛡️
              </span>
              <span className="font-heading font-black text-xl text-ink tracking-tight">
                QuestBoard Admin
              </span>
            </Link>
            <span className="bg-pink text-ink font-heading font-extrabold text-xs px-2.5 py-0.5 rounded-full border-2 border-ink">
              STAFF DESK
            </span>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/quests"
              className="p-1.5 rounded-xl border-2 border-ink bg-cream text-ink text-xs font-heading font-bold"
            >
              Student View
            </Link>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-xl border-2 border-ink bg-white text-ink"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-heading font-extrabold whitespace-nowrap transition-all border-2',
                    isActive
                      ? 'bg-yellow text-ink border-ink shadow-hard-sm'
                      : 'border-transparent text-gray-600 hover:text-ink hover:bg-cream'
                  )
                }
              >
                <Icon className="w-4 h-4 stroke-[2.5]" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Right actions: switch to student view, logout */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/quests"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-ink bg-cream text-ink text-xs font-heading font-extrabold shadow-hard-sm hover:bg-yellow active:translate-x-0.5 active:translate-y-0.5"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Student View</span>
          </Link>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 rounded-xl border-2 border-ink bg-white text-ink hover:bg-pink-light shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5"
          >
            <LogOut className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </header>
  );
};
