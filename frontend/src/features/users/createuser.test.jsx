import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateUserForm from './createuser';

beforeEach(() => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ message: "Usuario creado" }),
    })
  );
});

describe('Integración Frontend-Backend', () => {
  test('Crea un usuario real en el backend', async () => {
    render(<CreateUserForm />);

    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'Diego' } });
    fireEvent.change(screen.getByPlaceholderText('Apellido'), { target: { value: 'Pérez' } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'testusuario@correo.com' } });
    fireEvent.change(screen.getByPlaceholderText('Contraseña'), { target: { value: '12345678' } });

    fireEvent.click(screen.getByText('Crear Usuario'));

    // Esperamos a que aparezca el mensaje de éxito
    const successMessage = await waitFor(() => screen.getByText('Usuario creado'));
    expect(successMessage).toBeInTheDocument();
  });
});