'use client';
import { SideLabelComponentsType, SideListItemType } from './../typeInterfaces';
import React, { useEffect, useRef } from 'react';
import { sideListGutterHeight } from './sideListLeft';

export const SideListItemRight: React.FC<SideListItemType> = ({ labelIndex, labelContent, divHeight, divRefs, setDivHeights }) => {
  return (
    <div
      key={labelIndex}
      ref={el => divRefs.current[labelIndex] = el}
      className="flex flex-row bg-white rounded-r p-4"
      style={{ minHeight: divHeight ? divHeight + "px" : "0px" }}
    >
      {labelContent}
    </div>
  );
}


const SideListRight: React.FC<SideLabelComponentsType> = ({ labelContents, divHeights, setDivHeights, offset, drawerIndex, drawerHeight }) => {
  // Use useRef to keep references to the div elements
  const divRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Calculate the heights of all divs and call setDivHeights with the result
    const heights = divRefs.current.map(div => div?.offsetHeight ?? 0);
    setDivHeights(heights);
  }, [labelContents]);

  return (
    <div className="relative z-40">
      <div className="absolute right-0 z-40" style={{ top: offset + "px" }}>
        <div className="flex flex-col">
          {labelContents.map((label, index) => (
            <React.Fragment key={index}>
              <SideListItemRight
                labelIndex={index}
                labelContent={label}
                divHeight={divHeights ? divHeights[index] : null}
                divRefs={divRefs}
                setDivHeights={setDivHeights}
              />
              {index < labelContents.length && (
                <div style={{ height: (sideListGutterHeight * 3 + (drawerIndex == index ? drawerHeight : 0)) + "px" }} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SideListRight;