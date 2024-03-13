'use client'
import { SideLabelComponents } from './weekDisplay';
import React, { useEffect, useRef } from 'react';

export const sideListGutterHeight = 8;

const UsersList: React.FC<SideLabelComponents> = ({ labelContents, setDivHeights, offset }) => {
  // Use useRef to keep references to the div elements
  const divRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Calculate the heights of all divs and call setDivHeights with the result
    const heights = divRefs.current.map(div => div?.offsetHeight ?? 0);
    setDivHeights(heights);
  }, [labelContents]); 

  return (
    <div className="absolute left-0 z-30" style={{top: offset + "px"}}>
      <div className="flex flex-col" style={{rowGap: sideListGutterHeight * 3 + "px"}}>
        {labelContents && labelContents.map((label, index) => (
          <div
            key={index}
            ref={el => divRefs.current[index] = el} // Assign the div element to the refs array
            className="flex flex-row bg-white rounded-r p-4"
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersList;
