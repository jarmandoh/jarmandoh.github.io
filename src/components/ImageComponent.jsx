import React from 'react';

const ImageComponent = ({ url, alt, className }) => {
  return (
    <img 
      src={url}
      alt={alt || 'Imagen'} 
      className={className}
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  )
}


export default ImageComponent