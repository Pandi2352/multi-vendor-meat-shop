import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api-error';
import type { Session } from '../api/use-session';
import { RequireSession } from './require-session';

let session: Session;
vi.mock('../api/use-session', () => ({ useSession: () => session }));

const user = (overrides: Partial<Extract<Session, { status: 'authenticated' }>['user']> = {}) =>
  ({
    status: 'authenticated',
    user: { id: 'u1', email: 'a@b.in', name: 'A', role: 'ADMIN', status: 'ACTIVE', ...overrides },
  }) as Session;

function WhereAmI() {
  const location = useLocation();
  return <p data-testid="location">{location.pathname + location.search}</p>;
}

const renderAt = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/vendor/orders" element={<RequireSession><p>protected page</p></RequireSession>} />
        <Route path="*" element={<WhereAmI />} />
      </Routes>
    </MemoryRouter>,
  );

describe('RequireSession', () => {
  beforeEach(() => {
    session = { status: 'loading' };
  });

  it('sends signed-out visitors to sign-in, remembering the page', () => {
    session = { status: 'anonymous' };
    renderAt('/vendor/orders?tab=new');
    expect(screen.getByTestId('location')).toHaveTextContent('/login?next=%2Fvendor%2Forders%3Ftab%3Dnew');
  });

  it('adds the expired notice when the session could not be refreshed', () => {
    session = { status: 'expired' };
    renderAt('/vendor/orders');
    expect(screen.getByTestId('location')).toHaveTextContent('/login?reason=expired&next=%2Fvendor%2Forders');
  });

  it('shows a loader while checking', () => {
    renderAt('/vendor/orders');
    expect(screen.getByRole('status')).toHaveTextContent('Loading your portal');
  });

  it('renders the page for portal users', () => {
    session = user({ role: 'VENDOR_STAFF' });
    renderAt('/vendor/orders');
    expect(screen.getByText('protected page')).toBeInTheDocument();
  });

  it('turns customer accounts away', () => {
    session = user({ role: 'CUSTOMER' });
    renderAt('/vendor/orders');
    expect(screen.getByTestId('location')).toHaveTextContent('/access-denied');
  });

  it('sends suspended accounts to the suspended screen', () => {
    session = user({ status: 'SUSPENDED' });
    renderAt('/vendor/orders');
    expect(screen.getByTestId('location')).toHaveTextContent('/suspended');
  });

  it('treats an ACCOUNT_SUSPENDED error the same way', () => {
    session = { status: 'error', error: new ApiError(403, { code: 'ACCOUNT_SUSPENDED' }), retry: vi.fn() };
    renderAt('/vendor/orders');
    expect(screen.getByTestId('location')).toHaveTextContent('/suspended');
  });
});
