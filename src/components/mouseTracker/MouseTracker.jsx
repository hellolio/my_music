import React, { useState, useRef } from 'react';
import './MouseTracker.css'; // 我们把样式单独放到 CSS 文件里

function MouseTracker() {
  const [coords, setCoords] = useState({ x: 0, y: 0, visible: false });
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      visible: true,
    });
  };

  const handleMouseLeave = () => {
    setCoords((prev) => ({ ...prev, visible: false }));
  };

  return (
    <div
      className="tracker-container"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      ref={containerRef}
    >
      {coords.visible && (
        <div
          className="tooltip"
          style={{ left: coords.x + 10, top: coords.y + 10 }}
        >
          X: {coords.x} Y: {coords.y}
        </div>
      )}
    </div>
  );
};

export default MouseTracker;
