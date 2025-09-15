/** @jest-environment jsdom */

// Polyfill
const { TextEncoder, TextDecoder } = require('util');
if (!global.TextEncoder) global.TextEncoder = TextEncoder;
if (!global.TextDecoder) global.TextDecoder = TextDecoder;

const { render, screen, fireEvent, waitFor } = require('@testing-library/react');

// Mock de useUser
const mockSignIn = jest.fn();
jest.mock('../user', () => ({
  useUser: () => ({ signIn: mockSignIn }),
}));

// Mock de react-router-dom (solo useNavigate)
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Mock de assets
jest.mock('@/assets/logo.png', () => 'logo-mock', { virtual: true });

// Import del componente después de los mocks
const SignInPage = require('../pages/SignInPage').default;

describe('SignInPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignIn.mockReset();
    mockNavigate.mockReset();
  });

  it('signs in successfully and navigates to home', async () => {
    mockSignIn.mockResolvedValueOnce();

    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText(/^Email$/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: '123456' } });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    await waitFor(() =>
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', '123456')
    );

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('shows default error when signIn fails without message', async () => {
    mockSignIn.mockRejectedValueOnce({});

    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText(/^Email$/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'wrong' } });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    expect(await screen.findByText(/Usuario y\/o contraseña inválidos/i)).toBeInTheDocument();
  });

  it('shows API error message when signIn fails with message', async () => {
    mockSignIn.mockRejectedValueOnce({ data: { status: { message: 'Cuenta bloqueada' } } });

    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText(/^Email$/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'wrong' } });

    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

    expect(await screen.findByText(/Cuenta bloqueada/i)).toBeInTheDocument();
  });
});

