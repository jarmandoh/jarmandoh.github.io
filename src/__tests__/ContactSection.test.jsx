import { render, screen, act } from '@testing-library/react';
import React from 'react';
import ContactSection from '../components/ContactSection';

describe('ContactSection', () => {
  it('renderiza el formulario y los campos requeridos', () => {
    render(<ContactSection />);
    expect(screen.getByRole('region', { name: /¿listo para colaborar/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /¿listo para colaborar/i })).toBeInTheDocument();
    expect(screen.getByRole('form', { name: /formulario de contacto/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^mensaje/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /enviar mensaje de contacto/i })).toBeInTheDocument();
  });

  it('permite escribir y enviar el formulario mostrando alerta', () => {
    window.alert = jest.fn();
    render(<ContactSection />);
    const nombre = screen.getByLabelText(/nombre/i);
    const email = screen.getByLabelText(/email/i);
    const mensaje = screen.getByLabelText(/^mensaje/i);
    const boton = screen.getByRole('button', { name: /enviar mensaje de contacto/i });
    // Simula escritura y envío dentro de act
    act(() => {
      nombre.value = 'Juan';
      email.value = 'juan@email.com';
      mensaje.value = 'Hola';
      nombre.dispatchEvent(new Event('input', { bubbles: true }));
      email.dispatchEvent(new Event('input', { bubbles: true }));
      mensaje.dispatchEvent(new Event('input', { bubbles: true }));
      boton.click();
    });
    expect(window.alert).toHaveBeenCalledWith(expect.stringMatching(/mensaje enviado/i));
  });
});
