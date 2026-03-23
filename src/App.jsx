import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { DownloadCloud, CheckSquare, Image as ImageIcon, X, Zap } from 'lucide-react';
import { getCachedPreview, setCachedPreview } from './utils/previewImageCache';
import { usePicsumPhotos } from './hooks/usePicsumPhotos';
import VirtualGallery from './components/VirtualGallery';
import CanvasImage from './components/CanvasImage';
import { applyWatermarkMainThread } from './utils/watermarkShared';

function App() {
  const { images, loading, error, fromCache } = usePicsumPhotos(200);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [previewImage, setPreviewImage] = useState(null);
  const [previewSrc, setPreviewSrc] = useState(null);
  const [processingState, setProcessingState] = useState({ isProcessing: false, progress: 0, total: 0 });
  
  const workerRef = useRef(null);
  
  // When previewImage changes, load from cache or decode and cache
  useEffect(() => {
    if (!previewImage) {
      setPreviewSrc(null);
      return;
    }
    
    const url = previewImage.downloadUrl || previewImage.url;
    const cached = getCachedPreview(url);
    
    if (cached) {
      setPreviewSrc(url);
    } else {
      setPreviewSrc(null); // Clear previous
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = url;
      img.decode().then(() => {
        setCachedPreview(url, true);
        setPreviewSrc(url);
      }).catch(() => {
        setPreviewSrc(url); // Fallback
      });
    }
  }, [previewImage]);
  
  // Initialize worker
  useEffect(() => {
    workerRef.current = new Worker(new URL('./workers/imageProcessor.worker.js', import.meta.url), {
      type: 'module'
    });
    
    return () => {
      if (workerRef.current) workerRef.current.terminate();
    };
  }, []);

  const handleToggleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(images.map(img => img.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [images]);

  const triggerDownload = (blobUrl, filename) => {
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const processImageWithWorker = (image) => {
    return new Promise((resolve, reject) => {
      const id = Date.now().toString() + Math.random().toString(36).substring(7);
      
      const handleMessage = (e) => {
        if (e.data.id === id) {
          workerRef.current.removeEventListener('message', handleMessage);
          
          if (e.data.status === 'success') {
            resolve(URL.createObjectURL(e.data.blob));
          } else if (e.data.status === 'fallback') {
            // Browser doesn't support OffscreenCanvas in worker, fallback to main thread
            applyWatermarkMainThread(image.url).then(resolve).catch(reject);
          } else {
            console.error('Worker processing error:', e.data.error);
            reject(new Error(e.data.error || 'Failed to process image'));
          }
        }
      };
      
      workerRef.current.addEventListener('message', handleMessage);
      workerRef.current.postMessage({ id, imageUrl: image.url, type: 'process' });
    });
  };

  const handleDownloadSingle = async (image) => {
    try {
      const url = await processImageWithWorker(image);
      triggerDownload(url, `celebrare-watermark-${image.id}.jpg`);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (err) {
      console.error('Failed to download image:', err);
      alert('Failed to process image for download.');
    }
  };

  const handleDownloadSelected = async () => {
    if (selectedIds.size === 0) return;
    
    const selectedImages = images.filter(img => selectedIds.has(img.id));
    setProcessingState({ isProcessing: true, progress: 0, total: selectedImages.length });
    
    const batchSize = 3;
    let completed = 0;
    
    for (let i = 0; i < selectedImages.length; i += batchSize) {
      const batch = selectedImages.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (image) => {
        try {
          const url = await processImageWithWorker(image);
          triggerDownload(url, `celebrare-watermark-${image.id}.jpg`);
          setTimeout(() => URL.revokeObjectURL(url), 10000);
        } catch(err) {
          console.error(`Failed to download image ${image.id}`, err);
        } finally {
          completed++;
          setProcessingState(prev => ({ ...prev, progress: completed }));
        }
      }));
      
      await new Promise(r => setTimeout(r, 50));
    }
    
    setProcessingState({ isProcessing: false, progress: 0, total: 0 });
    setSelectedIds(new Set()); 
  };

  // Render VirtualGallery Item
  const renderItem = useCallback(({ item, index, style }) => (
    <CanvasImage 
      key={item.id}
      item={item}
      index={index}
      style={style}
      selected={selectedIds.has(item.id)}
      onToggleSelect={handleToggleSelect}
      onPreview={setPreviewImage}
      onDownload={handleDownloadSingle}
    />
  ), [selectedIds, handleToggleSelect]); // handleDownloadSingle is stable enough

  const allSelected = images.length > 0 && selectedIds.size === images.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < images.length;

  const selectAllRef = useRef();
  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header glass-panel">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h1 className="app-title">Celebrare</h1>
          {fromCache && (
            <span className="cache-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', padding: '0.25rem 0.6rem', background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', borderRadius: '12px', border: '1px solid rgba(46, 204, 113, 0.3)', fontWeight: 500 }}>
              <Zap size={14} /> Loaded from Cache
            </span>
          )}
        </div>
        <div className="header-actions">
          {images.length > 0 && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 500 }}>
              <input 
                type="checkbox" 
                ref={selectAllRef}
                checked={allSelected} 
                onChange={handleSelectAll} 
                className="custom-checkbox"
              />
              Select All
            </label>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ margin: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
            <p>Loading premium gallery...</p>
          </div>
        ) : error ? (
          <div style={{ margin: 'auto', color: 'var(--danger-color)' }}>
            Error loading images: {error}
          </div>
        ) : (
          <VirtualGallery 
            items={images} 
            renderItem={renderItem} 
            minItemWidth={280} 
            gap={24} 
          />
        )}
      </main>

      {/* Bottom Tray */}
      <div className={`action-tray glass-panel ${selectedIds.size > 0 ? 'visible' : ''}`}>
        <div className="tray-info">
          <ImageIcon size={20} />
          <span>{selectedIds.size} image{selectedIds.size !== 1 ? 's' : ''} selected</span>
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={handleDownloadSelected}
          disabled={processingState.isProcessing}
        >
          {processingState.isProcessing ? (
            <>
              <div className="loading-spinner" />
              Processing ({processingState.progress}/{processingState.total})...
            </>
          ) : (
            <>
              <DownloadCloud size={18} />
              Download Selected
            </>
          )}
        </button>
      </div>

      {/* Fullscreen Preview */}
      {previewImage && (
        <div className="fullscreen-modal" onClick={() => setPreviewImage(null)}>
          <button className="close-btn" onClick={() => setPreviewImage(null)} aria-label="Close preview">
            <X size={32} />
          </button>
          <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
            {previewSrc ? (
              <img 
                src={previewSrc} 
                alt="Preview" 
                className="fullscreen-image" 
                crossOrigin="anonymous"
              />
            ) : (
              <div className="loading-spinner" style={{ width: '40px', height: '40px' }} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
