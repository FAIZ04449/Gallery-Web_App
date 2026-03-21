import { useState, useEffect } from 'react';

export function usePicsumPhotos(limit = 200) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function fetchImages() {
      try {
        setLoading(true);
        // Picsum photos API
        const response = await fetch(`https://picsum.photos/v2/list?page=1&limit=${limit}`);
        if (!response.ok) throw new Error('Failed to fetch images');
        const data = await response.json();
        
        if (mounted) {
          // Format data to be easily usable
          const formatted = data.map(item => ({
            id: item.id,
            url: `https://picsum.photos/id/${item.id}/600/600`,
            downloadUrl: item.download_url,
            author: item.author,
          }));
          setImages(formatted);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchImages();

    return () => {
      mounted = false;
    };
  }, [limit]);

  return { images, loading, error };
}
