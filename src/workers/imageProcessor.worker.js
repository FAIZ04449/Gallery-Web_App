import { drawWatermark } from '../utils/watermarkShared.js';

self.onmessage = async (e) => {
  const { id, imageUrl, type } = e.data;
  
  if (type === 'process') {
    try {
      // Fetch the image as a blob
      const response = await fetch(imageUrl);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const blob = await response.blob();
      
      // Use createImageBitmap to create bitmap from blob
      const bitmap = await createImageBitmap(blob);
      
      const width = bitmap.width;
      const height = bitmap.height;
      
      // Check for OffscreenCanvas support (available in modern Chrome, Edge, Firefox, Safari 16.4+)
      if (typeof OffscreenCanvas !== 'undefined') {
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Could not get 2D context for OffscreenCanvas');
        
        // Draw original image
        ctx.drawImage(bitmap, 0, 0);
        
        // Apply shared watermark logic
        drawWatermark(ctx, width, height, 'Celebrare');
        
        // Convert back to blob
        const processedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.92 });
        
        // Send blob back to main thread
        self.postMessage({ id, status: 'success', blob: processedBlob });
      } else {
        // Fallback for browsers without OffscreenCanvas support in workers
        self.postMessage({ id, status: 'fallback', imageUrl });
      }
      
    } catch (error) {
      console.error('Worker error:', error);
      self.postMessage({ id, status: 'error', error: error.message, imageUrl });
    }
  }
};
