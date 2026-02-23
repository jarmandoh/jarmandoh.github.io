import React from 'react';
import ImageComponent from './ImageComponent'

export default function BannerComponent() {
  return (
    <section aria-label="Banner principal" className="banner-section">
      <h1 className="text-4xl font-bold mb-4" tabIndex={0}>Bienvenido a mi portafolio</h1>
      <ImageComponent 
        url="https://play-lh.googleusercontent.com/52py3YEUuxRdgmA5QHct3RaR5GHejI0mWiBuFY-BTdyMENWVtr77MArJFe-Gzd4spw"
        alt="Paisaje natural con árboles y cielo azul"
        className="banner-image"
      />
    </section>
  )
}

