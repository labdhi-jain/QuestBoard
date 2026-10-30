import crypto from 'crypto';
import QRCodeLib from 'qrcode';
import { db } from '../utils/db';
import { ENV } from '../config/env';
import { NotFoundError } from '../utils/errors';

export class QRService {
  /**
   * Generates or regenerates a QR code for a quest.
   * US-09: Regenerating a code invalidates the previous one.
   */
  static async generateCode(questId: string, expiresAt?: Date | null) {
    const quest = await db.quest.findUnique({ where: { id: questId } });
    if (!quest) {
      throw new NotFoundError('Quest not found', 'QUEST_NOT_FOUND');
    }

    // Invalidate previous active codes for this quest
    await db.qRCode.updateMany({
      where: { questId, active: true },
      data: { active: false },
    });

    // Generate unguessable 32-character hexadecimal token
    const token = crypto.randomBytes(16).toString('hex');

    const qrCode = await db.qRCode.create({
      data: {
        questId,
        token,
        expiresAt: expiresAt || null,
        active: true,
      },
    });

    const scanUrl = this.getScanUrl(token);

    return {
      qrCode,
      scanUrl,
      shortCode: token.slice(0, 8).toUpperCase(),
    };
  }

  /**
   * Constructs the full scan URL
   */
  static getScanUrl(token: string): string {
    return `${ENV.APP_URL}/scan?t=${encodeURIComponent(token)}`;
  }

  /**
   * Generates a PNG buffer of the QR code
   */
  static async generatePNG(token: string): Promise<Buffer> {
    const scanUrl = this.getScanUrl(token);
    return QRCodeLib.toBuffer(scanUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 512,
      color: {
        dark: '#1B1340', // Ink border color
        light: '#FFFFFF',
      },
    });
  }

  /**
   * Generates a base64 Data URI string of the QR code
   */
  static async generateDataURL(token: string): Promise<string> {
    const scanUrl = this.getScanUrl(token);
    return QRCodeLib.toDataURL(scanUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      width: 400,
      color: {
        dark: '#1B1340',
        light: '#FFFFFF',
      },
    });
  }
}
