import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Quest, QRCode } from '../../types/api';
import { Printer, Download, RefreshCw, AlertTriangle, Copy, Check } from 'lucide-react';

export interface QRPosterModalProps {
  isOpen: boolean;
  onClose: () => void;
  quest: Quest;
  qrCode?: QRCode | null;
  onRegenerate: (questId: string, expiresAt?: string | null) => Promise<void>;
}

export const QRPosterModal: React.FC<QRPosterModalProps> = ({
  isOpen,
  onClose,
  quest,
  qrCode,
  onRegenerate,
}) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expiryDays, setExpiryDays] = useState<string>('none');

  if (!qrCode) return null;

  const qrImageUrl = `/api/admin/quests/${quest.id}/qr.png?t=${qrCode.token}`;
  const scanUrl = `${window.location.origin}/scan?t=${encodeURIComponent(qrCode.token)}`;
  const shortCode = qrCode.token.slice(0, 8).toUpperCase();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(scanUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRegen = async () => {
    try {
      setIsRegenerating(true);
      let exp: string | null = null;
      if (expiryDays === '1') {
        exp = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      } else if (expiryDays === '7') {
        exp = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      }
      await onRegenerate(quest.id, exp);
      setShowRegenConfirm(false);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quest QR Code & Poster"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Print-Ready Poster Preview Section */}
        <div
          id="printable-poster"
          className="bg-yellow/20 border-3 border-ink rounded-3xl p-6 text-center shadow-hard flex flex-col items-center"
        >
          <div className="inline-block bg-yellow text-ink border-2 border-ink px-4 py-1 rounded-full font-heading font-black text-sm uppercase tracking-wider shadow-hard-sm mb-3">
            🎯 QUEST CHECKPOINT 🎯
          </div>

          <h2 className="font-heading font-black text-2xl text-ink mb-1">
            {quest.title}
          </h2>
          <p className="font-body text-xs text-gray-700 max-w-sm mb-4">
            {quest.locationHint}
          </p>

          {/* QR Code Image Container */}
          <div className="bg-white p-4 rounded-2xl border-3 border-ink shadow-hard inline-block mb-3">
            <img
              src={qrImageUrl}
              alt={`QR Code for ${quest.title}`}
              className="w-56 h-56 object-contain"
            />
          </div>

          <div className="font-heading font-extrabold text-xl text-ink tracking-tight mb-1">
            "Scan me to claim +{quest.pointValue} PTS!"
          </div>

          {/* Shortcode & Manual fallback banner */}
          <div className="bg-white border-2 border-ink px-3 py-1.5 rounded-xl font-mono text-xs text-ink shadow-hard-sm flex items-center gap-2">
            <span className="text-gray-500 font-sans font-bold">MANUAL CODE:</span>
            <span className="font-black text-violet text-sm tracking-wider">{shortCode}</span>
          </div>

          {qrCode.expiresAt && (
            <p className="text-[11px] font-mono text-pink-dark font-bold mt-2">
              ⏳ Code expires on: {new Date(qrCode.expiresAt).toLocaleString()}
            </p>
          )}
        </div>

        {/* Live Demo Controls: Short code, Copy Link, Download, Print */}
        <div className="space-y-3 bg-cream border-2.5 border-ink rounded-2xl p-4 shadow-hard-sm">
          <div className="flex items-center justify-between text-xs font-heading font-bold text-ink">
            <span>Direct Scan Link:</span>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1 text-violet hover:underline cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-mint" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
          <div className="bg-white p-2 rounded-xl border border-ink font-mono text-xs text-gray-600 truncate select-all">
            {scanUrl}
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <a
              href={qrImageUrl}
              download={`quest-${quest.id}-qr.png`}
              className="btn-arcade bg-mint text-ink text-xs py-2 px-3 inline-flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              Download PNG
            </a>
            <Button variant="white" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 stroke-[2.5]" />
              Print Poster
            </Button>
          </div>
        </div>

        {/* Regenerate Section (US-09) */}
        <div className="border-t-2 border-ink pt-4">
          {!showRegenConfirm ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-heading font-bold text-sm text-ink">Regenerate QR Code</p>
                <p className="text-xs text-gray-500 font-body">
                  Generates a fresh token. Old physical posters will stop working.
                </p>
              </div>
              <Button
                variant="pink"
                size="sm"
                onClick={() => setShowRegenConfirm(true)}
              >
                <RefreshCw className="w-4 h-4" />
                Regenerate
              </Button>
            </div>
          ) : (
            <div className="bg-pink-light/30 border-2.5 border-pink rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-ink font-heading font-extrabold text-sm">
                <AlertTriangle className="w-5 h-5 text-pink-dark shrink-0" />
                <span>Confirm Invalidation Warning</span>
              </div>
              <p className="text-xs text-gray-700 font-body">
                Regenerating will mark the current code <strong>INACTIVE</strong> immediately. Any printed copies in the campus will fail with "Code Invalid". Are you sure?
              </p>

              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-ink">Set Expiry:</label>
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  className="bg-white border-2 border-ink rounded-lg px-2 py-1 text-xs font-bold"
                >
                  <option value="none">Never expires</option>
                  <option value="1">24 Hours</option>
                  <option value="7">7 Days</option>
                </select>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <Button
                  variant="white"
                  size="sm"
                  onClick={() => setShowRegenConfirm(false)}
                  disabled={isRegenerating}
                >
                  Cancel
                </Button>
                <Button
                  variant="pink"
                  size="sm"
                  onClick={handleRegen}
                  disabled={isRegenerating}
                >
                  {isRegenerating ? 'Regenerating...' : 'Yes, Invalidate & Replace'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
