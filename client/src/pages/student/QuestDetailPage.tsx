import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Quest } from '../../types/api';
import { Button } from '../../components/common/Button';
import { CategoryBadge, PointsBadge, StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { EmptyState } from '../../components/common/EmptyState';
import {
  MapPin,
  QrCode,
  UserCheck,
  Lock,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export const QuestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualNote, setManualNote] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['quest', id],
    queryFn: () => api.get<{ quest: Quest }>(`/api/quests/${id}`),
    enabled: !!id,
  });

  const quest = data?.quest;

  // Manual Check-in mutation (US-10)
  const manualMutation = useMutation({
    mutationFn: (note?: string) =>
      api.post('/api/checkins/manual', { questId: id, note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quests'] });
      queryClient.invalidateQueries({ queryKey: ['quest', id] });
      setIsManualModalOpen(false);
      setFeedbackMessage('Your submission is in the queue! Orientation staff will review it shortly.');
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      setFeedbackMessage(`Error: ${msg}`);
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="w-12 h-12 border-3 border-ink border-t-yellow rounded-full animate-spin mx-auto mb-4" />
        <p className="font-heading font-bold text-gray-500">Loading quest dossier...</p>
      </div>
    );
  }

  if (isError || !quest) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <EmptyState
          emoji="🔍"
          title="Quest Not Found"
          description="This quest may have been archived or doesn't exist."
          actionText="Back to Quests"
          onAction={() => navigate('/quests')}
        />
      </div>
    );
  }

  const isLocked = quest.studentStatus === 'LOCKED';
  const isCompleted = quest.studentStatus === 'COMPLETED';
  const isPending = quest.studentStatus === 'PENDING';

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:px-8 pb-24 md:pb-12">
      {/* Back button */}
      <div className="mb-4">
        <Link
          to="/quests"
          className="inline-flex items-center gap-1.5 text-xs font-heading font-extrabold text-ink px-3 py-1.5 rounded-xl border-2 border-ink bg-white shadow-hard-sm hover:bg-cream active:translate-x-0.5 active:translate-y-0.5"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Back to Quest Board</span>
        </Link>
      </div>

      {feedbackMessage && (
        <div className="mb-4 p-4 rounded-2xl bg-yellow/30 border-2.5 border-ink text-ink font-heading font-bold text-sm shadow-hard-sm flex items-center justify-between">
          <span>{feedbackMessage}</span>
          <button onClick={() => setFeedbackMessage(null)} className="text-xs font-mono font-bold">
            DISMISS
          </button>
        </div>
      )}

      {/* Main Quest Card */}
      <div className="bg-white border-3 border-ink rounded-3xl p-6 sm:p-8 shadow-hard-xl space-y-6">
        {/* Header: Category & Points */}
        <div className="flex items-center justify-between gap-3">
          <CategoryBadge category={quest.category} />
          <PointsBadge points={quest.pointValue} size="lg" />
        </div>

        {/* Title */}
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-4xl text-ink tracking-tight mb-2">
            {quest.title}
          </h1>
          <div className="flex items-center gap-2">
            <StatusBadge status={quest.studentStatus || 'AVAILABLE'} />
            <span className="text-xs font-mono font-bold text-gray-500 uppercase">
              • {quest.verificationType === 'QR' ? 'QR Code Quest' : 'Staff Verified'}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="bg-cream/60 border-2 border-ink/10 rounded-2xl p-4">
          <h3 className="font-heading font-bold text-sm text-gray-700 mb-1">
            MISSION BRIEF
          </h3>
          <p className="font-body text-base text-ink leading-relaxed">
            {quest.description}
          </p>
        </div>

        {/* Location Hint Card */}
        <div className="bg-[#FFF9E6] border-2.5 border-ink rounded-2xl p-4 shadow-hard-sm flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-yellow border-2 border-ink text-ink shadow-hard-sm">
            <MapPin className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="font-heading font-extrabold text-sm text-ink mb-0.5">
              LOCATION HINT
            </h4>
            <p className="font-body text-sm text-gray-800 font-medium">
              {quest.locationHint}
            </p>
          </div>
        </div>

        {/* Prerequisite Alert if Locked */}
        {isLocked && quest.prerequisiteQuest && (
          <div className="bg-gray-100 border-2.5 border-ink rounded-2xl p-4 shadow-hard-sm flex items-start gap-3">
            <div className="p-2 rounded-xl bg-gray-200 border-2 border-ink text-gray-700">
              <Lock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-heading font-extrabold text-sm text-ink mb-1">
                LOCKED: Prerequisite Quest Required
              </h4>
              <p className="font-body text-xs text-gray-600 mb-2">
                You must first complete the quest "{quest.prerequisiteQuest.title}" before this challenge unlocks.
              </p>
              <Link
                to={`/quests/${quest.prerequisiteQuest.id}`}
                className="inline-flex items-center gap-1 text-xs font-heading font-bold text-violet hover:underline"
              >
                Go to prerequisite quest →
              </Link>
            </div>
          </div>
        )}

        {/* Action Area */}
        <div className="pt-4 border-t-2.5 border-ink">
          {isCompleted && (
            <div className="p-4 rounded-2xl bg-mint/30 border-2.5 border-mint text-ink font-heading font-extrabold text-center flex items-center justify-center gap-2 shadow-hard-sm">
              <CheckCircle2 className="w-6 h-6 text-mint-dark stroke-[3]" />
              <span>You conquered this quest! +{quest.pointValue} PTS added to your ledger.</span>
            </div>
          )}

          {isPending && (
            <div className="p-4 rounded-2xl bg-yellow/40 border-2.5 border-yellow-dark text-ink font-heading font-bold text-center flex items-center justify-center gap-2 shadow-hard-sm">
              <Clock className="w-5 h-5 animate-spin" />
              <span>Submission pending staff verification. Points will be awarded upon approval!</span>
            </div>
          )}

          {!isCompleted && !isPending && !isLocked && (
            <div>
              {quest.verificationType === 'QR' ? (
                <div className="space-y-2">
                  <Button
                    variant="violet"
                    size="lg"
                    fullWidth
                    onClick={() => navigate('/scan')}
                  >
                    <QrCode className="w-6 h-6 stroke-[2.5]" />
                    Scan QR Code at Location
                  </Button>
                  <p className="text-center text-xs text-gray-500 font-body">
                    Look for the printed QuestBoard plaque or ask orientation staff at this spot!
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Button
                    variant="mint"
                    size="lg"
                    fullWidth
                    onClick={() => setIsManualModalOpen(true)}
                  >
                    <UserCheck className="w-6 h-6 stroke-[2.5]" />
                    I Did It! (Request Verification)
                  </Button>
                  <p className="text-center text-xs text-gray-500 font-body">
                    Complete the activity and submit a quick note for orientation staff review.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Manual Submission Modal (US-10) */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Submit Quest Verification"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-sm font-body text-gray-700">
            Tell us a little bit about how you completed <strong>"{quest.title}"</strong> (e.g. senior's name or what you discussed):
          </p>
          <textarea
            rows={4}
            value={manualNote}
            onChange={(e) => setManualNote(e.target.value)}
            placeholder="e.g. Met senior mentor Sarah at the quad picnic table. She gave great advice on CS classes!"
            className="w-full bg-cream border-2.5 border-ink rounded-xl p-3 font-body text-ink text-sm outline-none shadow-hard-sm focus:shadow-hard"
          />
          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-ink">
            <Button
              variant="white"
              onClick={() => setIsManualModalOpen(false)}
              disabled={manualMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="violet"
              onClick={() => manualMutation.mutate(manualNote)}
              disabled={manualMutation.isPending}
            >
              {manualMutation.isPending ? 'Submitting...' : 'Submit to Staff Queue 🚀'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
