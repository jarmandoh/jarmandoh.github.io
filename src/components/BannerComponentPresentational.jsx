import React from 'react';
import ImageComponent from './ImageComponent';

export default function BannerComponentPresentational({ title, imageUrl, imageAlt }) {
  return (
    <section aria-label="Banner principal" className="banner-section">
      <h1 className="text-4xl font-bold mb-4" tabIndex={0}>{title}</h1>
      asd
      <ImageComponent 
        url={imageUrl}
        alt={imageAlt}
        className="banner-image"
      />
    </section>
  );
}
