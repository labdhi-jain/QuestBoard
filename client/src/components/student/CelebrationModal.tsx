import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Button } from '../common/Button';
import { Sparkles, Trophy, CheckCircle2 } from 'lucide-react';

export interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  questTitle: string;
  pointsAwarded: number;
  newLifetimePoints: number;
  newPointsBalance: number;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  questTitle,
  pointsAwarded,
  newLifetimePoints,
  newPointsBalance,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Trigger multiple rounds of vibrant neo-brutalist confetti blast
      const count = 200;
      const defaults = {
        origin: { y: 0.65 },
        colors: ['#6C3BFF', '#FF4FA3', '#FFD23F', '#2EE6A6', '#3DC8FF', '#FF7A3D'],
      };

      function fire(particleRatio: number, opts: confetti.Options) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/75 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Celebration Card */}
          <motion.div
            initial={{ scale: 0.5, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="relative w-full max-w-sm bg-white border-3 border-ink rounded-3xl shadow-hard-xl p-6 text-center z-10 overflow-hidden"
          >
            {/* Top Starburst Banner */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint text-ink font-heading font-black text-xs border-2 border-ink shadow-hard-sm mb-3">
              <CheckCircle2 className="w-4 h-4 stroke-[3]" />
              QUEST VERIFIED!
            </div>

            {/* Giant Points Pop */}
            <motion.div
              initial={{ scale: 0, rotate: -15 }}
              animate={{ scale: [0, 1.25, 1], rotate: [0, -6, 0] }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 400 }}
              className="my-3 py-2 bg-yellow border-3 border-ink rounded-2xl shadow-hard"
            >
              <div className="font-heading font-black text-4xl text-ink tracking-tight flex items-center justify-center gap-2">
                <Sparkles className="w-7 h-7 fill-ink" />
                <span>+{pointsAwarded} PTS</span>
              </div>
            </motion.div>

            {/* Quest Title */}
            <h3 className="font-heading font-extrabold text-xl text-ink mb-2 line-clamp-2">
              "{questTitle}"
            </h3>
            <p className="font-body text-sm text-gray-600 mb-5">
              Nice work! You just conquered this campus quest and stamped your passport.
            </p>

            {/* Live New Totals Card */}
            <div className="grid grid-cols-2 gap-2 bg-cream border-2.5 border-ink rounded-2xl p-3 mb-6 shadow-hard-sm">
              <div className="text-left">
                <span className="block text-[11px] font-heading font-bold text-gray-500">NEW BALANCE</span>
                <span className="font-mono font-black text-base text-ink">{newPointsBalance} pts</span>
              </div>
              <div className="text-right">
                <span className="block text-[11px] font-heading font-bold text-gray-500">TOTAL XP</span>
                <span className="font-mono font-black text-base text-violet">{newLifetimePoints} XP</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <Button variant="violet" fullWidth size="lg" onClick={onClose}>
                Keep Exploring! 🚀
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
