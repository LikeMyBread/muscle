// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AttributionModal from './AttributionModal';

describe('AttributionModal', () => {
  it('does not render when isOpen is false', () => {
    const onClose = vi.fn();
    render(<AttributionModal isOpen={false} onClose={onClose} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders Z-Anatomy citation and license links when open', () => {
    const onClose = vi.fn();
    render(<AttributionModal isOpen={true} onClose={onClose} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Attribution & Licenses')).toBeInTheDocument();

    // Check Z-Anatomy repository link
    const zAnatomyLink = screen.getByRole('link', {
      name: /Z-Anatomy \(Models of human anatomy\)/i,
    });
    expect(zAnatomyLink).toHaveAttribute(
      'href',
      'https://github.com/Z-Anatomy/Models-of-human-anatomy',
    );

    // Check CC BY-SA 4.0 license link
    const ccLink = screen.getByRole('link', {
      name: /Creative Commons Attribution-ShareAlike 4.0 International/i,
    });
    expect(ccLink).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/4.0/');

    // Check authors credit
    expect(screen.getByText(/Gauthier Kervyn/i)).toBeInTheDocument();
    expect(screen.getByText(/Marcin Zielinski/i)).toBeInTheDocument();

    // Check upstream BodyParts3D and Wikipedia
    expect(screen.getByText(/BodyParts3D/i)).toBeInTheDocument();
    expect(screen.getByText(/Wikipedia Contributors/i)).toBeInTheDocument();
  });

  it('calls onClose when close button or Got it button is clicked', () => {
    const onClose = vi.fn();
    render(<AttributionModal isOpen={true} onClose={onClose} />);

    fireEvent.click(screen.getByText('Got it'));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('Close attribution dialog'));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('closes on Escape key press', () => {
    const onClose = vi.fn();
    render(<AttributionModal isOpen={true} onClose={onClose} />);

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
