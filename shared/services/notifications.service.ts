import { ID, Query } from 'appwrite';
import { databases, DATABASE_ID, COLLECTIONS, TOPICS } from '../config/appwrite';
import type { Notification } from '../types';

export const notificationsService = {
  // Create new notification
  async createNotification(data: {
    title: string;
    content: string;
    priority?: 'baixa' | 'media' | 'alta';
    targetUsers?: string[]; // Array of user IDs, null means all users
    expiresAt?: string;
  }) {
    try {
      const notificationData = {
        title: data.title,
        content: data.content,
        priority: data.priority || 'media',
        targetUsers: data.targetUsers ? JSON.stringify(data.targetUsers) : null,
        readBy: JSON.stringify({}),
        date: new Date().toISOString(),
        expiresAt: data.expiresAt || null,
      };

      const notification = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        ID.unique(),
        notificationData
      );

      return notification as unknown as Notification;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  },

  // Send push notification
  async sendPushNotification(data: {
    title: string;
    content: string;
    targetUsers?: string[];
  }) {
    try {
      // Create notification in database first
      const notification = await this.createNotification(data);

      // Note: Push notifications will be implemented when FCM is properly configured
      // For now, we just create the notification in the database
      // Push notification integration can be added later with proper FCM setup

      return notification;
    } catch (error) {
      console.error('Send push notification error:', error);
      throw error;
    }
  },

  // Get user notifications
  async getUserNotifications(userId: string, limit?: number) {
    try {
      // Get global notifications (targetUsers is null)
      const globalQuery = [
        Query.isNull('targetUsers'),
        Query.orderDesc('date')
      ];
      if (limit) globalQuery.push(Query.limit(limit));

      const globalResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        globalQuery
      );

      // Get all notifications and filter manually for targeted ones
      const allQuery = [
        Query.orderDesc('date')
      ];
      if (limit) allQuery.push(Query.limit(limit * 2)); // Get more to account for filtering

      const allResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        allQuery
      );

      // Filter targeted notifications manually
      const targetedNotifications = allResponse.documents.filter(notification => {
        if (!notification.targetUsers) return false;
        try {
          const targetUsers = JSON.parse(notification.targetUsers);
          return Array.isArray(targetUsers) && targetUsers.includes(userId);
        } catch {
          return false;
        }
      });

      // Combine and sort all notifications
      const allNotifications = [
        ...globalResponse.documents,
        ...targetedNotifications
      ];

      // Remove duplicates and sort by date
      const uniqueNotifications = Array.from(
        new Map(allNotifications.map(notif => [notif.$id, notif])).values()
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return (limit ? uniqueNotifications.slice(0, limit) : uniqueNotifications) as unknown as Notification[];
    } catch (error) {
      console.error('Get user notifications error:', error);
      throw error;
    }
  },

  // Get all notifications (for admins)
  async getAllNotifications(limit?: number) {
    try {
      const queries = [Query.orderDesc('date')];

      if (limit) {
        queries.push(Query.limit(limit));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        queries
      );

      return response.documents as unknown as Notification[];
    } catch (error) {
      console.error('Get all notifications error:', error);
      throw error;
    }
  },

  // Get unread notifications count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const notifications = await this.getUserNotifications(userId);
      
      let unreadCount = 0;
      notifications.forEach(notification => {
        const readBy = notification.readBy ? JSON.parse(notification.readBy) : {};
        if (!readBy[userId]) {
          unreadCount++;
        }
      });

      return unreadCount;
    } catch (error) {
      console.error('Get unread notifications count error:', error);
      return 0;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string) {
    try {
      // Get current notification
      const notification = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        notificationId
      ) as unknown as Notification;

      // Update readBy object
      const readBy = notification.readBy ? JSON.parse(notification.readBy) : {};
      readBy[userId] = true;

      // Update notification
      const updatedNotification = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        notificationId,
        { readBy: JSON.stringify(readBy) }
      );

      return updatedNotification as unknown as Notification;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  },

  // Mark all notifications as read for user
  async markAllAsRead(userId: string) {
    try {
      const notifications = await this.getUserNotifications(userId);
      
      const promises = notifications.map(notification => {
        const readBy = notification.readBy ? JSON.parse(notification.readBy) : {};
        if (!readBy[userId]) {
          return this.markAsRead(notification.$id, userId);
        }
        return Promise.resolve(notification);
      });

      const results = await Promise.allSettled(promises);
      const successful = results.filter(result => result.status === 'fulfilled').length;
      
      return { successful, total: promises.length };
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
  },

  // Delete notification
  async deleteNotification(notificationId: string) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        notificationId
      );

      return true;
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  },

  // Get notifications by priority
  async getNotificationsByPriority(priority: 'baixa' | 'media' | 'alta', userId?: string, limit?: number) {
    try {
      const queries = [
        Query.equal('priority', priority),
        Query.orderDesc('date')
      ];

      if (limit) {
        queries.push(Query.limit(limit));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.NOTIFICATIONS,
        queries
      );

      let notifications = response.documents as unknown as Notification[];

      // Filter by user if specified
      if (userId) {
        notifications = notifications.filter(notification => {
          // Include global notifications (targetUsers is null)
          if (!notification.targetUsers) return true;
          
          // Include targeted notifications that contain the user
          try {
            const targetUsers = JSON.parse(notification.targetUsers);
            return targetUsers.includes(userId);
          } catch {
            return false;
          }
        });
      }

      return notifications;
    } catch (error) {
      console.error('Get notifications by priority error:', error);
      throw error;
    }
  },

  // Send expense status notification
  async sendExpenseStatusNotification(data: {
    userId: string;
    expenseId: string;
    status: 'aprovado' | 'rejeitado';
    amount: number;
    type: string;
    rejectionReason?: string;
  }) {
    try {
      const title = data.status === 'aprovado' 
        ? 'Despesa Aprovada' 
        : 'Despesa Rejeitada';

      const content = data.status === 'aprovado'
        ? `Sua despesa de ${data.type} no valor de €${data.amount} foi aprovada.`
        : `Sua despesa de ${data.type} no valor de €${data.amount} foi rejeitada. ${data.rejectionReason ? `Motivo: ${data.rejectionReason}` : ''}`;

      return await this.createNotification({
        title,
        content,
        priority: data.status === 'rejeitado' ? 'alta' : 'media',
        targetUsers: [data.userId],
      });
    } catch (error) {
      console.error('Send expense status notification error:', error);
      throw error;
    }
  },

  // Send general announcement
  async sendAnnouncement(data: {
    title: string;
    content: string;
    priority?: 'baixa' | 'media' | 'alta';
    targetRoles?: string[]; // Target specific roles
  }) {
    try {
      return await this.createNotification({
        title: data.title,
        content: data.content,
        priority: data.priority || 'media',
        // Note: To target roles, you'd need to query users by role first
        // and pass their IDs to targetUsers
      });
    } catch (error) {
      console.error('Send announcement error:', error);
      throw error;
    }
  },
};