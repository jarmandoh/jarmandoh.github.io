import { render, screen } from '@testing-library/react';
import React from 'react';
import Footer from '../components/Footer';

describe('Footer', () => {
  it('muestra el año actual y el texto de autor', () => {
    render(<Footer />);
    const year = new Date().getFullYear();
    expect(screen.getByRole('contentinfo', { name: /pie de página/i })).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${year}`))).toBeInTheDocument();
    expect(screen.getByText(/janier hernandez/i)).toBeInTheDocument();
  });
});
