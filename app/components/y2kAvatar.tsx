"use client";
import { useEffect, useRef } from 'react';
import Image from "next/image";
import { applyY2KImageFilter } from "@/app/utils/imageFilters";

type Y2KAvatarProps = {
  src: string;
  alt: string;
  fill?: boolean;
  sizes?: string;
  className?: string;
  width?: number;
  height?: number;
};

export default function Y2KAvatar({ src, alt, fill, sizes, className, width, height }: Y2KAvatarProps) {
  const imgRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageLoaded = useRef(false);
  const isY2KTheme = document.documentElement.getAttribute('data-theme') === 'y2k';
  
  useEffect(() => {
    const handleImageLoad = () => {
      if (!imgRef.current || !canvasRef.current || !isY2KTheme) return;
      
      const imgElement = imgRef.current.querySelector('img');
      if (imgElement && imgElement.complete) {
        imageLoaded.current = true;
        
        // We need to wait for Next.js Image to fully load and render
        setTimeout(() => {
          // Create a temporary image to get natural dimensions
          const tempImg = new window.Image();
          tempImg.crossOrigin = "anonymous";
          tempImg.src = src;
          
          tempImg.onload = () => {
            const canvas = applyY2KImageFilter(tempImg);
            
            // Style the canvas to match the image
            canvas.style.position = "absolute";
            canvas.style.top = "0";
            canvas.style.left = "0";
            canvas.style.width = "100%";
            canvas.style.height = "100%";
            canvas.style.objectFit = "cover";
            
            // Clear previous canvas and append new one
            if (canvasRef.current) {
              canvasRef.current.innerHTML = '';
              canvasRef.current.appendChild(canvas);
            }
          };
        }, 100);
      }
    };

    if (imgRef.current) {
      const imgElement = imgRef.current.querySelector('img');
      if (imgElement) {
        if (imgElement.complete) {
          handleImageLoad();
        } else {
          imgElement.addEventListener('load', handleImageLoad);
        }
      }
    }

    return () => {
      if (imgRef.current) {
        const imgElement = imgRef.current.querySelector('img');
        if (imgElement) {
          imgElement.removeEventListener('load', handleImageLoad);
        }
      }
    };
  }, [src, isY2KTheme]);

  return (
    <div className="relative w-full h-full">
      <div ref={imgRef} className={isY2KTheme ? "opacity-0" : ""}>
        <Image
          src={src}
          alt={alt}
          fill={fill}
          sizes={sizes}
          className={className}
          width={width}
          height={height}
        />
      </div>
      {isY2KTheme && <div ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />}
    </div>
  );
}