// @vitest-environment jsdom
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, expect, it, beforeEach } from 'vitest';
import JointPoseSliders, { JOINT_POSE_CONFIGS } from './JointPoseSliders';
import { useMuscleStore, DEFAULT_SKELETON_JOINT_ANGLES } from '../../store/useMuscleStore';

describe('JointPoseSliders Component', () => {
  beforeEach(() => {
    useMuscleStore.setState({
      bodyView: 'full_body',
      isSkeletonAnimating: false,
      skeletonPoseResetCount: 0,
      skeletonJointAngles: { ...DEFAULT_SKELETON_JOINT_ANGLES },
    });
  });

  it('renders the Joint Pose Controls panel with all 5 joints', () => {
    render(<JointPoseSliders />);
    const panel = screen.getByTestId('joint-pose-sliders');
    expect(panel).toBeInTheDocument();

    for (const config of JOINT_POSE_CONFIGS) {
      const slider = screen.getByTestId(`joint-slider-${config.key}`);
      expect(slider).toBeInTheDocument();
      expect(screen.getByText(config.label)).toBeInTheDocument();
    }
  });

  it('arranges joints in an indented tree with correct hierarchy levels', () => {
    render(<JointPoseSliders />);

    const torsoItem = screen.getByTestId('joint-item-spineFlexion');
    const shoulderItem = screen.getByTestId('joint-item-shoulderAbduction');
    const elbowItem = screen.getByTestId('joint-item-elbowFlexion');
    const hipItem = screen.getByTestId('joint-item-hipFlexion');
    const kneeItem = screen.getByTestId('joint-item-kneeFlexion');

    // Hierarchy check:
    // Torso: indent 0
    //   Left Shoulder: indent 1
    //     Left Elbow: indent 2
    // Left Hip: indent 0
    //   Left Knee: indent 1
    expect(torsoItem.className).toContain('muscle-joint-tree__item--indent-0');
    expect(shoulderItem.className).toContain('muscle-joint-tree__item--indent-1');
    expect(elbowItem.className).toContain('muscle-joint-tree__item--indent-2');
    expect(hipItem.className).toContain('muscle-joint-tree__item--indent-0');
    expect(kneeItem.className).toContain('muscle-joint-tree__item--indent-1');
  });

  it('configures bidirectional joints with 0° in the middle and unidirectional with 0° on the left', () => {
    render(<JointPoseSliders />);

    // Bidirectional: Torso (-30° to +30°) and Hip (-45° to +45°)
    const torsoSlider = screen.getByTestId('joint-slider-spineFlexion');
    expect(torsoSlider).toHaveAttribute('min', '-30');
    expect(torsoSlider).toHaveAttribute('max', '30');
    expect(torsoSlider.className).toContain('muscle-joint-slider--bidirectional');

    const hipSlider = screen.getByTestId('joint-slider-hipFlexion');
    expect(hipSlider).toHaveAttribute('min', '-45');
    expect(hipSlider).toHaveAttribute('max', '45');
    expect(hipSlider.className).toContain('muscle-joint-slider--bidirectional');

    // Unidirectional: Shoulder (0° to 90°), Elbow (0° to 130°), Knee (0° to 120°)
    const shoulderSlider = screen.getByTestId('joint-slider-shoulderAbduction');
    expect(shoulderSlider).toHaveAttribute('min', '0');
    expect(shoulderSlider).toHaveAttribute('max', '90');
    expect(shoulderSlider.className).toContain('muscle-joint-slider--unidirectional');

    const elbowSlider = screen.getByTestId('joint-slider-elbowFlexion');
    expect(elbowSlider).toHaveAttribute('min', '0');
    expect(elbowSlider).toHaveAttribute('max', '130');
    expect(elbowSlider.className).toContain('muscle-joint-slider--unidirectional');

    const kneeSlider = screen.getByTestId('joint-slider-kneeFlexion');
    expect(kneeSlider).toHaveAttribute('min', '0');
    expect(kneeSlider).toHaveAttribute('max', '120');
    expect(kneeSlider.className).toContain('muscle-joint-slider--unidirectional');
  });

  it('displays the defined range of motion (ROM) for each joint', () => {
    render(<JointPoseSliders />);

    expect(screen.getByText('[-30° … +30°]')).toBeInTheDocument();
    expect(screen.getByText('[0° … +90°]')).toBeInTheDocument();
    expect(screen.getByText('[0° … +130°]')).toBeInTheDocument();
    expect(screen.getByText('[-45° … +45°]')).toBeInTheDocument();
    expect(screen.getByText('[0° … +120°]')).toBeInTheDocument();
  });

  it('updates the store joint angle and pauses animation when the user drags a slider', () => {
    useMuscleStore.setState({ isSkeletonAnimating: true });
    render(<JointPoseSliders />);

    const elbowSlider = screen.getByTestId('joint-slider-elbowFlexion');
    fireEvent.change(elbowSlider, { target: { value: '60' } });

    // Should pause animation and update store angle in radians
    const state = useMuscleStore.getState();
    expect(state.isSkeletonAnimating).toBe(false);
    expect(state.skeletonJointAngles.elbowFlexion).toBeCloseTo((60 * Math.PI) / 180, 4);

    // Value badge should update to 60°
    const badge = screen.getByTestId('joint-val-elbowFlexion');
    expect(badge).toHaveTextContent('+60°');
  });

  it('updates bidirectional joint with negative angles', () => {
    render(<JointPoseSliders />);

    const torsoSlider = screen.getByTestId('joint-slider-spineFlexion');
    fireEvent.change(torsoSlider, { target: { value: '-15' } });

    const state = useMuscleStore.getState();
    expect(state.skeletonJointAngles.spineFlexion).toBeCloseTo((-15 * Math.PI) / 180, 4);

    const badge = screen.getByTestId('joint-val-spineFlexion');
    expect(badge).toHaveTextContent('-15°');
  });

  it('matches joint positions when angles are updated from animation', () => {
    render(<JointPoseSliders />);

    // Simulate animated joint updates from the Three.js loop
    act(() => {
      useMuscleStore.getState().setSkeletonJointAngles({
        shoulderAbduction: (45 * Math.PI) / 180,
        kneeFlexion: (75 * Math.PI) / 180,
      });
    });

    const shoulderSlider = screen.getByTestId('joint-slider-shoulderAbduction') as HTMLInputElement;
    expect(shoulderSlider.value).toBe('45');
    expect(screen.getByTestId('joint-val-shoulderAbduction')).toHaveTextContent('+45°');

    const kneeSlider = screen.getByTestId('joint-slider-kneeFlexion') as HTMLInputElement;
    expect(kneeSlider.value).toBe('75');
    expect(screen.getByTestId('joint-val-kneeFlexion')).toHaveTextContent('+75°');
  });

  it('resets all joint sliders to neutral 0° on clicking Reset Pose', () => {
    useMuscleStore.getState().setSkeletonJointAngles({
      spineFlexion: (20 * Math.PI) / 180,
      shoulderAbduction: (50 * Math.PI) / 180,
      elbowFlexion: (90 * Math.PI) / 180,
      hipFlexion: (30 * Math.PI) / 180,
      kneeFlexion: (60 * Math.PI) / 180,
    });

    render(<JointPoseSliders />);

    const resetBtn = screen.getByTestId('joint-pose-reset-btn');
    fireEvent.click(resetBtn);

    const state = useMuscleStore.getState();
    expect(state.skeletonJointAngles.spineFlexion).toBe(0);
    expect(state.skeletonJointAngles.shoulderAbduction).toBe(0);
    expect(state.skeletonJointAngles.elbowFlexion).toBe(0);
    expect(state.skeletonJointAngles.hipFlexion).toBe(0);
    expect(state.skeletonJointAngles.kneeFlexion).toBe(0);
    expect(state.isSkeletonAnimating).toBe(false);
    expect(state.skeletonPoseResetCount).toBe(1);

    // Badges show 0°
    expect(screen.getByTestId('joint-val-spineFlexion')).toHaveTextContent('0°');
    expect(screen.getByTestId('joint-val-elbowFlexion')).toHaveTextContent('0°');
  });

  it('does not render when bodyView is not full_body', () => {
    useMuscleStore.setState({ bodyView: 'region' });
    const { container } = render(<JointPoseSliders />);
    expect(container).toBeEmptyDOMElement();
  });
});
