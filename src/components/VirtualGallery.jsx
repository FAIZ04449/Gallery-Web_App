import React, { useState, useEffect, useRef, useMemo } from 'react';

const VirtualGallery = ({ items, renderItem, minItemWidth = 250, gap = 16 }) => {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(800);

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
        setViewportHeight(entries[0].contentRect.height);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const columns = useMemo(() => {
    if (!containerWidth) return 1;
    const cols = Math.floor((containerWidth + gap) / (minItemWidth + gap));
    return Math.max(1, cols);
  }, [containerWidth, minItemWidth, gap]);

  const itemWidth = useMemo(() => {
    if (!containerWidth) return minItemWidth;
    return (containerWidth - (columns - 1) * gap) / columns;
  }, [containerWidth, columns, gap, minItemWidth]);

  // Keep items square for premium design consistency
  const itemHeight = itemWidth;

  const totalRows = Math.ceil(items.length / columns);
  const totalHeight = totalRows * itemHeight + (totalRows - 1) * gap;

  const handleScroll = (e) => {
    requestAnimationFrame(() => {
      setScrollTop(e.target.scrollTop);
    });
  };

  // Buffer defines how many rows to render outside viewport
  const buffer = 2; 
  
  const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - buffer);
  const endRow = Math.min(
    totalRows - 1,
    Math.floor((scrollTop + viewportHeight) / (itemHeight + gap)) + buffer
  );

  const startIndex = startRow * columns;
  const endIndex = Math.min(items.length - 1, (endRow + 1) * columns - 1);

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const item = items[i];
    if (!item) continue;
    
    const row = Math.floor(i / columns);
    const col = i % columns;
    
    const top = row * (itemHeight + gap);
    const left = col * (itemWidth + gap);

    visibleItems.push(
      renderItem({
        item,
        index: i,
        style: {
          position: 'absolute',
          top: `${top}px`,
          left: `${left}px`,
          width: `${itemWidth}px`,
          height: `${itemHeight}px`,
        }
      })
    );
  }

  return (
    <div 
      className="gallery-viewport no-scrollbar" 
      ref={containerRef} 
      onScroll={handleScroll}
    >
      <div className="gallery-inner" style={{ height: `${totalHeight}px` }}>
        {visibleItems}
      </div>
    </div>
  );
};

export default VirtualGallery;
