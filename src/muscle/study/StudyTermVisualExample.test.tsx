// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StudyTermVisualExample from './StudyTermVisualExample';
import { getAnatomyTermById } from '../curriculum/anatomyTerms';
import { useMuscleStore } from '../store/useMuscleStore';

// Mock TrainingCanvas so Three.js webgl canvas doesn't try to instantiate in jsdom
vi.mock('../components/canvas/TrainingCanvas', () => ({
  default: () => <div data-testid="mock-training-canvas">3D Canvas Mock</div>,
}));

describe('StudyTermVisualExample', () => {
  beforeEach(() => {
    useMuscleStore.setState({
      activeTermId: null,
      focusedNodeId: null,
      focusedGroupNodeIds: null,
    });
  });

  it('renders visual example for target term when answered correctly', () => {
    const sagittal = getAnatomyTermById('term_plane_sagittal')!;
    render(<StudyTermVisualExample targetTerm={sagittal} isCorrect={true} />);

    expect(screen.getByTestId('muscle-study-visual-example')).toBeInTheDocument();
    expect(screen.getAllByText('Sagittal plane').length).toBeGreaterThan(0);
    expect(
      screen.getByText('Vertical plane that splits the body into left and right halves.'),
    ).toBeInTheDocument();

    // No comparison tabs when correct
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();

    // Synchronizes with muscle store
    expect(useMuscleStore.getState().activeTermId).toBe('term_plane_sagittal');
  });

  it('renders comparison tabs and allows toggling when answered incorrectly', () => {
    const sagittal = getAnatomyTermById('term_plane_sagittal')!;
    const coronal = getAnatomyTermById('term_plane_coronal')!;

    render(
      <StudyTermVisualExample
        targetTerm={sagittal}
        mistakeTerm={coronal}
        isCorrect={false}
      />,
    );

    // Tablist is displayed
    expect(screen.getByRole('tablist')).toBeInTheDocument();
    expect(screen.getByText('✓ Correct')).toBeInTheDocument();
    expect(screen.getByText('✗ Your choice')).toBeInTheDocument();

    // Default active is target
    expect(useMuscleStore.getState().activeTermId).toBe('term_plane_sagittal');

    // Click mistake tab
    fireEvent.click(screen.getByText('✗ Your choice'));

    // Should switch to coronal plane
    expect(useMuscleStore.getState().activeTermId).toBe('term_plane_coronal');
    expect(
      screen.getByText('Vertical plane that splits the body into front (anterior) and back (posterior).'),
    ).toBeInTheDocument();
  });

  it('renders matching structure chips on the model for terms with highlight nodes', () => {
    const anterior = getAnatomyTermById('term_anterior')!;
    render(<StudyTermVisualExample targetTerm={anterior} isCorrect={true} />);

    // Sternum is the example structure for anterior
    expect(screen.getByText('Sternum')).toBeInTheDocument();
    expect(screen.getByText(/On the 3D model/i)).toBeInTheDocument();

    // Clicking the chip focuses the structure
    fireEvent.click(screen.getByText('Sternum'));
    expect(useMuscleStore.getState().focusedNodeId).toBe('bone_sternum');
  });
});
