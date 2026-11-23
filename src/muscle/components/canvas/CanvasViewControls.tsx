import CenterFocusStrongOutlinedIcon from '@mui/icons-material/CenterFocusStrongOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined';
import { useMuscleStore } from '../../store/useMuscleStore';

export default function CanvasViewControls() {
  const resetCameraView = useMuscleStore((s) => s.resetCameraView);
  const isSkeletonAnimating = useMuscleStore((s) => s.isSkeletonAnimating);
  const toggleSkeletonAnimation = useMuscleStore((s) => s.toggleSkeletonAnimation);
  const resetSkeletonPose = useMuscleStore((s) => s.resetSkeletonPose);

  return (
    <div className="muscle-canvas-view-controls" aria-label="3D view shortcuts">
      <button
        type="button"
        className={`muscle-canvas-view-controls__btn muscle-canvas-view-controls__btn--animate${
          isSkeletonAnimating ? ' is-active' : ''
        }`}
        onClick={toggleSkeletonAnimation}
        aria-pressed={isSkeletonAnimating}
        title={isSkeletonAnimating ? 'Pause joint motion' : 'Animate skeleton joints through range of motion'}
        data-testid="muscle-animate-btn"
      >
        {isSkeletonAnimating ? (
          <>
            <PauseOutlinedIcon fontSize="small" aria-hidden style={{ marginRight: '0.3rem' }} />
            <span>Pause</span>
          </>
        ) : (
          <>
            <PlayArrowOutlinedIcon fontSize="small" aria-hidden style={{ marginRight: '0.3rem' }} />
            <span>Animate</span>
          </>
        )}
      </button>
      <button
        type="button"
        className="muscle-canvas-view-controls__btn muscle-canvas-view-controls__btn--icon"
        onClick={resetSkeletonPose}
        aria-label="Reset skeleton pose"
        title="Reset skeleton pose to resting position"
        data-testid="muscle-reset-pose-btn"
      >
        <RestartAltOutlinedIcon fontSize="small" aria-hidden />
      </button>
      <button
        type="button"
        className="muscle-canvas-view-controls__btn muscle-canvas-view-controls__btn--icon"
        onClick={resetCameraView}
        aria-label="Center view"
        title="Center view"
      >
        <CenterFocusStrongOutlinedIcon fontSize="small" aria-hidden />
      </button>
    </div>
  );
}
