import { useMuscleStore } from '../../store/useMuscleStore';

export default function AnatomyCanvasHud() {
  const focusedNodeId = useMuscleStore((s) => s.focusedNodeId);
  const referenceHalfHint = useMuscleStore((s) => s.referenceHalfHint);
  const setReferenceHalfHint = useMuscleStore((s) => s.setReferenceHalfHint);
  const hasFocus = Boolean(focusedNodeId);

  return (
    <div className="muscle-canvas-hud" aria-live="polite">
      {referenceHalfHint !== 'idle' ? (
        <div className="muscle-canvas-hud__reference-chip" data-testid="muscle-reference-half-hint">
          <span>Reference half · study on the right</span>
          {referenceHalfHint === 'pinned' ? (
            <button type="button" onClick={() => setReferenceHalfHint('idle')} aria-label="Dismiss">
              ×
            </button>
          ) : null}
        </div>
      ) : null}
      {!hasFocus ? (
        <p className="muscle-canvas-hud__hint">Tap any muscle or bone to view anatomy details.</p>
      ) : null}
      <p className="muscle-canvas-hud__nav-hint">
        Drag to orbit · Right-drag or two-finger drag to pan · Scroll to zoom
        {hasFocus ? ' · Esc to deselect' : ''}
      </p>
    </div>
  );
}
