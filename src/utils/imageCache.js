// In-memory cache for already-decoded gallery images
const imageCache = new Map();

/**
 * Get a cached image boolean/status by URL
 */
export const getCachedImage = (url) => {
  return imageCache.get(url);
};

/**
 * Set a cached image status by URL
 */
export const setCachedImage = (url, metadata) => {
  imageCache.set(url, metadata);
};
