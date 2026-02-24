import React from 'react';
import FooterPresentational from './FooterPresentational';

export default function Footer() {
  const year = new Date().getFullYear();
  return <FooterPresentational year={year} />;
}
