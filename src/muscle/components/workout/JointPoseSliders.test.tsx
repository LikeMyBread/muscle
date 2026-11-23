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
      layerPeelDepth: 0,
      isSkeletonAnimating: false,
      skeletonPoseResetCount: 0,
      skeletonJointAngles: { ...DEFAULT_SKELETON_JOINT_ANGLES },
    });
  });

  it('renders the depth slider above the joint sliders and updates layer depth on change', () => {
    render(<JointPoseSliders />);
    const depthSlider = screen.getByTestId('joint-slider-layerDepth');
    expect(depthSlider).toBeInTheDocument();
    expect(screen.getByText('Anatomy Depth')).toBeInTheDocument();
    expect(depthSlider).toHaveAttribute('aria-valuetext', 'Full muscle');

    fireEvent.change(depthSlider, { target: { value: '2' } });
    expect(useMuscleStore.getState().layerPeelDepth).toBe(2);
    expect(depthSlider).toHaveAttribute('aria-valuetext', 'Deep muscles');
  });

  it('renders the Joint Pose Controls panel with all 13 separated joints', () => {
    render(<JointPoseSliders />);
    const panel = screen.getByTestId('joint-pose-sliders');
    expect(panel).toBeInTheDocument();
    expect(JOINT_POSE_CONFIGS).toHaveLength(13);

    for (const config of JOINT_POSE_CONFIGS) {
      const slider = screen.getByTestId(`joint-slider-${config.key}`);
      expect(slider).toBeInTheDocument();
      expect(screen.getByText(config.label)).toBeInTheDocument();
    }
  });

  it('arranges joints in an indented tree with correct hierarchy levels for left and right limbs', () => {
    render(<JointPoseSliders />);

    const torsoItem = screen.getByTestId('joint-item-spineFlexion');
    const leftShoulderAbductItem = screen.getByTestId('joint-item-leftShoulderAbduction');
    const leftShoulderFlexItem = screen.getByTestId('joint-item-leftShoulderFlexion');
    const leftElbowItem = screen.getByTestId('joint-item-leftElbowFlexion');
    const rightShoulderAbductItem = screen.getByTestId('joint-item-rightShoulderAbduction');
    const rightShoulderFlexItem = screen.getByTestId('joint-item-rightShoulderFlexion');
    const rightElbowItem = screen.getByTestId('joint-item-rightElbowFlexion');
    const leftHipFlexItem = screen.getByTestId('joint-item-leftHipFlexion');
    const leftHipAbductItem = screen.getByTestId('joint-item-leftHipAbduction');
    const leftKneeItem = screen.getByTestId('joint-item-leftKneeFlexion');
    const rightHipFlexItem = screen.getByTestId('joint-item-rightHipFlexion');
    const rightHipAbductItem = screen.getByTestId('joint-item-rightHipAbduction');
    const rightKneeItem = screen.getByTestId('joint-item-rightKneeFlexion');

    // Hierarchy check:
    // Torso: indent 0
    //   Left Shoulder (In/Out): indent 1
    //   Left Shoulder (Forward/Back): indent 1
    //     Left Elbow: indent 2
    //   Right Shoulder (In/Out): indent 1
    //   Right Shoulder (Forward/Back): indent 1
    //     Right Elbow: indent 2
    // Left Hip (Forward/Back): indent 0
    // Left Hip (Outward): indent 0
    //   Left Knee: indent 1
    // Right Hip (Forward/Back): indent 0
    // Right Hip (Outward): indent 0
    //   Right Knee: indent 1
    expect(torsoItem.className).toContain('muscle-joint-tree__item--indent-0');
    expect(leftShoulderAbductItem.className).toContain('muscle-joint-tree__item--indent-1');
    expect(leftShoulderFlexItem.className).toContain('muscle-joint-tree__item--indent-1');
    expect(leftElbowItem.className).toContain('muscle-joint-tree__item--indent-2');
    expect(rightShoulderAbductItem.className).toContain('muscle-joint-tree__item--indent-1');
    expect(rightShoulderFlexItem.className).toContain('muscle-joint-tree__item--indent-1');
    expect(rightElbowItem.className).toContain('muscle-joint-tree__item--indent-2');
    expect(leftHipFlexItem.className).toContain('muscle-joint-tree__item--indent-0');
    expect(leftHipAbductItem.className).toContain('muscle-joint-tree__item--indent-0');
    expect(leftKneeItem.className).toContain('muscle-joint-tree__item--indent-1');
    expect(rightHipFlexItem.className).toContain('muscle-joint-tree__item--indent-0');
    expect(rightHipAbductItem.className).toContain('muscle-joint-tree__item--indent-0');
    expect(rightKneeItem.className).toContain('muscle-joint-tree__item--indent-1');
  });

  it('configures bidirectional joints with 0° in the middle and unidirectional with 0° on the left', () => {
    render(<JointPoseSliders />);

    // Bidirectional: Torso (-30° to +30°), Shoulders Flexion (-90° to +90°), Hips Flexion (-45° to +45°)
    const torsoSlider = screen.getByTestId('joint-slider-spineFlexion');
    expect(torsoSlider).toHaveAttribute('min', '-30');
    expect(torsoSlider).toHaveAttribute('max', '30');
    expect(torsoSlider.className).toContain('muscle-joint-slider--bidirectional');

    const leftShoulderFlexSlider = screen.getByTestId('joint-slider-leftShoulderFlexion');
    expect(leftShoulderFlexSlider).toHaveAttribute('min', '-90');
    expect(leftShoulderFlexSlider).toHaveAttribute('max', '90');
    expect(leftShoulderFlexSlider.className).toContain('muscle-joint-slider--bidirectional');

    const rightShoulderFlexSlider = screen.getByTestId('joint-slider-rightShoulderFlexion');
    expect(rightShoulderFlexSlider).toHaveAttribute('min', '-90');
    expect(rightShoulderFlexSlider).toHaveAttribute('max', '90');
    expect(rightShoulderFlexSlider.className).toContain('muscle-joint-slider--bidirectional');

    const leftHipSlider = screen.getByTestId('joint-slider-leftHipFlexion');
    expect(leftHipSlider).toHaveAttribute('min', '-45');
    expect(leftHipSlider).toHaveAttribute('max', '45');
    expect(leftHipSlider.className).toContain('muscle-joint-slider--bidirectional');

    const rightHipSlider = screen.getByTestId('joint-slider-rightHipFlexion');
    expect(rightHipSlider).toHaveAttribute('min', '-45');
    expect(rightHipSlider).toHaveAttribute('max', '45');
    expect(rightHipSlider.className).toContain('muscle-joint-slider--bidirectional');

    // Unidirectional: Shoulders Abduction (0° to 90°), Elbows (0° to 130°), Hips Abduction (0° to 45°), Knees (0° to 120°)
    const leftShoulderAbductSlider = screen.getByTestId('joint-slider-leftShoulderAbduction');
    expect(leftShoulderAbductSlider).toHaveAttribute('min', '0');
    expect(leftShoulderAbductSlider).toHaveAttribute('max', '90');
    expect(leftShoulderAbductSlider.className).toContain('muscle-joint-slider--unidirectional');

    const rightShoulderAbductSlider = screen.getByTestId('joint-slider-rightShoulderAbduction');
    expect(rightShoulderAbductSlider).toHaveAttribute('min', '0');
    expect(rightShoulderAbductSlider).toHaveAttribute('max', '90');
    expect(rightShoulderAbductSlider.className).toContain('muscle-joint-slider--unidirectional');

    const leftElbowSlider = screen.getByTestId('joint-slider-leftElbowFlexion');
    expect(leftElbowSlider).toHaveAttribute('min', '0');
    expect(leftElbowSlider).toHaveAttribute('max', '130');
    expect(leftElbowSlider.className).toContain('muscle-joint-slider--unidirectional');

    const rightElbowSlider = screen.getByTestId('joint-slider-rightElbowFlexion');
    expect(rightElbowSlider).toHaveAttribute('min', '0');
    expect(rightElbowSlider).toHaveAttribute('max', '130');
    expect(rightElbowSlider.className).toContain('muscle-joint-slider--unidirectional');

    const leftHipAbductSlider = screen.getByTestId('joint-slider-leftHipAbduction');
    expect(leftHipAbductSlider).toHaveAttribute('min', '0');
    expect(leftHipAbductSlider).toHaveAttribute('max', '45');
    expect(leftHipAbductSlider.className).toContain('muscle-joint-slider--unidirectional');

    const rightHipAbductSlider = screen.getByTestId('joint-slider-rightHipAbduction');
    expect(rightHipAbductSlider).toHaveAttribute('min', '0');
    expect(rightHipAbductSlider).toHaveAttribute('max', '45');
    expect(rightHipAbductSlider.className).toContain('muscle-joint-slider--unidirectional');

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
    expect(leftElbowSlider).toHaveValue('45');
    expect(leftElbowSlider).toHaveAttribute('aria-valuetext', '+45°');
    expect(screen.getByTestId('joint-slider-rightElbowFlexion')).toHaveValue('0');

    // Move Right Elbow to 90°
    const rightElbowSlider = screen.getByTestId('joint-slider-rightElbowFlexion');
    fireEvent.change(rightElbowSlider, { target: { value: '90' } });

    state = useMuscleStore.getState();
    expect(state.skeletonJointAngles.leftElbowFlexion).toBeCloseTo((45 * Math.PI) / 180, 4);
    expect(state.skeletonJointAngles.rightElbowFlexion).toBeCloseTo((90 * Math.PI) / 180, 4);
    expect(rightElbowSlider).toHaveValue('90');
    expect(rightElbowSlider).toHaveAttribute('aria-valuetext', '+90°');
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

    expect(screen.getByTestId('joint-slider-leftHipFlexion')).toHaveAttribute('aria-valuetext', '-20°');
    expect(screen.getByTestId('joint-slider-rightHipFlexion')).toHaveAttribute('aria-valuetext', '+35°');
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
    expect(leftShoulderSlider).toHaveAttribute('aria-valuetext', '+45°');

    const rightShoulderSlider = screen.getByTestId('joint-slider-rightShoulderAbduction') as HTMLInputElement;
    expect(rightShoulderSlider.value).toBe('70');
    expect(rightShoulderSlider).toHaveAttribute('aria-valuetext', '+70°');

    const leftKneeSlider = screen.getByTestId('joint-slider-leftKneeFlexion') as HTMLInputElement;
    expect(leftKneeSlider.value).toBe('50');

    const rightKneeSlider = screen.getByTestId('joint-slider-rightKneeFlexion') as HTMLInputElement;
    expect(rightKneeSlider.value).toBe('85');
  });

  it('resets all 13 joint sliders to neutral 0° on clicking Reset Pose', () => {
    useMuscleStore.getState().setSkeletonJointAngles({
      spineFlexion: (20 * Math.PI) / 180,
      leftShoulderAbduction: (50 * Math.PI) / 180,
      rightShoulderAbduction: (40 * Math.PI) / 180,
      leftShoulderFlexion: (35 * Math.PI) / 180,
      rightShoulderFlexion: (-25 * Math.PI) / 180,
      leftElbowFlexion: (90 * Math.PI) / 180,
      rightElbowFlexion: (70 * Math.PI) / 180,
      leftHipFlexion: (30 * Math.PI) / 180,
      rightHipFlexion: (-25 * Math.PI) / 180,
      leftHipAbduction: (20 * Math.PI) / 180,
      rightHipAbduction: (15 * Math.PI) / 180,
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
    expect(state.skeletonJointAngles.leftShoulderFlexion).toBe(0);
    expect(state.skeletonJointAngles.rightShoulderFlexion).toBe(0);
    expect(state.skeletonJointAngles.leftElbowFlexion).toBe(0);
    expect(state.skeletonJointAngles.rightElbowFlexion).toBe(0);
    expect(state.skeletonJointAngles.leftHipFlexion).toBe(0);
    expect(state.skeletonJointAngles.rightHipFlexion).toBe(0);
    expect(state.skeletonJointAngles.leftHipAbduction).toBe(0);
    expect(state.skeletonJointAngles.rightHipAbduction).toBe(0);
    expect(state.skeletonJointAngles.leftKneeFlexion).toBe(0);
    expect(state.skeletonJointAngles.rightKneeFlexion).toBe(0);
    expect(state.isSkeletonAnimating).toBe(false);
    expect(state.skeletonPoseResetCount).toBe(1);

    expect(screen.getByTestId('joint-slider-spineFlexion')).toHaveAttribute('aria-valuetext', '0°');
    expect(screen.getByTestId('joint-slider-leftShoulderFlexion')).toHaveAttribute('aria-valuetext', '0°');
    expect(screen.getByTestId('joint-slider-rightShoulderFlexion')).toHaveAttribute('aria-valuetext', '0°');
    expect(screen.getByTestId('joint-slider-leftHipAbduction')).toHaveAttribute('aria-valuetext', '0°');
    expect(screen.getByTestId('joint-slider-rightHipAbduction')).toHaveAttribute('aria-valuetext', '0°');
    expect(screen.getByTestId('joint-slider-leftElbowFlexion')).toHaveAttribute('aria-valuetext', '0°');
    expect(screen.getByTestId('joint-slider-rightElbowFlexion')).toHaveAttribute('aria-valuetext', '0°');
  });

  it('does not render when bodyView is not full_body', () => {
    useMuscleStore.setState({ bodyView: 'region' });
    const { container } = render(<JointPoseSliders />);
    expect(container).toBeEmptyDOMElement();
  });
});
