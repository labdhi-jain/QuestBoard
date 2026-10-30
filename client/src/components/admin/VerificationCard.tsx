import React, { useState } from 'react';
import { CheckIn } from '../../types/api';
import { Button } from '../common/Button';
import { Check, X, Clock, User, MessageSquare } from 'lucide-react';

export interface VerificationCardProps {
  checkIn: CheckIn;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export const VerificationCard: React.FC<VerificationCardProps> = ({
  checkIn,
  onApprove,
  onReject,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAction = async (action: 'approve' | 'reject') => {
    try {
      setIsProcessing(true);
      if (action === 'approve') {
        await onApprove(checkIn.id);
      } else {
        await onReject(checkIn.id);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const timeAgo = new Date(checkIn.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="bg-white border-2.5 border-ink rounded-3xl p-5 shadow-hard flex flex-col justify-between gap-4">
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            {timeAgo}
          </span>
          <span className="bg-yellow text-ink border-2 border-ink px-2.5 py-0.5 rounded-full font-mono font-bold text-xs shadow-hard-sm">
            +{checkIn.quest?.pointValue || 0} PTS
          </span>
        </div>

        <h4 className="font-heading font-extrabold text-lg text-ink mb-1">
          {checkIn.quest?.title}
        </h4>

        {/* Student details */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-3 bg-cream p-2 rounded-xl border border-ink">
          <User className="w-4 h-4 text-violet stroke-[2.5]" />
          <span>{checkIn.user?.name}</span>
          <span className="text-gray-400 font-normal">({checkIn.user?.email})</span>
        </div>

        {/* Note if provided */}
        {checkIn.note && (
          <div className="bg-[#FFFDF0] border-2 border-dashed border-ink/40 rounded-xl p-3 text-xs font-body text-gray-700">
            <div className="flex items-center gap-1 font-heading font-bold text-ink mb-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Student Submission Note:</span>
            </div>
            <p className="italic">"{checkIn.note}"</p>
          </div>
        )}
      </div>

      {/* Approve / Reject buttons */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t-2 border-ink/10">
        <Button
          variant="pink"
          size="sm"
          onClick={() => handleAction('reject')}
          disabled={isProcessing}
        >
          <X className="w-4 h-4 stroke-[2.5]" />
          Reject
        </Button>
        <Button
          variant="mint"
          size="sm"
          onClick={() => handleAction('approve')}
          disabled={isProcessing}
        >
          <Check className="w-4 h-4 stroke-[3]" />
          Approve (+{checkIn.quest?.pointValue || 0})
        </Button>
      </div>
    </div>
  );
};
