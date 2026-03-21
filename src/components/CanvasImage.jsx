import React, { useState } from 'react';
import { Download, Maximize2 } from 'lucide-react';

export default function CanvasImage({ 
  item, 
  style, 
  selected, 
  onToggleSelect, 
  onPreview, 
  onDownload 
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`image-card ${selected ? 'selected' : ''}`} style={style}>
      {!loaded && <div className="shimmer" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} />}
      
      <img 
        src={item.url} 
        alt={`By ${item.author}`} 
        className={loaded ? 'ready' : 'loading'}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.4s ease' }}
        onLoad={() => setLoaded(true)}
        crossOrigin="anonymous" 
      />
      
      <div className="image-card-overlay">
        <div className="image-card-top">
          <input 
            type="checkbox" 
            className="custom-checkbox" 
            checked={selected}
            onChange={() => onToggleSelect(item.id)}
            aria-label={`Select image by ${item.author}`}
          />
        </div>
        <div className="image-card-bottom">
          <button 
            className="btn btn-primary" 
            onClick={(e) => {
              e.stopPropagation();
              onPreview(item);
            }}
            title="Preview Fullscreen"
            style={{ padding: '0.5rem', borderRadius: '50%' }}
            aria-label="Preview fullscreen"
          >
            <Maximize2 size={16} />
          </button>
          
          <button 
            className="btn glass-panel" 
            onClick={(e) => {
              e.stopPropagation();
              onDownload(item);
            }}
            title="Download with Watermark"
            style={{ padding: '0.5rem', borderRadius: '50%' }}
            aria-label="Download with Watermark"
          >
            <Download size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
