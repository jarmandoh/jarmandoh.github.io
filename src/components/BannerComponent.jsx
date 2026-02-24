import React from 'react';
import BannerComponentPresentational from './BannerComponentPresentational';

export default function BannerComponent() {
  // Aquí podría ir lógica, hooks, datos, etc.
  const title = 'Bienvenido a mi portafolio';
  const imageUrl = 'https://play-lh.googleusercontent.com/52py3YEUuxRdgmA5QHct3RaR5GHejI0mWiBuFY-BTdyMENWVtr77MArJFe-Gzd4spw';
  const imageAlt = 'Paisaje natural con árboles y cielo azul';

  return (
    <BannerComponentPresentational
      title={title}
      imageUrl={imageUrl}
      imageAlt={imageAlt}
    />
  );
}

