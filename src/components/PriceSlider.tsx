'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface PriceSliderProps {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
  currentMin: number;
  currentMax: number;
}

export default function PriceSlider({ min, max, onChange, currentMin, currentMax }: PriceSliderProps) {
  const [minVal, setMinVal] = useState(currentMin);
  const [maxVal, setMaxVal] = useState(currentMax);
  const minValRef = useRef(currentMin);
  const maxValRef = useRef(currentMax);
  const range = useRef<HTMLDivElement>(null);

  // Convert to percentage
  const getPercent = useCallback(
    (value: number) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);
  
  // Sync when props change
  useEffect(() => {
    setMinVal(currentMin);
    setMaxVal(currentMax);
    minValRef.current = currentMin;
    maxValRef.current = currentMax;
  }, [currentMin, currentMax]);

  return (
    <div style={{ padding: '10px 10px 20px 10px', width: '100%' }}>
      <div style={{ position: 'relative', height: '4px', width: '100%' }}>
        <input
          type="range"
          min={min}
          max={max}
          value={minVal}
          onChange={(event) => {
            const value = Math.min(Number(event.target.value), maxVal - 1);
            setMinVal(value);
            minValRef.current = value;
          }}
          onMouseUp={() => onChange(minVal, maxVal)}
          onTouchEnd={() => onChange(minVal, maxVal)}
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            WebkitAppearance: 'none',
            WebkitTapHighlightColor: 'transparent',
            width: '100%',
            outline: 'none',
            height: '0',
            zIndex: 3,
          }}
          className="thumb thumb--left"
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxVal}
          onChange={(event) => {
            const value = Math.max(Number(event.target.value), minVal + 1);
            setMaxVal(value);
            maxValRef.current = value;
          }}
          onMouseUp={() => onChange(minVal, maxVal)}
          onTouchEnd={() => onChange(minVal, maxVal)}
          style={{
            position: 'absolute',
            pointerEvents: 'none',
            WebkitAppearance: 'none',
            WebkitTapHighlightColor: 'transparent',
            width: '100%',
            outline: 'none',
            height: '0',
            zIndex: 4,
          }}
          className="thumb thumb--right"
        />

        <div style={{ position: 'relative', width: '100%' }}>
          <div style={{
            position: 'absolute',
            borderRadius: '3px',
            height: '4px',
            backgroundColor: '#F5EDE8',
            width: '100%',
            zIndex: 1
          }} />
          <div ref={range} style={{
            position: 'absolute',
            borderRadius: '3px',
            height: '4px',
            backgroundColor: '#D9A85C',
            zIndex: 2
          }} />
        </div>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', alignItems: 'center' }}>
        <div style={{ 
          fontFamily: 'Inter, sans-serif', 
          fontSize: '14px', 
          color: '#3F3B38',
          border: '1px solid #EAEAEA',
          borderRadius: '4px',
          padding: '4px 8px'
        }}>
          ₹{minVal}
        </div>
        <span style={{ color: '#BCAEA2' }}>-</span>
        <div style={{ 
          fontFamily: 'Inter, sans-serif', 
          fontSize: '14px', 
          color: '#3F3B38',
          border: '1px solid #EAEAEA',
          borderRadius: '4px',
          padding: '4px 8px'
        }}>
          ₹{maxVal}{maxVal === max ? '+' : ''}
        </div>
      </div>
    </div>
  );
}
