import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PlayerLogin from '../Fichas/components/PlayerLogin/PlayerLogin';

describe('PlayerLogin (Fichas)', () => {
  it('muestra error si el nombre está vacío', () => {
    render(<PlayerLogin onLogin={jest.fn()} />);
    fireEvent.click(screen.getByText(/Entrar al Juego/i));
    expect(screen.getByText(/Por favor ingresa un nombre de usuario/i)).toBeInTheDocument();
  });

  it('muestra error si el nombre es muy corto', () => {
    render(<PlayerLogin onLogin={jest.fn()} />);
    fireEvent.change(screen.getByLabelText(/Nombre de Usuario/i), { target: { value: 'ab' } });
    fireEvent.click(screen.getByText(/Entrar al Juego/i));
    expect(screen.getByText(/al menos 3 caracteres/i)).toBeInTheDocument();
  });

  it('llama a onLogin si el nombre es válido', () => {
    const onLogin = jest.fn();
    render(<PlayerLogin onLogin={onLogin} />);
    fireEvent.change(screen.getByLabelText(/Nombre de Usuario/i), { target: { value: 'Jugador123' } });
    fireEvent.click(screen.getByText(/Entrar al Juego/i));
    expect(onLogin).toHaveBeenCalledWith('Jugador123');
  });
});
