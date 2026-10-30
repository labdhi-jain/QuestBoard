import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Student Components
import { StudentHeader } from './components/student/StudentHeader';
import { BottomNav } from './components/student/BottomNav';

// Admin Components
import { AdminNav } from './components/admin/AdminNav';

// Pages
import { AuthPage } from './pages/student/AuthPage';
import { QuestsPage } from './pages/student/QuestsPage';
import { QuestDetailPage } from './pages/student/QuestDetailPage';
import { ScanPage } from './pages/student/ScanPage';
import { ProfilePage } from './pages/student/ProfilePage';
import { LeaderboardPage } from './pages/student/LeaderboardPage';
import { RewardsPage } from './pages/student/RewardsPage';
import { NotificationsPage } from './pages/student/NotificationsPage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminQuestsPage } from './pages/admin/AdminQuestsPage';
import { AdminQRManagerPage } from './pages/admin/AdminQRManagerPage';
import { AdminQueuePage } from './pages/admin/AdminQueuePage';
import { AdminRewardsPage } from './pages/admin/AdminRewardsPage';
import { AdminStatsPage } from './pages/admin/AdminStatsPage';

// Layout for Student views
const StudentLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      <StudentHeader />
      <BottomNav />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

// Layout for Admin views
const AdminLayout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-10 h-10 border-3 border-ink border-t-yellow rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/quests" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink">
      <AdminNav />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};

// Root index redirector
const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-10 h-10 border-3 border-ink border-t-yellow rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/quests'} replace />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* Student Routes */}
        <Route element={<StudentLayout />}>
          <Route path="/quests" element={<QuestsPage />} />
          <Route path="/quests/:id" element={<QuestDetailPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="quests" element={<AdminQuestsPage />} />
          <Route path="qr" element={<AdminQRManagerPage />} />
          <Route path="queue" element={<AdminQueuePage />} />
          <Route path="rewards" element={<AdminRewardsPage />} />
          <Route path="stats" element={<AdminStatsPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
