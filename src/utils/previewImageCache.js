// In-memory cache for full-screen preview high-res images
const previewCache = new Map();

export const getCachedPreview = (url) => {
  return previewCache.get(url);
};

export const setCachedPreview = (url, metadata) => {
  previewCache.set(url, metadata);
};
