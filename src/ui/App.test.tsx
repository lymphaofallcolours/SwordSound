import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { App } from './App';

describe('App', () => {
  it('renders the application title', () => {
    render(<App />);
    expect(screen.getByText('SwordSound')).toBeInTheDocument();
  });

  it('renders the subtitle', () => {
    render(<App />);
    expect(screen.getByText('Soundboard for tabletop RPG Game Masters')).toBeInTheDocument();
  });
});
