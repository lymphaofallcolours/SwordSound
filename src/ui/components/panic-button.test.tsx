import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import { PanicButton } from './panic-button';

describe('PanicButton', () => {
  it('renders with PANIC text', () => {
    render(<PanicButton onPanic={() => {}} />);
    expect(screen.getByText('PANIC')).toBeInTheDocument();
  });

  it('calls onPanic when clicked', () => {
    const onPanic = vi.fn();
    render(<PanicButton onPanic={onPanic} />);

    fireEvent.click(screen.getByText('PANIC'));
    expect(onPanic).toHaveBeenCalledOnce();
  });
});
