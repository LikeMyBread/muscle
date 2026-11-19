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

  it('renders the Joint Pose Controls panel with all 9 separated joints', () => {
    render(<JointPoseSliders />);
    const panel = screen.getByTestId('joint-pose-sliders');
    expect(panel).toBeInTheDocument();
    expect(JOINT_POSE_CONFIGS).toHaveLength(9);

    for (const config of JOINT_POSE_CONFIGS) {
      const slider = screen.getByTestId(`joint-slider-${config.key}`);
      expect(slider).toBeInTheDocument();
      expect(screen.getByText(config.label)).toBeInTheDocument();
    }
  });

  it('arranges joints in an indented tree with correct hierarchy levels for left and right limbs', () => {
    render(<JointPoseSliders />);

    const torsoItem = screen.getByTestId('joint-item-spineFlexion');
    const leftShoulderItem = screen.getByTestId('joint-item-leftShoulderAbduction');
    const leftElbowItem = screen.getByTestId('joint-item-leftElbowFlexion');
    const rightShoulderItem = screen.getByTestId('joint-item-rightShoulderAbduction');
    const rightElbowItem = screen.getByTestId('joint-item-rightElbowFlexion');
    const leftHipItem = screen.getByTestId('joint-item-leftHipFlexion');
    const leftKneeItem = screen.getByTestId('joint-item-leftKneeFlexion');
    const rightHipItem = screen.getByTestId('joint-item-rightHipFlexion');
    const rightKneeItem = screen.getByTestId('joint-item-rightKneeFlexion');

    // Hierarchy check:
    // Torso: indent 0
    //   Left Shoulder: indent 1
    //     Left Elbow: indent 2
    //   Right Shoulder: indent 1
    //     Right Elbow: indent 2
    // Left Hip: indent 0
    //   Left Knee: indent 1
    // Right Hip: indent 0
    //   Right Knee: indent 1
    expect(torsoItem.className).toContain('muscle-joint-tree__item--indent-0');
    expect(leftShoulderItem.className).toContain('muscle-joint-tree__item--indent-1');
    expect(leftElbowItem.className).toContain('muscle-joint-tree__item--indent-2');
    expect(rightShoulderItem.className).toContain('muscle-joint-tree__item--indent-1');
    expect(rightElbowItem.className).toContain('muscle-joint-tree__item--indent-2');
    expect(leftHipItem.className).toContain('muscle-joint-tree__item--indent-0');
    expect(leftKneeItem.className).toContain('muscle-joint-tree__item--indent-1');
    expect(rightHipItem.className).toContain('muscle-joint-tree__item--indent-0');
    expect(rightKneeItem.className).toContain('muscle-joint-tree__item--indent-1');
  });

  it('configures bidirectional joints with 0° in the middle and unidirectional with 0° on the left', () => {
    render(<JointPoseSliders />);

    // Bidirectional: Torso (-30° to +30°), Left Hip (-45° to +45°), Right Hip (-45° to +45°)
    const torsoSlider = screen.getByTestId('joint-slider-spineFlexion');
    expect(torsoSlider).toHaveAttribute('min', '-30');
    expect(torsoSlider).toHaveAttribute('max', '30');
    expect(torsoSlider.className).toContain('muscle-joint-slider--bidirectional');

    const leftHipSlider = screen.getByTestId('joint-slider-leftHipFlexion');
    expect(leftHipSlider).toHaveAttribute('min', '-45');
    expect(leftHipSlider).toHaveAttribute('max', '45');
    expect(leftHipSlider.className).toContain('muscle-joint-slider--bidirectional');

    const rightHipSlider = screen.getByTestId('joint-slider-rightHipFlexion');
    expect(rightHipSlider).toHaveAttribute('min', '-45');
    expect(rightHipSlider).toHaveAttribute('max', '45');
    expect(rightHipSlider.className).toContain('muscle-joint-slider--bidirectional');

    // Unidirectional: Shoulders (0° to 90°), Elbows (0° to 130°), Knees (0° to 120°)
    const leftShoulderSlider = screen.getByTestId('joint-slider-leftShoulderAbduction');
    expect(leftShoulderSlider).toHaveAttribute('min', '0');
    expect(leftShoulderSlider).toHaveAttribute('max', '90');
    expect(leftShoulderSlider.className).toContain('muscle-joint-slider--unidirectional');

    const rightShoulderSlider = screen.getByTestId('joint-slider-rightShoulderAbduction');
    expect(rightShoulderSlider).toHaveAttribute('min', '0');
    expect(rightShoulderSlider).toHaveAttribute('max', '90');
    expect(rightShoulderSlider.className).toContain('muscle-joint-slider--unidirectional');

    const leftElbowSlider = screen.getByTestId('joint-slider-leftElbowFlexion');
    expect(leftElbowSlider).toHaveAttribute('min', '0');
    expect(leftElbowSlider).toHaveAttribute('max', '130');
    expect(leftElbowSlider.className).toContain('muscle-joint-slider--unidirectional');

    const rightElbowSlider = screen.getByTestId('joint-slider-rightElbowFlexion');
    expect(rightElbowSlider).toHaveAttribute('min', '0');
    expect(rightElbowSlider).toHaveAttribute('max', '130');
    expect(rightElbowSlider.className).toContain('muscle-joint-slider--unidirectional');

    const leftKneeSlider = screen.getByTestId('joint-slider-leftKneeFlexion');
    expect(leftKneeSlider).toHaveAttribute('min', '0');
    expect(leftKneeSlider).toHaveAttribute('max', '120');
    expect(leftKneeSlider.className).toContain('muscle-joint-slider--unidirectional');

    const rightKneeSlider = screen.getByTestId('joint-slider-rightKneeFlexion');
    expect(rightKneeSlider).toHaveAttribute('min', '0');
    expect(rightKneeSlider).toHaveAttribute('max', '120');
    expect(rightKneeSlider.className).toContain('muscle-joint-slider--unidirectional');
  });

  it('updates left and right joints independently when user drags sliders', () => {
    useMuscleStore.setState({ isSkeletonAnimating: true });
    render(<JointPoseSliders />);

    // Move Left Elbow to 45°
    const leftElbowSlider = screen.getByTestId('joint-slider-leftElbowFlexion');
    fireEvent.change(leftElbowSlider, { target: { value: '45' } });

    let state = useMuscleStore.getState();
    expect(state.isSkeletonAnimating).toBe(false);
    expect(state.skeletonJointAngles.leftElbowFlexion).toBeCloseTo((45 * Math.PI) / 180, 4);
    expect(state.skeletonJointAngles.rightElbowFlexion).toBe(0); // Right stays 0!
    expect(screen.getByTestId('joint-val-leftElbowFlexion')).toHaveTextContent('+45°');
    expect(screen.getByTestId('joint-val-rightElbowFlexion')).toHaveTextContent('0°');

    // Move Right Elbow to 90°
    const rightElbowSlider = screen.getByTestId('joint-slider-rightElbowFlexion');
    fireEvent.change(rightElbowSlider, { target: { value: '90' } });

    state = useMuscleStore.getState();
    expect(state.skeletonJointAngles.leftElbowFlexion).toBeCloseTo((45 * Math.PI) / 180, 4);
    expect(state.skeletonJointAngles.rightElbowFlexion).toBeCloseTo((90 * Math.PI) / 180, 4);
    expect(screen.getByTestId('joint-val-rightElbowFlexion')).toHaveTextContent('+90°');
  });

  it('updates left and right shoulders, hips, and knees independently', () => {
    render(<JointPoseSliders />);

    // Left Shoulder 60°, Right Shoulder 30°
    fireEvent.change(screen.getByTestId('joint-slider-leftShoulderAbduction'), { target: { value: '60' } });
    fireEvent.change(screen.getByTestId('joint-slider-rightShoulderAbduction'), { target: { value: '30' } });

    // Left Hip -20°, Right Hip +35°
    fireEvent.change(screen.getByTestId('joint-slider-leftHipFlexion'), { target: { value: '-20' } });
    fireEvent.change(screen.getByTestId('joint-slider-rightHipFlexion'), { target: { value: '35' } });

    // Left Knee 80°, Right Knee 100°
    fireEvent.change(screen.getByTestId('joint-slider-leftKneeFlexion'), { target: { value: '80' } });
    fireEvent.change(screen.getByTestId('joint-slider-rightKneeFlexion'), { target: { value: '100' } });

    const state = useMuscleStore.getState();
    expect(state.skeletonJointAngles.leftShoulderAbduction).toBeCloseTo((60 * Math.PI) / 180, 4);
    expect(state.skeletonJointAngles.rightShoulderAbduction).toBeCloseTo((30 * Math.PI) / 180, 4);
    expect(state.skeletonJointAngles.leftHipFlexion).toBeCloseTo((-20 * Math.PI) / 180, 4);
    expect(state.skeletonJointAngles.rightHipFlexion).toBeCloseTo((35 * Math.PI) / 180, 4);
    expect(state.skeletonJointAngles.leftKneeFlexion).toBeCloseTo((80 * Math.PI) / 180, 4);
    expect(state.skeletonJointAngles.rightKneeFlexion).toBeCloseTo((100 * Math.PI) / 180, 4);

    expect(screen.getByTestId('joint-val-leftHipFlexion')).toHaveTextContent('-20°');
    expect(screen.getByTestId('joint-val-rightHipFlexion')).toHaveTextContent('+35°');
  });

  it('matches joint positions when angles are updated from animation', () => {
    render(<JointPoseSliders />);

    act(() => {
      useMuscleStore.getState().setSkeletonJointAngles({
        leftShoulderAbduction: (45 * Math.PI) / 180,
        rightShoulderAbduction: (70 * Math.PI) / 180,
        leftKneeFlexion: (50 * Math.PI) / 180,
        rightKneeFlexion: (85 * Math.PI) / 180,
      });
    });

    const leftShoulderSlider = screen.getByTestId('joint-slider-leftShoulderAbduction') as HTMLInputElement;
    expect(leftShoulderSlider.value).toBe('45');
    expect(screen.getByTestId('joint-val-leftShoulderAbduction')).toHaveTextContent('+45°');

    const rightShoulderSlider = screen.getByTestId('joint-slider-rightShoulderAbduction') as HTMLInputElement;
    expect(rightShoulderSlider.value).toBe('70');
    expect(screen.getByTestId('joint-val-rightShoulderAbduction')).toHaveTextContent('+70°');

    const leftKneeSlider = screen.getByTestId('joint-slider-leftKneeFlexion') as HTMLInputElement;
    expect(leftKneeSlider.value).toBe('50');

    const rightKneeSlider = screen.getByTestId('joint-slider-rightKneeFlexion') as HTMLInputElement;
    expect(rightKneeSlider.value).toBe('85');
  });

  it('resets all 9 joint sliders to neutral 0° on clicking Reset Pose', () => {
    useMuscleStore.getState().setSkeletonJointAngles({
      spineFlexion: (20 * Math.PI) / 180,
      leftShoulderAbduction: (50 * Math.PI) / 180,
      rightShoulderAbduction: (40 * Math.PI) / 180,
      leftElbowFlexion: (90 * Math.PI) / 180,
      rightElbowFlexion: (70 * Math.PI) / 180,
      leftHipFlexion: (30 * Math.PI) / 180,
      rightHipFlexion: (-25 * Math.PI) / 180,
      leftKneeFlexion: (60 * Math.PI) / 180,
      rightKneeFlexion: (80 * Math.PI) / 180,
    });

    render(<JointPoseSliders />);

    const resetBtn = screen.getByTestId('joint-pose-reset-btn');
    fireEvent.click(resetBtn);

    const state = useMuscleStore.getState();
    expect(state.skeletonJointAngles.spineFlexion).toBe(0);
    expect(state.skeletonJointAngles.leftShoulderAbduction).toBe(0);
    expect(state.skeletonJointAngles.rightShoulderAbduction).toBe(0);
    expect(state.skeletonJointAngles.leftElbowFlexion).toBe(0);
    expect(state.skeletonJointAngles.rightElbowFlexion).toBe(0);
    expect(state.skeletonJointAngles.leftHipFlexion).toBe(0);
    expect(state.skeletonJointAngles.rightHipFlexion).toBe(0);
    expect(state.skeletonJointAngles.leftKneeFlexion).toBe(0);
    expect(state.skeletonJointAngles.rightKneeFlexion).toBe(0);
    expect(state.isSkeletonAnimating).toBe(false);
    expect(state.skeletonPoseResetCount).toBe(1);

    expect(screen.getByTestId('joint-val-spineFlexion')).toHaveTextContent('0°');
    expect(screen.getByTestId('joint-val-leftElbowFlexion')).toHaveTextContent('0°');
    expect(screen.getByTestId('joint-val-rightElbowFlexion')).toHaveTextContent('0°');
  });

  it('does not render when bodyView is not full_body', () => {
    useMuscleStore.setState({ bodyView: 'region' });
    const { container } = render(<JointPoseSliders />);
    expect(container).toBeEmptyDOMElement();
  });
});
