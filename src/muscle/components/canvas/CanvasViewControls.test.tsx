// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import CanvasViewControls from './CanvasViewControls';
import { useMuscleStore } from '../../store/useMuscleStore';

describe('CanvasViewControls Animate Button', () => {
  beforeEach(() => {
    useMuscleStore.setState({
      isSkeletonAnimating: false,
      focusedNodeId: null,
    });
  });

  it('renders Animate button initially in stopped state', () => {
    render(<CanvasViewControls />);
    const btn = screen.getByTestId('muscle-animate-btn');
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent('Animate');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(btn.className).not.toContain('is-active');
  });

  it('toggles skeleton animation on and off when clicked', () => {
    render(<CanvasViewControls />);
    const btn = screen.getByTestId('muscle-animate-btn');

    // Click to start animating
    fireEvent.click(btn);
    expect(useMuscleStore.getState().isSkeletonAnimating).toBe(true);
    expect(btn).toHaveTextContent('Pause');
    expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(btn.className).toContain('is-active');

    // Click to pause
    fireEvent.click(btn);
    expect(useMuscleStore.getState().isSkeletonAnimating).toBe(false);
    expect(btn).toHaveTextContent('Animate');
    expect(btn).toHaveAttribute('aria-pressed', 'false');
    expect(btn.className).not.toContain('is-active');
  });

  it('renders Reset Pose button and resets skeleton pose state on click', () => {
    useMuscleStore.setState({
      isSkeletonAnimating: true,
      skeletonPoseResetCount: 0,
    });

    render(<CanvasViewControls />);
    const resetBtn = screen.getByTestId('muscle-reset-pose-btn');
    expect(resetBtn).toBeInTheDocument();
    expect(resetBtn).toHaveAttribute('title', 'Reset skeleton pose to resting position');

    fireEvent.click(resetBtn);
    expect(useMuscleStore.getState().isSkeletonAnimating).toBe(false);
    expect(useMuscleStore.getState().skeletonPoseResetCount).toBe(1);
  });
});
