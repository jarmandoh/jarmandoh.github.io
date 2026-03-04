import React from 'react';

const ImageComponent = ({ url, alt, className }) => {
  return (
    <img 
      src={url}
      alt={alt || ''} 
      className={className}
      loading="lazy"
      decoding="async"
      style={{ maxWidth: '100%', height: 'auto' }}
    />
  )
}


export default ImageComponent