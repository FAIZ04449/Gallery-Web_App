export const drawWatermark = (ctx, canvasWidth, canvasHeight, text = 'Celebrare') => {
  ctx.save();
  
  // Calculate responsive font size based on image width
  const fontSize = Math.max(24, Math.floor(canvasWidth / 8));
  ctx.font = `bold ${fontSize}px Inter, sans-serif`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Add shadow for contrast against light and dark images
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;

  // Draw diagonally across the center
  ctx.translate(canvasWidth / 2, canvasHeight / 2);
  ctx.rotate(-Math.PI / 4); 
  
  ctx.fillText(text, 0, 0);
  
  ctx.restore();
};

export const applyWatermarkMainThread = async (imageUrl) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(img, 0, 0);
      drawWatermark(ctx, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        resolve(URL.createObjectURL(blob));
      }, 'image/jpeg', 0.92);
    };
    img.onerror = () => reject(new Error('Failed to load image on main thread'));
    img.src = imageUrl;
  });
};
