import { ID, Query } from 'appwrite';
import { databases, DATABASE_ID, COLLECTIONS } from '../config/appwrite';
import type { Message, MessageFormData } from '../types';

export const messagesService = {
  // Send new message
  async sendMessage(data: MessageFormData & { senderId: string }) {
    try {
      const messageData = {
        senderId: data.senderId,
        receiverId: data.receiverId || null,
        content: data.content,
        attachments: data.attachments ? JSON.stringify(data.attachments.map(f => f.name)) : null,
        read: false,
        timestamp: new Date().toISOString(),
      };

      const message = await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        ID.unique(),
        messageData
      );

      return message as unknown as Message;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  // Get user messages (sent and received)
  async getUserMessages(userId: string, limit?: number) {
    try {
      // Get messages sent by user
      const sentQuery = [
        Query.equal('senderId', userId),
        Query.orderDesc('timestamp')
      ];
      if (limit) sentQuery.push(Query.limit(limit));

      const sentResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        sentQuery
      );

      // Get messages received by user
      const receivedQuery = [
        Query.equal('receiverId', userId),
        Query.orderDesc('timestamp')
      ];
      if (limit) receivedQuery.push(Query.limit(limit));

      const receivedResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        receivedQuery
      );

      // Get global messages (receiverId is null)
      const globalQuery = [
        Query.isNull('receiverId'),
        Query.orderDesc('timestamp')
      ];
      if (limit) globalQuery.push(Query.limit(limit));

      const globalResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        globalQuery
      );

      // Combine and sort all messages
      const allMessages = [
        ...sentResponse.documents,
        ...receivedResponse.documents,
        ...globalResponse.documents
      ];

      // Remove duplicates and sort by timestamp
      const uniqueMessages = Array.from(
        new Map(allMessages.map(msg => [msg.$id, msg])).values()
      ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return uniqueMessages as unknown as Message[];
    } catch (error) {
      console.error('Get user messages error:', error);
      throw error;
    }
  },

  // Get conversation between two users
  async getConversation(userId1: string, userId2: string, limit?: number) {
    try {
      // Get messages from user1 to user2
      const query1 = [
        Query.equal('senderId', userId1),
        Query.equal('receiverId', userId2),
        Query.orderDesc('timestamp')
      ];
      if (limit) query1.push(Query.limit(Math.ceil(limit / 2)));

      const response1 = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        query1
      );

      // Get messages from user2 to user1
      const query2 = [
        Query.equal('senderId', userId2),
        Query.equal('receiverId', userId1),
        Query.orderDesc('timestamp')
      ];
      if (limit) query2.push(Query.limit(Math.ceil(limit / 2)));

      const response2 = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        query2
      );

      // Combine and sort messages
      const allMessages = [...response1.documents, ...response2.documents];
      const sortedMessages = allMessages.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return (limit ? sortedMessages.slice(0, limit) : sortedMessages) as unknown as Message[];
    } catch (error) {
      console.error('Get conversation error:', error);
      throw error;
    }
  },

  // Get all messages (for admins)
  async getAllMessages(limit?: number) {
    try {
      const queries = [Query.orderDesc('timestamp')];

      if (limit) {
        queries.push(Query.limit(limit));
      }

      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        queries
      );

      return response.documents as unknown as Message[];
    } catch (error) {
      console.error('Get all messages error:', error);
      throw error;
    }
  },

  // Get unread messages count
  async getUnreadCount(userId: string): Promise<number> {
    try {
      // Count unread messages received by user
      const receivedResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        [
          Query.equal('receiverId', userId),
          Query.equal('read', false)
        ]
      );

      // Count unread global messages
      const globalResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        [
          Query.isNull('receiverId'),
          Query.equal('read', false)
        ]
      );

      return receivedResponse.total + globalResponse.total;
    } catch (error) {
      console.error('Get unread count error:', error);
      return 0;
    }
  },

  // Mark message as read
  async markAsRead(messageId: string) {
    try {
      const updatedMessage = await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        messageId,
        { read: true }
      );

      return updatedMessage as unknown as Message;
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  },

  // Mark multiple messages as read
  async markMultipleAsRead(messageIds: string[]) {
    try {
      const promises = messageIds.map(id => this.markAsRead(id));
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      return { successful, total: messageIds.length };
    } catch (error) {
      console.error('Mark multiple as read error:', error);
      throw error;
    }
  },

  // Delete message
  async deleteMessage(messageId: string) {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        messageId
      );

      return true;
    } catch (error) {
      console.error('Delete message error:', error);
      throw error;
    }
  },

  // Get recent contacts (users who have exchanged messages)
  async getRecentContacts(userId: string, limit: number = 10) {
    try {
      // Get all messages involving the user
      const sentResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        [
          Query.equal('senderId', userId),
          Query.orderDesc('timestamp'),
          Query.limit(50)
        ]
      );

      const receivedResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        [
          Query.equal('receiverId', userId),
          Query.orderDesc('timestamp'),
          Query.limit(50)
        ]
      );

      const allMessages = [...sentResponse.documents, ...receivedResponse.documents] as unknown as Message[];
      const contactIds = new Set<string>();

      // Extract unique contact IDs
      allMessages.forEach(message => {
        if (message.senderId !== userId && message.senderId) {
          contactIds.add(message.senderId);
        }
        if (message.receiverId !== userId && message.receiverId) {
          contactIds.add(message.receiverId);
        }
      });

      // Convert to array and limit
      return Array.from(contactIds).slice(0, limit);
    } catch (error) {
      console.error('Get recent contacts error:', error);
      throw error;
    }
  },

  // Search messages
  async searchMessages(userId: string, query: string, limit?: number) {
    try {
      // Search in sent messages
      const sentQuery = [
        Query.equal('senderId', userId),
        Query.search('content', query),
        Query.orderDesc('timestamp')
      ];
      if (limit) sentQuery.push(Query.limit(Math.ceil(limit / 2)));

      const sentResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        sentQuery
      );

      // Search in received messages
      const receivedQuery = [
        Query.equal('receiverId', userId),
        Query.search('content', query),
        Query.orderDesc('timestamp')
      ];
      if (limit) receivedQuery.push(Query.limit(Math.ceil(limit / 2)));

      const receivedResponse = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.MESSAGES,
        receivedQuery
      );

      // Combine results
      const allMessages = [...sentResponse.documents, ...receivedResponse.documents];
      const uniqueMessages = Array.from(
        new Map(allMessages.map(msg => [msg.$id, msg])).values()
      ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      return (limit ? uniqueMessages.slice(0, limit) : uniqueMessages) as unknown as Message[];
    } catch (error) {
      console.error('Search messages error:', error);
      throw error;
    }
  },
};