import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from '../common/Button';
import { Camera, CameraOff, Keyboard, AlertCircle, RefreshCw } from 'lucide-react';

export interface ScannerProps {
  onScanSuccess: (token: string) => void;
  isLoading?: boolean;
}

export const Scanner: React.FC<ScannerProps> = ({ onScanSuccess, isLoading = false }) => {
  const [manualCode, setManualCode] = useState('');
  const [scannerActive, setScannerActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showManual, setShowManual] = useState(false);

  const qrRegionId = 'questboard-qr-reader';
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function startScanner() {
      try {
        setCameraError(null);
        const scanner = new Html5Qrcode(qrRegionId, {
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          verbose: false,
        });
        html5QrCodeRef.current = scanner;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await scanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (!isMounted) return;
            // The decoded text could be a full URL like http://localhost:5173/scan?t=TOKEN or a raw token
            try {
              if (decodedText.includes('?t=')) {
                const url = new URL(decodedText);
                const token = url.searchParams.get('t');
                if (token) {
                  onScanSuccess(token);
                  return;
                }
              }
            } catch {
              // Not a full URL, treat as raw token
            }
            onScanSuccess(decodedText.trim());
          },
          () => {
            // Frame failed to parse QR code (normal while searching)
          }
        );

        if (isMounted) {
          setScannerActive(true);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : String(err);
        console.warn('Camera scanner initialization failed:', msg);
        setCameraError('Camera access unavailable or blocked. Use the manual code fallback below.');
        setShowManual(true);
      }
    }

    startScanner();

    return () => {
      isMounted = false;
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current
          .stop()
          .catch((e) => console.warn('Scanner stop error:', e))
          .finally(() => {
            html5QrCodeRef.current?.clear();
          });
      }
    };
  }, [onScanSuccess]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim() || isLoading) return;
    onScanSuccess(manualCode.trim());
  };

  return (
    <div className="w-full space-y-4">
      {/* Viewfinder Card */}
      <div className="relative bg-ink border-3 border-ink rounded-3xl overflow-hidden shadow-hard-lg">
        {/* Camera container */}
        <div id={qrRegionId} className="w-full aspect-square max-h-[360px] bg-ink flex items-center justify-center text-white" />

        {/* Viewfinder Target Graphic (Visible while scanner is active) */}
        {scannerActive && !cameraError && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
            <div className="relative w-56 h-56 border-2 border-dashed border-yellow/80 rounded-2xl animate-pulse flex items-center justify-center">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-yellow rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-yellow rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-yellow rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-yellow rounded-br-xl" />
              <span className="bg-ink/80 text-yellow text-xs font-heading font-black px-3 py-1 rounded-full border border-yellow">
                POINT AT QUEST QR
              </span>
            </div>
          </div>
        )}

        {/* Camera Error Fallback View */}
        {cameraError && (
          <div className="p-8 text-center text-white bg-ink flex flex-col items-center justify-center min-h-[280px]">
            <CameraOff className="w-12 h-12 text-pink mb-3" />
            <p className="font-heading font-bold text-lg text-cream mb-1">Camera Standby</p>
            <p className="font-body text-xs text-gray-300 max-w-xs mb-4">{cameraError}</p>
            <Button
              variant="yellow"
              size="sm"
              onClick={() => setShowManual(true)}
            >
              Enter Code Manually Below ✍️
            </Button>
          </div>
        )}
      </div>

      {/* Manual Code Entry Fallback Form */}
      <div className="bg-white border-2.5 border-ink rounded-3xl p-5 shadow-hard">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-violet stroke-[2.5]" />
            <h4 className="font-heading font-extrabold text-base text-ink">
              Type the code instead
            </h4>
          </div>
          <span className="text-[11px] font-mono font-bold text-gray-500 uppercase">
            Live Demo Fallback
          </span>
        </div>

        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. SILENT-FLOOR-2026"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1 bg-cream border-2.5 border-ink rounded-xl px-3.5 py-2 font-mono font-bold text-ink text-sm uppercase placeholder:normal-case placeholder:text-gray-400 outline-none shadow-hard-sm focus:shadow-hard"
            />
            <Button
              type="submit"
              variant="violet"
              size="md"
              disabled={!manualCode.trim() || isLoading}
            >
              {isLoading ? 'Verifying...' : 'Check In'}
            </Button>
          </div>
          <p className="text-xs text-gray-500 font-body">
            💡 Found a physical poster? You can either point your camera or type the code printed on the plaque.
          </p>
        </form>
      </div>
    </div>
  );
};
