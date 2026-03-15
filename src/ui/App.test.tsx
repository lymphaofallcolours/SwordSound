import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('renders the welcome screen when no session is loaded', () => {
    render(<App />);
    expect(screen.getByText('SwordSound')).toBeInTheDocument();
    expect(screen.getByText('Tactical soundboard for tabletop RPGs')).toBeInTheDocument();
  });

  it('shows new session button on welcome screen', () => {
    render(<App />);
    expect(screen.getByText('New Session')).toBeInTheDocument();
  });

  it('shows import session button on welcome screen', () => {
    render(<App />);
    expect(screen.getByText('Import Session')).toBeInTheDocument();
  });
});
