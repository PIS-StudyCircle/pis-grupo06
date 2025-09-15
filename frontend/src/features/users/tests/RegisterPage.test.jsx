/** @jest-environment jsdom */

// Polyfill
const { TextEncoder, TextDecoder } = require('util');
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;

const { render, screen, fireEvent, waitFor } = require('@testing-library/react');

// Mocks
const mockSignup = jest.fn();
jest.mock('../user', () => ({ useUser: () => ({ signup: mockSignup }) }));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));

jest.mock('@/assets/logo.png', () => 'logo-mock', { virtual: true });

// Cargar componente
const RegisterPage = require('../pages/RegisterPage').default;

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignup.mockReset();
    mockNavigate.mockReset();
  });

  it('renders all inputs and submits form', async () => {
    mockSignup.mockResolvedValueOnce();

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/^Name$/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Lastname/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@doe.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/Password confirmation/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test user' } });

    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    await waitFor(() =>
      expect(mockSignup).toHaveBeenCalledWith({
        name: 'John',
        last_name: 'Doe',
        email: 'john@doe.com',
        password: '123456',
        password_confirmation: '123456',
        description: 'Test user',
      })
    );
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows error when signup fails', async () => {
    mockSignup.mockRejectedValueOnce({ data: { errors: ['Email already exists'] } });

    render(<RegisterPage />);

    fireEvent.change(screen.getByLabelText(/^Name$/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Lastname/i), { target: { value: 'Doe' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@doe.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/Password confirmation/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test user' } });

    fireEvent.click(screen.getByRole('button', { name: /Sign Up/i }));

    expect(await screen.findByText(/Email already exists/i)).toBeInTheDocument();
  });
});
