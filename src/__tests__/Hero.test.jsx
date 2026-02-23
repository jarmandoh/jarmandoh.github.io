import React from 'react';
import { render, screen } from '@testing-library/react';
import Hero from '../components/Hero';

describe('Hero', () => {
  it('renderiza el título principal y los botones de acción', () => {
    render(<Hero />);
    expect(screen.getByRole('banner', { name: /sección principal/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/janier hernandez/i);
    expect(screen.getByRole('link', { name: /ver proyectos/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ir a contacto|hablemos/i })).toBeInTheDocument();
  });

  it('permite activar los enlaces con teclado (Enter y Espacio)', () => {
    render(<Hero />);
    const proyectos = screen.getByRole('link', { name: /ver proyectos/i });
    const contacto = screen.getByRole('link', { name: /ir a contacto|hablemos/i });
    proyectos.focus();
    expect(proyectos).toHaveFocus();
    contacto.focus();
    expect(contacto).toHaveFocus();
    // Simula Enter y Espacio
    proyectos.onclick = jest.fn();
    contacto.onclick = jest.fn();
    proyectos.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    proyectos.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    contacto.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    contacto.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    // No error, eventos disparados
    expect(proyectos.onclick).toHaveBeenCalledTimes(2);
    expect(contacto.onclick).toHaveBeenCalledTimes(2);
  });
});
