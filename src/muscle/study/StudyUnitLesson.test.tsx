// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StudyUnitLesson from './StudyUnitLesson';
import { getUnitById } from './studyCurriculum';
import { useMuscleStore } from '../store/useMuscleStore';

// Mock TrainingCanvas so Three.js canvas doesn't try to instantiate in jsdom
vi.mock('../components/canvas/TrainingCanvas', () => ({
  default: () => <div data-testid="mock-training-canvas">3D Canvas Mock</div>,
}));

describe('StudyUnitLesson', () => {
  beforeEach(() => {
    useMuscleStore.setState({
      activeModuleId: 'fundamentals',
      studyActive: false,
      studyTargetNodeId: null,
    });
  });

  it('renders text unit lesson with definition and upcoming quiz preview', () => {
    const unit = getUnitById('unit_terms_planes')!;
    const onNext = vi.fn();
    const onPrev = vi.fn();
    const onStartQuiz = vi.fn();
    const onSkipToQuiz = vi.fn();

    render(
      <StudyUnitLesson
        unit={unit}
        lessonIndex={0}
        onNext={onNext}
        onPrev={onPrev}
        onStartQuiz={onStartQuiz}
        onSkipToQuiz={onSkipToQuiz}
      />,
    );

    expect(screen.getByTestId('muscle-study-lesson')).toBeInTheDocument();
    expect(screen.getByText(/LESSON 1 OF 5/i)).toBeInTheDocument();
    expect(screen.getAllByText('Anatomical position').length).toBeGreaterThan(0);
    expect(screen.getByText(/Upcoming Quiz Question Preview/i)).toBeInTheDocument();

    // Previous is disabled on first slide
    const prevBtn = screen.getByText('← Previous');
    expect(prevBtn).toBeDisabled();

    // Next is clickable
    const nextBtn = screen.getByText('Next Lesson →');
    fireEvent.click(nextBtn);
    expect(onNext).toHaveBeenCalledTimes(1);

    // Skip to quiz is clickable
    const skipBtn = screen.getByText('Skip to Quiz →');
    fireEvent.click(skipBtn);
    expect(onSkipToQuiz).toHaveBeenCalledTimes(1);
  });

  it('renders start quiz button on final lesson slide', () => {
    const unit = getUnitById('unit_terms_planes')!;
    const onNext = vi.fn();
    const onPrev = vi.fn();
    const onStartQuiz = vi.fn();
    const onSkipToQuiz = vi.fn();

    render(
      <StudyUnitLesson
        unit={unit}
        lessonIndex={unit.itemIds.length - 1}
        onNext={onNext}
        onPrev={onPrev}
        onStartQuiz={onStartQuiz}
        onSkipToQuiz={onSkipToQuiz}
      />,
    );

    const startQuizBtn = screen.getByText(/Start Practice Quiz/i);
    expect(startQuizBtn).toBeInTheDocument();
    fireEvent.click(startQuizBtn);
    expect(onStartQuiz).toHaveBeenCalledTimes(1);
  });

  it('renders 3D unit lesson with structure facts and mock canvas', async () => {
    const unit = getUnitById('unit_fund_head_torso')!;
    const onNext = vi.fn();
    const onPrev = vi.fn();
    const onStartQuiz = vi.fn();
    const onSkipToQuiz = vi.fn();

    render(
      <StudyUnitLesson
        unit={unit}
        lessonIndex={0}
        onNext={onNext}
        onPrev={onPrev}
        onStartQuiz={onStartQuiz}
        onSkipToQuiz={onSkipToQuiz}
      />,
    );

    const canvas = await screen.findByTestId('mock-training-canvas');
    expect(canvas).toBeInTheDocument();
    expect(screen.getAllByText('Skull').length).toBeGreaterThan(0);
    expect(screen.getByText(/3D LANDMARK PREVIEW/i)).toBeInTheDocument();
    expect(screen.getByText(/The cranial egg sets portrait proportion/i)).toBeInTheDocument();

    // Canvas focus state is synchronized
    expect(useMuscleStore.getState().studyActive).toBe(true);
    expect(useMuscleStore.getState().studyTargetNodeId).toBe('bone_skull');
  });
});
