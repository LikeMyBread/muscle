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

  it('renders visual example viewport without redundant details box when answered correctly', () => {
    const sagittal = getAnatomyTermById('term_plane_sagittal')!;
    const { container } = render(<StudyTermVisualExample targetTerm={sagittal} isCorrect={true} />);

    expect(screen.getByTestId('muscle-study-visual-example')).toBeInTheDocument();
    expect(screen.getAllByText('Sagittal plane').length).toBeGreaterThan(0);

    // Redundant details box and chip controls are omitted
    expect(container.querySelector('.muscle-study-visual-details')).toBeNull();
    expect(screen.queryByText(/Cardinal planes:/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText('Vertical plane that splits the body into left and right halves.'),
    ).not.toBeInTheDocument();

    // No comparison tabs when correct
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();

    // Synchronizes with muscle store
    expect(useMuscleStore.getState().activeTermId).toBe('term_plane_sagittal');
  });

  it('renders comparison tabs and allows toggling when answered incorrectly', () => {
    const sagittal = getAnatomyTermById('term_plane_sagittal')!;
    const coronal = getAnatomyTermById('term_plane_coronal')!;

    const { container } = render(
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
    expect(container.querySelector('.muscle-study-visual-badge__name')).toHaveTextContent(
      'Sagittal plane',
    );

    // Click mistake tab
    fireEvent.click(screen.getByText('✗ Your choice'));

    // Should switch to coronal plane
    expect(useMuscleStore.getState().activeTermId).toBe('term_plane_coronal');
    expect(container.querySelector('.muscle-study-visual-badge__name')).toHaveTextContent(
      'Coronal plane',
    );
  });

  it('automatically focuses matching model structures without rendering highlight chip controls', () => {
    const anterior = getAnatomyTermById('term_anterior')!;
    const { container } = render(<StudyTermVisualExample targetTerm={anterior} isCorrect={true} />);

    expect(screen.queryByText(/On the 3D model/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Sternum')).not.toBeInTheDocument();
    expect(container.querySelector('.muscle-study-visual-chip')).toBeNull();

    // Automatically focuses the example structure in the store
    expect(useMuscleStore.getState().focusedNodeId).toBe('bone_sternum');
  });
});
