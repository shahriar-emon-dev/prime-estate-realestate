'use client';

import { useState } from 'react';
import Image from 'next/image';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PropertyImageGalleryProps {
  images: string[];
  propertyTitle: string;
}

export default function PropertyImageGallery({ images, propertyTitle }: PropertyImageGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const mainImage = images[selectedImageIndex];

  const handlePrevious = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="sticky top-20 space-y-6">
      {/* Main Image with Navigation */}
      <div className="relative w-full h-[600px] bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl overflow-hidden shadow-2xl group">
        <Image
          src={mainImage}
          alt={propertyTitle}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://placehold.co/800x600/e2e8f0/64748b?text=Property+Image';
          }}
        />
        
        {/* Image Counter Badge */}
        <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-sm text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-lg">
          {selectedImageIndex + 1} / {images.length}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevious}
          className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
          aria-label="Previous image"
        >
          <FaChevronLeft size={20} />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-900 p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-10"
          aria-label="Next image"
        >
          <FaChevronRight size={20} />
        </button>
      </div>

      {/* Thumbnail Images */}
      <div className="grid grid-cols-4 gap-3 md:gap-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImageIndex(index)}
            className={`relative h-28 md:h-32 rounded-xl overflow-hidden transition-all duration-300 ${
              selectedImageIndex === index
                ? 'ring-3 ring-blue-600 ring-offset-2 shadow-lg scale-105'
                : 'shadow-md hover:shadow-xl hover:scale-102'
            }`}
          >
            <Image
              src={image}
              alt={`${propertyTitle} thumbnail ${index + 1}`}
              fill
              className="object-cover hover:scale-110 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://placehold.co/150x150/e2e8f0/64748b?text=Photo';
              }}
            />
            {selectedImageIndex === index && (
              <div className="absolute inset-0 bg-blue-600/20"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
