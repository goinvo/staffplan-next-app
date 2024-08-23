'use client';

import React, { useRef } from 'react';
import Image from 'next/image';

import { LuUpload } from 'react-icons/lu';

interface ImageUploaderProps {
    imageUrl: string;
    onImageChange: (imageUrl: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ imageUrl, onImageChange }) => {
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onImageChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="relative w-24 h-16 my-2 mr-2">
            <Image
                src={imageUrl}
                fill
                sizes="(max-width: 640px) 80px, (max-width: 768px) 92px, 92px"
                className="rounded-md"
                alt="Avatar"
            />
            <button
                type="button"
                className="absolute inset-0 flex items-center justify-center rounded-md bg-white bg-opacity-70"
                onClick={handleClick}
            >
                <LuUpload className="w-8 h-16 text-black" />
            </button>
            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                className="hidden"
                onChange={handleFileChange}
            />
        </div>
    );
};

export default ImageUploader;