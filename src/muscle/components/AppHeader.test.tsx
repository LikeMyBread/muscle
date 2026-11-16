// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import AppHeader from './AppHeader';
import { useStudyStore } from '../study/useStudyStore';
import { useMuscleStore } from '../store/useMuscleStore';

describe('AppHeader Mode Tabs', () => {
  beforeEach(() => {
    useStudyStore.setState({ appMode: 'study' });
    useMuscleStore.setState({ studyActive: true });
  });

  it('renders Study, Reference, and Pose mode tabs', () => {
    render(<AppHeader />);
    expect(screen.getByRole('tab', { name: /Study/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Reference/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Pose/i })).toBeInTheDocument();
  });

  it('switches to Pose mode when Pose tab is clicked', () => {
    render(<AppHeader />);
    const poseTab = screen.getByRole('tab', { name: /Pose/i });
    expect(poseTab).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(poseTab);

    expect(useStudyStore.getState().appMode).toBe('pose');
    expect(useMuscleStore.getState().studyActive).toBe(false);
    expect(poseTab).toHaveAttribute('aria-selected', 'true');
    expect(poseTab.className).toContain('is-active');
  });

  it('switches back to Reference mode from Pose mode', () => {
    useStudyStore.setState({ appMode: 'pose' });
    render(<AppHeader />);

    const refTab = screen.getByRole('tab', { name: /Reference/i });
    const poseTab = screen.getByRole('tab', { name: /Pose/i });

    expect(poseTab).toHaveAttribute('aria-selected', 'true');
    expect(refTab).toHaveAttribute('aria-selected', 'false');

    fireEvent.click(refTab);

    expect(useStudyStore.getState().appMode).toBe('reference');
    expect(refTab).toHaveAttribute('aria-selected', 'true');
    expect(poseTab).toHaveAttribute('aria-selected', 'false');
  });
});
