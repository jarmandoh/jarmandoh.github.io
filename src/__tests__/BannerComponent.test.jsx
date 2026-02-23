import { render, screen } from '@testing-library/react';
import React from 'react';
import BannerComponent from '../components/BannerComponent';

describe('BannerComponent', () => {
  it('renderiza el heading y la imagen con alt descriptivo', () => {
    render(<BannerComponent />);
    expect(screen.getByRole('region', { name: /banner principal/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/bienvenido/i);
    expect(screen.getByAltText(/paisaje natural/i)).toBeInTheDocument();
  });
});
