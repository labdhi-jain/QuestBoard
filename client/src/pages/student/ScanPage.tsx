import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Scanner } from '../../components/student/Scanner';
import { CelebrationModal } from '../../components/student/CelebrationModal';
import { QrCode, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../../components/common/Button';

interface ScanSuccessData {
  quest: {
    id: string;
    title: string;
    pointValue: number;
    category: string;
  };
  pointsAwarded: number;
  lifetimePoints: number;
  pointsBalance: number;
}

export const ScanPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const [scanResult, setScanResult] = useState<ScanSuccessData | null>(null);
  const [errorMessage, setErrorMessage] = useState<{ title: string; message: string; isWarning?: boolean } | null>(null);

  const scanMutation = useMutation({
    mutationFn: (token: string) =>
      api.post<ScanSuccessData>('/api/checkins/scan', { token }),
    onSuccess: async (data) => {
      setErrorMessage(null);
      setScanResult(data);
      await refreshUser();
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
      queryClient.invalidateQueries({ queryKey: ['progress'] });
    },
    onError: (err: unknown) => {
      if (err instanceof ApiError) {
        if (err.code === 'ALREADY_COMPLETED') {
          setErrorMessage({
            title: 'Already Completed! 🎯',
            message: 'You have already checked in to this quest earlier. Keep exploring to earn more points!',
            isWarning: true,
          });
          return;
        }
        if (err.code === 'QR_EXPIRED') {
          setErrorMessage({
            title: 'QR Code Expired ⏳',
            message: 'This physical QR code has expired and is no longer active. Orientation staff may have issued an updated code.',
          });
          return;
        }
        if (err.code === 'PREREQUISITE_LOCKED') {
          setErrorMessage({
            title: 'Prerequisite Required 🔒',
            message: err.message,
          });
          return;
        }
        setErrorMessage({
          title: 'Scan Error',
          message: err.message || 'Invalid QR code. Please check that you scanned an official QuestBoard checkpoint.',
        });
      } else {
        setErrorMessage({
          title: 'Connection Issue',
          message: 'Unable to communicate with the verification server. Please retry.',
        });
      }
    },
  });

  // Check URL query parameter (e.g., opened via native phone camera)
  useEffect(() => {
    const token = searchParams.get('t');
    if (token) {
      if (!user) {
        // Send user to login, then redirect back to scan
        navigate('/auth', { state: { from: `/scan?t=${token}` } });
        return;
      }
      scanMutation.mutate(token);
    }
  }, [searchParams, user]);

  const handleScanToken = (token: string) => {
    setErrorMessage(null);
    scanMutation.mutate(token);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 pb-24 md:pb-12 text-center">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 bg-yellow text-ink border-2.5 border-ink px-3.5 py-1 rounded-full font-heading font-black text-xs uppercase tracking-wider shadow-hard-sm mb-2">
          <QrCode className="w-4 h-4" />
          CAMPUS SCANNER
        </div>
        <h1 className="font-heading font-black text-3xl text-ink tracking-tight mb-1">
          Scan a Quest Plaque
        </h1>
        <p className="font-body text-xs sm:text-sm text-gray-600">
          Find a QR code on campus and scan it with your camera or enter the code.
        </p>
      </div>

      {/* Error or Warning Feedback Banner */}
      {errorMessage && (
        <div
          className={`mb-6 p-4 rounded-3xl border-3 border-ink text-left shadow-hard ${
            errorMessage.isWarning ? 'bg-yellow/30 text-ink' : 'bg-pink-light/40 text-ink'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-white border-2 border-ink text-ink shadow-hard-sm shrink-0">
              {errorMessage.isWarning ? (
                <CheckCircle2 className="w-6 h-6 text-yellow-dark stroke-[2.5]" />
              ) : (
                <AlertCircle className="w-6 h-6 text-pink-dark stroke-[2.5]" />
              )}
            </div>
            <div className="flex-1">
              <h4 className="font-heading font-black text-base text-ink mb-1">
                {errorMessage.title}
              </h4>
              <p className="font-body text-xs sm:text-sm text-gray-700 font-medium">
                {errorMessage.message}
              </p>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs font-heading font-bold text-ink underline"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Scanner Component with Viewfinder and Manual Fallback */}
      <Scanner onScanSuccess={handleScanToken} isLoading={scanMutation.isPending} />

      {/* Celebration Modal on Verified Scan */}
      {scanResult && (
        <CelebrationModal
          isOpen={!!scanResult}
          onClose={() => {
            setScanResult(null);
            navigate('/quests');
          }}
          questTitle={scanResult.quest.title}
          pointsAwarded={scanResult.pointsAwarded}
          newLifetimePoints={scanResult.lifetimePoints}
          newPointsBalance={scanResult.pointsBalance}
        />
      )}
    </div>
  );
};
