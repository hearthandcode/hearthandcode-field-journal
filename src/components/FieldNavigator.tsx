import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';

export interface FieldNode {
  id: string;
  title: string;
  description: string;
  href: string;
  format: string;
  publishedDate: string;
  readingMinutes?: number;
  labels: string[];
  x: number;
  y: number;
}

export interface FieldRelationship {
  id: string;
  from: string;
  to: string;
  label: string;
  note: string;
}

interface FieldNavigatorProps {
  nodes: FieldNode[];
  relationships: FieldRelationship[];
}

const FIELD_HEIGHT = 720;

function displayDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export default function FieldNavigator({ nodes, relationships }: FieldNavigatorProps) {
  const [selectedIndex, setSelectedIndex] = useState(Math.max(0, nodes.length - 1));
  const viewportRef = useRef<HTMLDivElement>(null);
  const fieldWidth = Math.max(1160, nodes.length * 390 + 440);
  const selectedNode = nodes[selectedIndex];

  const revealNode = useCallback((index: number, focus = false) => {
    const nextIndex = Math.min(Math.max(index, 0), Math.max(nodes.length - 1, 0));
    const next = nodes[nextIndex];
    if (!next) return;

    setSelectedIndex(nextIndex);
    window.requestAnimationFrame(() => {
      if (focus) {
        document.getElementById(`field-node-${next.id}`)?.focus({ preventScroll: true });
      }
    });
  }, [nodes]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const selected = nodes[selectedIndex];
    if (!viewport || !selected) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    viewport.scrollTo({
      left: Math.max(0, selected.x + 136 - viewport.clientWidth / 2),
      top: Math.max(0, selected.y + 56 - viewport.clientHeight / 2),
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  }, [nodes, selectedIndex]);

  function handleNodeKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      revealNode(index + 1, true);
    }

    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      revealNode(index - 1, true);
    }

    if (event.key === 'Home') {
      event.preventDefault();
      revealNode(0, true);
    }

    if (event.key === 'End') {
      event.preventDefault();
      revealNode(nodes.length - 1, true);
    }
  }

  if (!selectedNode) {
    return <p className="field-empty">No published notes are available in the field yet.</p>;
  }

  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  return (
    <section className="field-navigator" aria-labelledby="field-navigator-title">
      <div className="field-command-rail">
        <div>
          <p className="field-kicker">Field navigator</p>
          <h2 id="field-navigator-title">Chronology is the spine. Relationships are the overlay.</h2>
        </div>
        <div className="field-status" aria-label="Navigator status">
          <span><i aria-hidden="true"></i> {nodes.length.toString().padStart(2, '0')} public nodes</span>
          <span>explicit links only</span>
        </div>
      </div>

      <div className="field-instructions">
        <p>Hover, focus, or tap a node to inspect it. Use arrow keys to move through time. Open the selected entry from the detail dock.</p>
        <div className="field-controls" aria-label="Field navigation controls">
          <button type="button" onClick={() => revealNode(0, true)}>Start</button>
          <button type="button" onClick={() => revealNode(selectedIndex - 1, true)} disabled={selectedIndex === 0}>Earlier</button>
          <button type="button" onClick={() => revealNode(selectedIndex + 1, true)} disabled={selectedIndex === nodes.length - 1}>Later</button>
          <button type="button" onClick={() => revealNode(nodes.length - 1, true)}>Latest</button>
        </div>
      </div>

      <div className="field-layout">
        <div
          className="field-viewport"
          ref={viewportRef}
          role="region"
          aria-label="Chronological field grid"
          tabIndex={0}
        >
          <div className="field-grid" style={{ width: `${fieldWidth}px`, height: `${FIELD_HEIGHT}px` }}>
            <div className="field-origin" aria-hidden="true">
              <span>Origin</span>
              <strong>Public record begins</strong>
            </div>
            <div className="field-spine" aria-hidden="true"></div>
            <span className="field-axis-label axis-start" aria-hidden="true">Earlier</span>
            <span className="field-axis-label axis-end" aria-hidden="true">Latest public note</span>

            <svg
              className="field-relationships"
              viewBox={`0 0 ${fieldWidth} ${FIELD_HEIGHT}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {relationships.map((relationship) => {
                const from = nodeById.get(relationship.from);
                const to = nodeById.get(relationship.to);
                if (!from || !to) return null;
                const bend = Math.min(from.y, to.y) - 140;
                return (
                  <path
                    key={relationship.id}
                    d={`M ${from.x + 92} ${from.y + 36} C ${from.x + 190} ${bend}, ${to.x - 96} ${bend}, ${to.x} ${to.y + 36}`}
                  />
                );
              })}
            </svg>

            {nodes.map((node, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  type="button"
                  className={`field-node ${isSelected ? 'is-selected' : ''}`}
                  id={`field-node-${node.id}`}
                  key={node.id}
                  style={{ left: `${node.x}px`, top: `${node.y}px` }}
                  onClick={() => revealNode(index)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onFocus={() => setSelectedIndex(index)}
                  onKeyDown={(event) => handleNodeKeyDown(event, index)}
                  aria-pressed={isSelected}
                  aria-describedby="field-detail-dock"
                >
                  <span className="field-node-coordinate">T+{(index + 1).toString().padStart(2, '0')}</span>
                  <strong>{node.title}</strong>
                  <small>{node.format} · {displayDate(node.publishedDate)}</small>
                </button>
              );
            })}

            <div className="field-horizon" aria-hidden="true">
              <span>Field continues as the reviewed public record grows</span>
            </div>
          </div>
        </div>

        <aside className="field-detail-dock" id="field-detail-dock" aria-live="polite">
          <div className="field-detail-head">
            <span>Selected node</span>
            <span>{(selectedIndex + 1).toString().padStart(2, '0')} / {nodes.length.toString().padStart(2, '0')}</span>
          </div>
          <p className="field-detail-format">{selectedNode.format}</p>
          <h3>{selectedNode.title}</h3>
          <p className="field-detail-meta">
            <time dateTime={selectedNode.publishedDate}>{displayDate(selectedNode.publishedDate)}</time>
            {selectedNode.readingMinutes && <span>{selectedNode.readingMinutes} min read</span>}
          </p>
          <p className="field-detail-summary">{selectedNode.description}</p>
          <ul className="field-detail-labels" aria-label="Claim labels">
            {selectedNode.labels.map((label) => <li key={label}>{label}</li>)}
          </ul>
          <a className="field-open-entry" href={selectedNode.href}>Open entry <span aria-hidden="true">→</span></a>

          <div className="field-relationship-detail">
            <p>Declared relationships</p>
            {relationships.filter((relationship) => relationship.from === selectedNode.id || relationship.to === selectedNode.id).map((relationship) => (
              <div key={relationship.id}>
                <span>{relationship.id}</span>
                <strong>{relationship.label}</strong>
                <small>{relationship.note}</small>
              </div>
            ))}
            {relationships.every((relationship) => relationship.from !== selectedNode.id && relationship.to !== selectedNode.id) && (
              <small>No public relationship has been declared for this node yet.</small>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
