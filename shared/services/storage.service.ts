import { ID } from 'appwrite';
import { storage, BUCKET_ID } from '../config/appwrite';
import type { UploadedFile } from '../types';

export const storageService = {
  // Upload file to storage
  async uploadFile(file: File, folder: string = 'general'): Promise<UploadedFile> {
    try {
      const fileId = ID.unique();
      
      const response = await storage.createFile(
        BUCKET_ID,
        fileId,
        file
      );

      return response as UploadedFile;
    } catch (error) {
      console.error('Upload file error:', error);
      throw error;
    }
  },

  // Upload receipt image
  async uploadReceipt(file: File): Promise<UploadedFile> {
    try {
      return await this.uploadFile(file, 'receipts');
    } catch (error) {
      console.error('Upload receipt error:', error);
      throw error;
    }
  },

  // Upload profile picture
  async uploadProfilePicture(file: File): Promise<UploadedFile> {
    try {
      return await this.uploadFile(file, 'profiles');
    } catch (error) {
      console.error('Upload profile picture error:', error);
      throw error;
    }
  },

  // Upload message attachment
  async uploadAttachment(file: File): Promise<UploadedFile> {
    try {
      return await this.uploadFile(file, 'attachments');
    } catch (error) {
      console.error('Upload attachment error:', error);
      throw error;
    }
  },

  // Get file URL for viewing
  getFileUrl(fileId: string): string {
    try {
      return storage.getFileView(BUCKET_ID, fileId).toString();
    } catch (error) {
      console.error('Get file URL error:', error);
      return '';
    }
  },

  // Get file download URL
  getFileDownloadUrl(fileId: string): string {
    try {
      return storage.getFileDownload(BUCKET_ID, fileId).toString();
    } catch (error) {
      console.error('Get file download URL error:', error);
      return '';
    }
  },

  // Get file preview URL (for images)
  getFilePreviewUrl(fileId: string, width?: number, height?: number): string {
    try {
      const url = storage.getFilePreview(BUCKET_ID, fileId);
      
      if (width) url.searchParams.set('width', width.toString());
      if (height) url.searchParams.set('height', height.toString());
      
      return url.toString();
    } catch (error) {
      console.error('Get file preview URL error:', error);
      return '';
    }
  },

  // Get file information
  async getFileInfo(fileId: string): Promise<UploadedFile | null> {
    try {
      const file = await storage.getFile(BUCKET_ID, fileId);
      return file as UploadedFile;
    } catch (error) {
      console.error('Get file info error:', error);
      return null;
    }
  },

  // Delete file
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      await storage.deleteFile(BUCKET_ID, fileId);
      return true;
    } catch (error) {
      console.error('Delete file error:', error);
      return false;
    }
  },

  // List files in bucket
  async listFiles(limit?: number, offset?: number) {
    try {
      const response = await storage.listFiles(BUCKET_ID);
      return response.files as UploadedFile[];
    } catch (error) {
      console.error('List files error:', error);
      throw error;
    }
  },

  // Validate file before upload
  validateFile(file: File): { valid: boolean; error?: string } {
    const maxSize = 20 * 1024 * 1024; // 20MB
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];

    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Arquivo muito grande. Máximo permitido: 20MB'
      };
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Tipo de arquivo não permitido. Use: JPG, PNG ou PDF'
      };
    }

    return { valid: true };
  },

  // Compress image before upload (for mobile)
  async compressImage(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions (max 1920x1080)
        const maxWidth = 1920;
        const maxHeight = 1080;
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  },

  // Upload multiple files
  async uploadMultipleFiles(files: File[], folder?: string): Promise<UploadedFile[]> {
    try {
      const uploadPromises = files.map(file => this.uploadFile(file, folder));
      const results = await Promise.allSettled(uploadPromises);
      
      const successful: UploadedFile[] = [];
      const failed: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successful.push(result.value);
        } else {
          failed.push(files[index].name);
        }
      });

      if (failed.length > 0) {
        console.warn('Some files failed to upload:', failed);
      }

      return successful;
    } catch (error) {
      console.error('Upload multiple files error:', error);
      throw error;
    }
  },

  // Get storage usage stats
  async getStorageStats() {
    try {
      const files = await this.listFiles(); // Simplified call
      
      const stats = {
        totalFiles: files.length,
        totalSize: files.reduce((sum, file) => sum + file.sizeOriginal, 0),
        fileTypes: {} as Record<string, number>,
        folders: {} as Record<string, number>,
      };

      files.forEach(file => {
        // Count by file type
        const extension = file.name.split('.').pop()?.toLowerCase() || 'unknown';
        stats.fileTypes[extension] = (stats.fileTypes[extension] || 0) + 1;

        // Count by folder (if using folder prefixes)
        const folder = file.name.includes('/') ? file.name.split('/')[0] : 'root';
        stats.folders[folder] = (stats.folders[folder] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Get storage stats error:', error);
      throw error;
    }
  },
};