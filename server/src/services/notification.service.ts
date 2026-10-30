import { db } from '../utils/db';
import { NotFoundError } from '../utils/errors';

export class NotificationService {
  /**
   * Fetches user's notifications
   * US-07
   */
  static async getUserNotifications(userId: string) {
    return db.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Marks a notification as read
   */
  static async markAsRead(notificationId: string, userId: string) {
    const notification = await db.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new NotFoundError('Notification not found', 'NOT_FOUND');
    }

    return db.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }

  /**
   * Marks all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    return db.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }
}
