'use client';
import { SideLabelComponentsType } from './../typeInterfaces';
import React, { useEffect, useRef, useMemo, useCallback } from 'react';

export const sideListGutterHeight = 8;

const SideListLeft: React.FC<SideLabelComponentsType> = ({ labelContents, divHeights, setDivHeights, offset }) => {
  // Use useRef to keep references to the div elements
  const divRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Calculate the heights of all divs and call setDivHeights with the result
    const heights = divRefs.current.map(div => div?.offsetHeight ?? 0);
    setDivHeights(heights);
  }, [labelContents]);

  return (
    <div className="relative z-40">
      <div className="absolute left-0 z-40" style={{ top: offset + "px" }}>
        <div className="flex flex-col" style={{ rowGap: sideListGutterHeight * 3 + "px" }}>
          {labelContents.map((label, index) => (
            <div
              key={index}
              ref={el => divRefs.current[index] = el}
              className="flex flex-row bg-white rounded-r p-4"
              style={{ minHeight: divHeights ? divHeights[index] + "px" : "0px" }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SideListLeft;