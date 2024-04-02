'use client';
import { SideLabelComponentsType } from './../typeInterfaces';
import React, { useEffect, useRef, useMemo, useCallback } from 'react';

export const sideListGutterHeight = 8;

const SideListLeft: React.FC<SideLabelComponentsType> = ({ labelContents, onDivHeightsUpdate, offset }) => {
  // Use useRef to keep references to the div elements
  const divRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const heights = divRefs.current.map((div) => div?.offsetHeight ?? 0);
    onDivHeightsUpdate(heights);
  }, [labelContents, onDivHeightsUpdate]);

  const memoizedLabelContents = useMemo(() => {
    return labelContents.map((label, index) => (
      <div
        key={index}
        ref={el => divRefs.current[index] = el}
        className="flex flex-row bg-white rounded-r p-4"
      >
        {label}
      </div>
    ));
  }, [labelContents]);

  return (
    <div className="relative z-40">
      <div className="absolute left-0 z-40" style={{ top: offset + "px" }}>
        <div className="flex flex-col" style={{ rowGap: sideListGutterHeight * 3 + "px" }}>
          {memoizedLabelContents}
        </div>
      </div>
    </div>
  );
};

export default SideListLeft;