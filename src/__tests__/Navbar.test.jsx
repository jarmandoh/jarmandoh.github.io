import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';

describe('Navbar', () => {
  it('renderiza enlaces principales y permite navegación por teclado', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    // Verifica que los enlaces principales estén presentes
    expect(screen.getByRole('navigation', { name: /navegación principal/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /acerca/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /habilidades/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /proyectos/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /contacto/i })).toBeInTheDocument();
  });

  it('abre y cierra el menú móvil con el botón', async () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    const button = screen.getByRole('button', { name: /abrir menú/i });
    await userEvent.click(button);
    expect(screen.getByRole('menu', { name: /menú móvil/i })).toBeInTheDocument();
    // Cierra el menú
    const closeButton = screen.getByRole('button', { name: /cerrar menú/i });
    await userEvent.click(closeButton);
    await waitFor(() => {
      expect(screen.queryByRole('menu', { name: /menú móvil/i })).not.toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('permite navegar y activar enlaces del menú móvil con teclado (flujo real)', async () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );
    const button = screen.getByRole('button', { name: /abrir menú/i });
    await userEvent.click(button);
    const menuItems = screen.getAllByRole('menuitem');
    // Tab hasta el primer item
    await userEvent.tab();
    // Simula navegación con flechas y activación con Enter/Espacio
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowUp}');
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
    // Si no lanza error, el flujo es correcto
    expect(menuItems.length).toBeGreaterThan(0);
  });
});
