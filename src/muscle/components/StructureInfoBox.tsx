import { memo, useEffect, useRef } from 'react';
import { useMuscleStore } from '../store/useMuscleStore';
import { getNodeById } from '../curriculum';
import './StructureInfoBox.css';

function StructureInfoBoxComponent() {
  const focusedNodeId = useMuscleStore((s) => s.focusedNodeId);
  const selectedNodeId = useMuscleStore((s) => s.selectedNodeId);
  const clearFocus = useMuscleStore((s) => s.clearFocus);

  const activeId = focusedNodeId ?? selectedNodeId;
  const node = activeId ? getNodeById(activeId) : undefined;
  const infoBoxRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = infoBoxRef.current;
    if (!el) {
      document.documentElement.style.setProperty('--muscle-infobox-height', '0px');
      return;
    }

    const updateHeight = () => {
      const h = Math.round(el.getBoundingClientRect().height || 0);
      document.documentElement.style.setProperty('--muscle-infobox-height', `${h}px`);
    };

    updateHeight();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(updateHeight);
      ro.observe(el);
    }

    return () => {
      ro?.disconnect();
      document.documentElement.style.setProperty('--muscle-infobox-height', '0px');
    };
  }, [node]);

  if (!node) {
    return null;
  }

  const name = node.name;
  const details = node.details;
  const definition = details?.definition;
  const latinName = details?.latinName;
  const wikipediaUrl = details?.wikipediaUrl;

  const typeLabel = node.type.charAt(0).toUpperCase() + node.type.slice(1);

  return (
    <section
      ref={infoBoxRef}
      className="muscle-structure-infobox"
      aria-label={`Anatomy details for ${name}`}
      data-testid="muscle-structure-infobox"
    >
      <div className="muscle-structure-infobox__header">
        <div className="muscle-structure-infobox__title-wrap">
          <div className="muscle-structure-infobox__meta">
            <span className="muscle-structure-infobox__type-badge">{typeLabel}</span>
            {latinName ? (
              <span className="muscle-structure-infobox__latin" data-testid="infobox-latin">
                {latinName}
              </span>
            ) : null}
          </div>
          <h2 className="muscle-structure-infobox__title" data-testid="infobox-title">
            {name}
          </h2>
        </div>
        <button
          type="button"
          className="muscle-structure-infobox__close-btn"
          onClick={clearFocus}
          aria-label="Close details"
          data-testid="infobox-close-btn"
          title="Close details (Esc)"
        >
          ×
        </button>
      </div>

      <div className="muscle-structure-infobox__body">
        {definition ? (
          <p className="muscle-structure-infobox__blurb" data-testid="infobox-blurb">
            {definition}
          </p>
        ) : null}
        {wikipediaUrl ? (
          <div className="muscle-structure-infobox__footer">
            <a
              href={wikipediaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="muscle-structure-infobox__wiki-link"
              data-testid="infobox-wiki-link"
            >
              Wikipedia ↗
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}

const StructureInfoBox = memo(StructureInfoBoxComponent);
export default StructureInfoBox;
