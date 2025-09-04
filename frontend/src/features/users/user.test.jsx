import { render, screen } from '@testing-library/react';
import UserProfile from './User';

describe('User Component', () => {

  test('Muestra mensaje si no hay usuario', () => {
    render(<UserProfile />);
    expect(screen.getByText('No hay usuario')).toBeInTheDocument();
  });

  test('Renderiza correctamente el nombre, apellido y materias', () => {
    const UserPrueba = {
      name: 'Diego',
      last_name: 'Rubio',
      subjects: ['Matemáticas', 'Física']
    };

    render(<UserProfile user={UserPrueba} />);

    expect(screen.getByText('Diego Rubio')).toBeInTheDocument();
    expect(screen.getByText('Materias: Matemáticas, Física')).toBeInTheDocument();
  });

});