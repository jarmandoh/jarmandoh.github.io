import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminLogin from '../components/AdminLogin/AdminLogin';

const setup = (onLogin = jest.fn().mockResolvedValue(false)) =>
  render(
    <MemoryRouter>
      <AdminLogin onLogin={onLogin} />
    </MemoryRouter>
  );

describe('AdminLogin (Bingo)', () => {
  it('renderiza el campo de contraseña y el botón Acceder', () => {
    setup();
    expect(screen.getByLabelText(/contraseña de administrador/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /acceder/i })).toBeInTheDocument();
  });

  it('el botón está deshabilitado cuando el campo está vacío', () => {
    setup();
    expect(screen.getByRole('button', { name: /acceder/i })).toBeDisabled();
  });

  it('el botón se habilita al introducir una contraseña', async () => {
    setup();
    await userEvent.type(
      screen.getByLabelText(/contraseña de administrador/i),
      'secret123'
    );
    expect(screen.getByRole('button', { name: /acceder/i })).toBeEnabled();
  });

  it('llama a onLogin con la contraseña introducida', async () => {
    const onLogin = jest.fn().mockResolvedValue(true);
    setup(onLogin);
    await userEvent.type(
      screen.getByLabelText(/contraseña de administrador/i),
      'miClave'
    );
    await userEvent.click(screen.getByRole('button', { name: /acceder/i }));
    await waitFor(() => expect(onLogin).toHaveBeenCalledWith('miClave'));
  });

  it('muestra mensaje de error cuando el login falla', async () => {
    const onLogin = jest.fn().mockResolvedValue(false);
    setup(onLogin);
    await userEvent.type(
      screen.getByLabelText(/contraseña de administrador/i),
      'clave_incorrecta'
    );
    await userEvent.click(screen.getByRole('button', { name: /acceder/i }));
    await waitFor(() =>
      expect(screen.getByText(/contraseña incorrecta/i)).toBeInTheDocument()
    );
  });

  it('no muestra error de contraseña incorrecta cuando el login es exitoso', async () => {
    const onLogin = jest.fn().mockResolvedValue(true);
    setup(onLogin);
    await userEvent.type(
      screen.getByLabelText(/contraseña de administrador/i),
      'claveCorrecta'
    );
    await userEvent.click(screen.getByRole('button', { name: /acceder/i }));
    await waitFor(() => expect(onLogin).toHaveBeenCalled());
    expect(screen.queryByText(/contraseña incorrecta/i)).not.toBeInTheDocument();
  });

  it('muestra/oculta la contraseña al pulsar el botón de visibilidad', async () => {
    setup();
    const input = screen.getByLabelText(/contraseña de administrador/i);
    expect(input).toHaveAttribute('type', 'password');
    // El botón de toggle es el único button de tipo "button" visible cuando no hay texto
    const toggleBtn = screen.getByRole('button', { name: '' });
    await userEvent.click(toggleBtn);
    expect(input).toHaveAttribute('type', 'text');
    await userEvent.click(toggleBtn);
    expect(input).toHaveAttribute('type', 'password');
  });
});
