'use client';
import { SideLabelComponentsType } from './../typeInterfaces';
import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { sideListGutterHeight } from './sideListLeft';

const SideListRight: React.FC<SideLabelComponentsType> = ({ labelContents, divHeights, setDivHeights, offset }) => {
  // Use useRef to keep references to the div elements
  const divRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Calculate the heights of all divs and call setDivHeights with the result
    const heights = divRefs.current.map(div => div?.offsetHeight ?? 0);
    setDivHeights(heights);
  }, [labelContents]);

  const memoizedLabelContents = useMemo(() => {
    return labelContents.map((label, index) => (
      <div
        key={index}
        ref={el => divRefs.current[index] = el}
        className="flex flex-row bg-white rounded-l p-4"
        style={{ minHeight: divHeights ? divHeights[index] + "px" : "0px" }}
      >
        {label}
      </div>
    ));
  }, [labelContents]);

  return (
    <div className="relative z-40">
      <div className="absolute right-0 z-40" style={{ top: offset + "px" }}>
        <div className="flex flex-col" style={{ rowGap: sideListGutterHeight * 3 + "px" }}>
          {memoizedLabelContents}
        </div>
      </div>
    </div>
  );
};

export default SideListRight;