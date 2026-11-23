import { memo, useCallback, useState } from 'react';
import { useMuscleStore, type SkeletonJointAngles } from '../../store/useMuscleStore';

export interface JointPoseConfig {
  key: keyof SkeletonJointAngles;
  label: string;
  minDeg: number;
  maxDeg: number;
  stepDeg: number;
  isBidirectional: boolean;
  indent: number;
  motionTypeLabel: string;
}

export const JOINT_POSE_CONFIGS: JointPoseConfig[] = [
  {
    key: 'spineFlexion',
    label: 'Torso',
    minDeg: -30,
    maxDeg: 30,
    stepDeg: 1,
    isBidirectional: true,
    indent: 0,
    motionTypeLabel: 'Flexion / Extension',
  },
  {
    key: 'leftShoulderAbduction',
    label: 'Left Shoulder (In/Out)',
    minDeg: 0,
    maxDeg: 90,
    stepDeg: 1,
    isBidirectional: false,
    indent: 1,
    motionTypeLabel: 'Abduction',
  },
  {
    key: 'leftShoulderFlexion',
    label: 'Left Shoulder (Forward/Back)',
    minDeg: -90,
    maxDeg: 90,
    stepDeg: 1,
    isBidirectional: true,
    indent: 1,
    motionTypeLabel: 'Flexion / Extension',
  },
  {
    key: 'leftElbowFlexion',
    label: 'Left Elbow',
    minDeg: 0,
    maxDeg: 130,
    stepDeg: 1,
    isBidirectional: false,
    indent: 2,
    motionTypeLabel: 'Flexion',
  },
  {
    key: 'rightShoulderAbduction',
    label: 'Right Shoulder (In/Out)',
    minDeg: 0,
    maxDeg: 90,
    stepDeg: 1,
    isBidirectional: false,
    indent: 1,
    motionTypeLabel: 'Abduction',
  },
  {
    key: 'rightShoulderFlexion',
    label: 'Right Shoulder (Forward/Back)',
    minDeg: -90,
    maxDeg: 90,
    stepDeg: 1,
    isBidirectional: true,
    indent: 1,
    motionTypeLabel: 'Flexion / Extension',
  },
  {
    key: 'rightElbowFlexion',
    label: 'Right Elbow',
    minDeg: 0,
    maxDeg: 130,
    stepDeg: 1,
    isBidirectional: false,
    indent: 2,
    motionTypeLabel: 'Flexion',
  },
  {
    key: 'leftHipFlexion',
    label: 'Left Hip (Forward/Back)',
    minDeg: -45,
    maxDeg: 45,
    stepDeg: 1,
    isBidirectional: true,
    indent: 0,
    motionTypeLabel: 'Flexion / Extension',
  },
  {
    key: 'leftHipAbduction',
    label: 'Left Hip (Outward)',
    minDeg: 0,
    maxDeg: 45,
    stepDeg: 1,
    isBidirectional: false,
    indent: 0,
    motionTypeLabel: 'Outward Pivot',
  },
  {
    key: 'leftKneeFlexion',
    label: 'Left Knee',
    minDeg: 0,
    maxDeg: 120,
    stepDeg: 1,
    isBidirectional: false,
    indent: 1,
    motionTypeLabel: 'Flexion',
  },
  {
    key: 'rightHipFlexion',
    label: 'Right Hip (Forward/Back)',
    minDeg: -45,
    maxDeg: 45,
    stepDeg: 1,
    isBidirectional: true,
    indent: 0,
    motionTypeLabel: 'Flexion / Extension',
  },
  {
    key: 'rightHipAbduction',
    label: 'Right Hip (Outward)',
    minDeg: 0,
    maxDeg: 45,
    stepDeg: 1,
    isBidirectional: false,
    indent: 0,
    motionTypeLabel: 'Outward Pivot',
  },
  {
    key: 'rightKneeFlexion',
    label: 'Right Knee',
    minDeg: 0,
    maxDeg: 120,
    stepDeg: 1,
    isBidirectional: false,
    indent: 1,
    motionTypeLabel: 'Flexion',
  },
];

function formatAngleDeg(deg: number): string {
  if (deg > 0) return `+${deg}°`;
  return `${deg}°`;
}

