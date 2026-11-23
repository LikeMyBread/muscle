// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import StructureInfoBox from './StructureInfoBox';
import { useMuscleStore } from '../store/useMuscleStore';

describe('StructureInfoBox Component', () => {
  beforeEach(() => {
    useMuscleStore.setState({
      focusedNodeId: null,
      selectedNodeId: null,
    });
  });

  it('renders nothing when no structure is focused or selected', () => {
    const { container } = render(<StructureInfoBox />);
    expect(container.firstChild).toBeNull();
  });

  it('renders title, Latin name, Wikipedia blurb, and link when a structure is focused', () => {
    useMuscleStore.setState({ focusedNodeId: 'muscle_biceps_brachii' });
    render(<StructureInfoBox />);

    expect(screen.getByTestId('muscle-structure-infobox')).toBeInTheDocument();
    expect(screen.getByTestId('infobox-title')).toHaveTextContent('Biceps brachii');
    expect(screen.getByTestId('infobox-blurb')).toBeInTheDocument();
    expect(screen.getByTestId('infobox-blurb').textContent?.length).toBeGreaterThan(10);
    expect(screen.getByTestId('infobox-wiki-link')).toHaveAttribute(
      'href',
      expect.stringContaining('wikipedia.org'),
    );
  });

  it('clears both focusedNodeId and selectedNodeId, closes the box, and preserves camera when close button is clicked', () => {
    const initialResetNonce = useMuscleStore.getState().cameraResetNonce;
    useMuscleStore.getState().focusStructure('muscle_biceps_brachii');
    expect(useMuscleStore.getState().focusedNodeId).toBe('muscle_biceps_brachii');
    expect(useMuscleStore.getState().selectedNodeId).toBe('muscle_biceps_brachii');

    const { rerender } = render(<StructureInfoBox />);
    expect(screen.getByTestId('muscle-structure-infobox')).toBeInTheDocument();

    const closeBtn = screen.getByTestId('infobox-close-btn');
    fireEvent.click(closeBtn);

    expect(useMuscleStore.getState().focusedNodeId).toBeNull();
    expect(useMuscleStore.getState().selectedNodeId).toBeNull();
    // Camera should NOT be reset on dismissing the infobox
    expect(useMuscleStore.getState().cameraResetNonce).toBe(initialResetNonce);

    rerender(<StructureInfoBox />);
    expect(screen.queryByTestId('muscle-structure-infobox')).toBeNull();
    expect(document.documentElement.style.getPropertyValue('--muscle-infobox-height')).toBe('0px');
  });
});
