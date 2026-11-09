import React, { useEffect } from 'react';

export interface AttributionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AttributionModal({ isOpen, onClose }: AttributionModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="muscle-modal-backdrop"
      onClick={onClose}
      role="presentation"
      data-testid="muscle-attribution-modal-backdrop"
    >
      <div
        className="muscle-modal-dialog muscle-attribution-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="muscle-attribution-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="muscle-modal-header">
          <h2 id="muscle-attribution-title" className="muscle-modal-title">
            Attribution & Licenses
          </h2>
          <button
            type="button"
            className="muscle-modal-close-btn"
            onClick={onClose}
            aria-label="Close attribution dialog"
          >
            ✕
          </button>
        </div>

        <div className="muscle-modal-content">
          <section className="muscle-attribution-section">
            <h3 className="muscle-attribution-heading">3D Human Anatomy Models</h3>
            <p>
              The 3D anatomical models and spatial geometry in this application are derived from{' '}
              <strong>
                <a
                  href="https://github.com/Z-Anatomy/Models-of-human-anatomy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Z-Anatomy (Models of human anatomy)
                </a>
              </strong>
              , created by <strong>Gauthier Kervyn</strong> (design, 3D modelling, anatomy),{' '}
              <strong>Marcin Zielinski</strong> (pipeline tooling), and the Z-Anatomy community.
            </p>
            <p className="muscle-attribution-license-pill">
              License:{' '}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
              </a>
            </p>
          </section>

          <section className="muscle-attribution-section">
            <h3 className="muscle-attribution-heading">Upstream Sources</h3>
            <ul className="muscle-attribution-list">
              <li>
                <strong>BodyParts3D:</strong> &copy; The Database Center for Life Science (DBCLS),
                Japan. Original models created by Kousaku Okubo. Licensed under{' '}
                <a
                  href="https://creativecommons.org/licenses/by-sa/2.1/jp/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CC BY-SA 2.1 Japan
                </a>
                .
              </li>
              <li>
                <strong>Wikipedia Contributors:</strong> Anatomical nomenclature, landmark descriptions,
                and Latin terminology licensed under{' '}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CC BY-SA
                </a>
                .
              </li>
              <li>
                <strong>OpenStax Anatomy and Physiology 2e:</strong> Peer-reviewed textbook referenced
                for curriculum alignment and fact verification. Licensed under{' '}
                <a
                  href="https://creativecommons.org/licenses/by/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  CC BY 4.0
                </a>
                .
              </li>
            </ul>
          </section>

          <section className="muscle-attribution-section">
            <h3 className="muscle-attribution-heading">Modifications Made</h3>
            <p className="muscle-attribution-desc">
              In accordance with CC BY-SA 4.0 &sect;3(a), the following adaptations were made to the original
              Z-Anatomy assets for real-time web execution:
            </p>
            <ul className="muscle-attribution-list">
              <li>
                <strong>Curriculum Extraction:</strong> Filtered and organized into artist-focused
                functional modules (Bones, Skeletal Landmarks, Superficial &amp; Deep Muscles, Joints).
              </li>
              <li>
                <strong>Performance Decimation:</strong> Reduced polygon counts (&le; 25,000 triangles
                per mesh, &le; 80,000 per regional bundle) for fluid 60fps WebGL rendering.
              </li>
              <li>
                <strong>Split-Plane &Eacute;corch&eacute;:</strong> Bisected the anatomy along the
                sagittal plane (+X for muscles, &minus;X for skeletal reference).
              </li>
              <li>
                <strong>Format Conversion:</strong> Converted Blender scenes to Draco-less binary glTF
                (`.glb`) files with JSON manifest indexing.
              </li>
            </ul>
          </section>

          <section className="muscle-attribution-section">
            <h3 className="muscle-attribution-heading">Share-Alike Terms</h3>
            <p className="muscle-attribution-desc">
              Any derivative 3D meshes or adaptations created from this data inherit the{' '}
              <strong>CC BY-SA 4.0</strong> license and must retain these attributions. See{' '}
              <a
                href="https://github.com/LikeMyBread/muscle/blob/main/LICENSE.md"
                target="_blank"
                rel="noopener noreferrer"
              >
                LICENSE.md
              </a>{' '}
              for full details.
            </p>
          </section>
        </div>

        <div className="muscle-modal-footer">
          <button
            type="button"
            className="muscle-modal-btn muscle-modal-btn--primary"
            onClick={onClose}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