function JointPoseSlidersComponent() {
  const [isExpanded, setIsExpanded] = useState(true);
  const bodyView = useMuscleStore((s) => s.bodyView);
  const skeletonJointAngles = useMuscleStore((s) => s.skeletonJointAngles);
  const setSkeletonJointAngle = useMuscleStore((s) => s.setSkeletonJointAngle);
  const resetSkeletonPose = useMuscleStore((s) => s.resetSkeletonPose);
  const isSkeletonAnimating = useMuscleStore((s) => s.isSkeletonAnimating);

  const handleSliderChange = useCallback(
    (key: keyof SkeletonJointAngles, degValue: number) => {
      const radValue = (degValue * Math.PI) / 180;
      setSkeletonJointAngle(key, radValue);
    },
    [setSkeletonJointAngle],
  );

  // If in isolated region view, pose controls do not apply to the partial model
  if (bodyView !== 'full_body') {
    return null;
  }

  return (
    <section className="muscle-joint-pose-panel" aria-label="Joint pose controls" data-testid="joint-pose-sliders">
      <div className="muscle-joint-pose-panel__header">
        <div className="muscle-joint-pose-panel__titles">
          <span className="muscle-joint-pose-panel__eyebrow">Kinematics</span>
          <h3 className="muscle-joint-pose-panel__title">Joint Pose Controls</h3>
        </div>
        <div className="muscle-joint-pose-panel__controls">
          <button
            type="button"
            className="muscle-joint-pose-panel__toggle-btn"
            onClick={() => setIsExpanded((prev) => !prev)}
            aria-expanded={isExpanded}
            title={isExpanded ? 'Collapse joint sliders' : 'Expand joint sliders'}
          >
            {isExpanded ? 'Hide' : 'Show'}
          </button>
          <button
            type="button"
            className="muscle-joint-pose-panel__reset-btn"
            onClick={resetSkeletonPose}
            data-testid="joint-pose-reset-btn"
            title="Reset all joint sliders to neutral 0° pose"
          >
            Reset Pose
          </button>
        </div>
      </div>

      <div
        className={`muscle-joint-tree${isExpanded ? '' : ' is-collapsed'}`}
        role="group"
        aria-label="Kinematic joint pose sliders"
      >
        {JOINT_POSE_CONFIGS.map((config) => {
          const currentRad = skeletonJointAngles[config.key] ?? 0;
          const currentDeg = Math.round((currentRad * 180) / Math.PI);
          const clampedDeg = Math.max(config.minDeg, Math.min(config.maxDeg, currentDeg));

          return (
            <div
              key={config.key}
              className={`muscle-joint-tree__item muscle-joint-tree__item--indent-${config.indent}`}
              data-testid={`joint-item-${config.key}`}
            >
              <div className="muscle-joint-tree__node-header">
                <div className="muscle-joint-tree__label-wrap">
                  {config.indent > 0 && (
                    <span className="muscle-joint-tree__branch-guide" aria-hidden="true">
                      {config.indent === 1 ? '└─' : '└──'}
                    </span>
                  )}
                  <label htmlFor={`joint-slider-${config.key}`} className="muscle-joint-tree__label">
                    {config.label}
                  </label>
                </div>
                <div className="muscle-joint-tree__meta">
                  <span
                    className="muscle-joint-tree__rom"
                    title={`Range of Motion: ${config.minDeg}° to +${config.maxDeg}°`}
                  >
                    [{config.minDeg}° … {config.maxDeg > 0 ? `+${config.maxDeg}°` : `${config.maxDeg}°`}]
                  </span>
                  <span className="muscle-joint-tree__val-badge" data-testid={`joint-val-${config.key}`}>
                    {formatAngleDeg(clampedDeg)}
                  </span>
                </div>
              </div>

              <div className="muscle-joint-slider__wrap">
                <input
                  id={`joint-slider-${config.key}`}
                  type="range"
                  min={config.minDeg}
                  max={config.maxDeg}
                  step={config.stepDeg}
                  value={clampedDeg}
                  onChange={(e) => handleSliderChange(config.key, Number(e.target.value))}
                  className={`muscle-joint-slider ${
                    config.isBidirectional
                      ? 'muscle-joint-slider--bidirectional'
                      : 'muscle-joint-slider--unidirectional'
                  }`}
                  data-testid={`joint-slider-${config.key}`}
                  aria-label={`${config.label} pose angle`}
                  aria-valuemin={config.minDeg}
                  aria-valuemax={config.maxDeg}
                  aria-valuenow={clampedDeg}
                  aria-valuetext={`${clampedDeg}°`}
                />
                <div className="muscle-joint-slider__ticks" aria-hidden="true">
                  {config.isBidirectional ? (
                    <>
                      <span className="muscle-joint-slider__tick muscle-joint-slider__tick--start">
                        {config.minDeg}°
                      </span>
                      <span className="muscle-joint-slider__tick muscle-joint-slider__tick--center">
                        0° Neutral
                      </span>
                      <span className="muscle-joint-slider__tick muscle-joint-slider__tick--end">
                        +{config.maxDeg}°
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="muscle-joint-slider__tick muscle-joint-slider__tick--start">
                        0° Neutral
                      </span>
                      <span className="muscle-joint-slider__tick muscle-joint-slider__tick--end">
                        +{config.maxDeg}°
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const JointPoseSliders = memo(JointPoseSlidersComponent);
export default JointPoseSliders;
