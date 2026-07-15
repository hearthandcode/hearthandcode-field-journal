import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';

export type FieldNodeKind =
  | 'record'
  | 'evidence'
  | 'inference'
  | 'proposal'
  | 'open-question'
  | 'correction'
  | 'amendment';

export interface FieldModeNode {
  id: string;
  title: string;
  description: string;
  href: string;
  kind: FieldNodeKind;
  format: string;
  x: number;
  y: number;
  publishedDate?: string;
  readingMinutes?: number;
  source?: string;
  parentId?: string;
  recordIndex?: number;
}

export interface FieldModeRelationship {
  id: string;
  from: string;
  to: string;
  label: string;
  note: string;
  kind: 'declared' | 'claim';
}

interface FieldModeProps {
  nodes: FieldModeNode[];
  relationships: FieldModeRelationship[];
}

interface PanState {
  pointerId: number;
  left: number;
  top: number;
  x: number;
  y: number;
}

const WORLD_HEIGHT = 1440;
const STORAGE_KEY = 'hearth-and-code-field-last-record-v1';
const MIN_ZOOM = 0.72;
const MAX_ZOOM = 1.28;
const ZOOM_STEP = 0.14;

const KIND_LABELS: Record<FieldNodeKind, string> = {
  record: 'Public record',
  evidence: 'Evidence',
  inference: 'Claim / inference',
  proposal: 'Proposal',
  'open-question': 'Open question',
  correction: 'Correction',
  amendment: 'Amendment',
};

function displayDate(date?: string): string {
  if (!date) return 'Undated record';

  return new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function isInteractiveTarget(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest('button, a, input, select, textarea'));
}

function edgePath(from: FieldModeNode, to: FieldModeNode): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const curvature = Math.max(160, Math.min(360, Math.abs(dx) * 0.42 + Math.abs(dy) * 0.16));
  const controlY = from.kind === 'record' && to.kind === 'record'
    ? Math.min(from.y, to.y) - 210
    : from.y + dy * 0.5 - (dy < 0 ? curvature * 0.32 : -curvature * 0.26);

  return `M ${from.x} ${from.y} C ${from.x + dx * 0.42} ${controlY}, ${to.x - dx * 0.42} ${controlY}, ${to.x} ${to.y}`;
}

export default function FieldMode({ nodes, relationships }: FieldModeProps) {
  const recordNodes = useMemo(
    () => nodes.filter((node) => node.kind === 'record').sort((a, b) => (a.recordIndex ?? 0) - (b.recordIndex ?? 0)),
    [nodes],
  );
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);
  const childNodesByRecord = useMemo(() => new Map(
    recordNodes.map((record) => [record.id, nodes.filter((node) => node.parentId === record.id)]),
  ), [nodes, recordNodes]);
  const latestRecord = recordNodes.at(-1);
  const [selectedId, setSelectedId] = useState(latestRecord?.id ?? nodes[0]?.id ?? '');
  const [zoom, setZoom] = useState(1);
  const [isPanning, setIsPanning] = useState(false);
  const [spacePan, setSpacePan] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newRecordIds, setNewRecordIds] = useState<string[]>([]);
  const [hasReturnMemory, setHasReturnMemory] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLElement>(null);
  const initialPositionedRef = useRef(false);
  const panRef = useRef<PanState | null>(null);
  const zoomRef = useRef(zoom);
  const fieldWidth = Math.max(2520, recordNodes.length * 980 + 900);
  const selectedNode = nodeById.get(selectedId) ?? latestRecord ?? nodes[0];

  const centerNode = useCallback((nodeId: string, focus = false) => {
    const node = nodeById.get(nodeId);
    const viewport = viewportRef.current;
    if (!node || !viewport) return;

    setSelectedId(nodeId);
    window.requestAnimationFrame(() => {
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      viewport.scrollTo({
        left: Math.max(0, node.x * zoom - viewport.clientWidth / 2),
        top: Math.max(0, node.y * zoom - viewport.clientHeight / 2),
        behavior: reducedMotion ? 'auto' : 'smooth',
      });

      if (focus) {
        document.getElementById(`field-mode-node-${node.id}`)?.focus({ preventScroll: true });
      }
    });
  }, [nodeById, zoom]);

  useEffect(() => {
    if (initialPositionedRef.current || !latestRecord) return;
    initialPositionedRef.current = true;
    centerNode(latestRecord.id);
  }, [centerNode, latestRecord]);

  useEffect(() => {
    if (zoomRef.current === zoom) return;
    zoomRef.current = zoom;
    if (selectedNode) centerNode(selectedNode.id);
  }, [centerNode, selectedNode, zoom]);

  useEffect(() => {
    if (!recordNodes.length) return;

    try {
      const previousRecordId = window.localStorage.getItem(STORAGE_KEY);
      const previousIndex = recordNodes.findIndex((node) => node.id === previousRecordId);
      setHasReturnMemory(previousIndex >= 0);
      setNewRecordIds(previousIndex >= 0 ? recordNodes.slice(previousIndex + 1).map((node) => node.id) : []);
      window.localStorage.setItem(STORAGE_KEY, recordNodes.at(-1)?.id ?? '');
    } catch {
      setHasReturnMemory(false);
      setNewRecordIds([]);
    }
  }, [recordNodes]);

  useEffect(() => {
    function onFullscreenChange() {
      setIsFullscreen(Boolean(document.fullscreenElement));
    }

    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  function setZoomLevel(nextZoom: number) {
    setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(nextZoom.toFixed(2)))));
  }

  function toggleFullscreen() {
    const field = fieldRef.current;
    if (!field) return;

    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }

    if (field.requestFullscreen) {
      void field.requestFullscreen().catch(() => undefined);
    }
  }

  function clearReturnMemory() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // The Field remains fully usable when local storage is unavailable.
    }
    setNewRecordIds([]);
    setHasReturnMemory(false);
  }

  function selectNode(nodeId: string, options: { center?: boolean; focus?: boolean } = {}) {
    const { center = true, focus = false } = options;
    if (center) {
      centerNode(nodeId, focus);
      return;
    }
    setSelectedId(nodeId);
  }

  function handleNodeKeyDown(event: KeyboardEvent<HTMLButtonElement>, node: FieldModeNode) {
    const recordIndex = recordNodes.findIndex((record) => record.id === (node.kind === 'record' ? node.id : node.parentId));
    const siblings = node.parentId ? childNodesByRecord.get(node.parentId) ?? [] : [];
    const siblingIndex = siblings.findIndex((sibling) => sibling.id === node.id);
    let nextId: string | undefined;

    if (event.key === 'ArrowRight') {
      nextId = node.kind === 'record'
        ? recordNodes[recordIndex + 1]?.id
        : siblings[siblingIndex + 1]?.id ?? recordNodes[recordIndex + 1]?.id;
    }

    if (event.key === 'ArrowLeft') {
      nextId = node.kind === 'record'
        ? recordNodes[recordIndex - 1]?.id
        : siblings[siblingIndex - 1]?.id ?? recordNodes[recordIndex - 1]?.id;
    }

    if (event.key === 'ArrowDown') {
      nextId = node.kind === 'record'
        ? childNodesByRecord.get(node.id)?.[0]?.id
        : siblings[siblingIndex + 1]?.id;
    }

    if (event.key === 'ArrowUp') {
      nextId = node.kind === 'record'
        ? undefined
        : node.parentId;
    }

    if (event.key === 'Home') nextId = recordNodes[0]?.id;
    if (event.key === 'End') nextId = latestRecord?.id;

    if (nextId) {
      event.preventDefault();
      selectNode(nextId, { focus: true });
    }
  }

  function beginPan(event: PointerEvent<HTMLDivElement>) {
    const allowsPan = event.button === 1 || (event.button === 0 && (spacePan || !isInteractiveTarget(event.target)));
    if (!allowsPan) return;

    const viewport = viewportRef.current;
    if (!viewport) return;

    event.preventDefault();
    try {
      viewport.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is unavailable for some synthetic and adapted pointer inputs.
      // Pointer movement inside the field still provides a usable panning fallback.
    }
    panRef.current = {
      pointerId: event.pointerId,
      left: viewport.scrollLeft,
      top: viewport.scrollTop,
      x: event.clientX,
      y: event.clientY,
    };
    setIsPanning(true);
  }

  function movePan(event: PointerEvent<HTMLDivElement>) {
    const pan = panRef.current;
    const viewport = viewportRef.current;
    if (!pan || !viewport || pan.pointerId !== event.pointerId) return;

    viewport.scrollLeft = pan.left - (event.clientX - pan.x);
    viewport.scrollTop = pan.top - (event.clientY - pan.y);
  }

  function endPan(event: PointerEvent<HTMLDivElement>) {
    const pan = panRef.current;
    const viewport = viewportRef.current;
    if (!pan || pan.pointerId !== event.pointerId) return;

    try {
      if (viewport?.hasPointerCapture(event.pointerId)) {
        viewport.releasePointerCapture(event.pointerId);
      }
    } catch {
      // A pointer may have completed before capture was established.
    }
    panRef.current = null;
    setIsPanning(false);
  }

  if (!selectedNode) {
    return <p className="field-mode-empty">No published public record is available yet.</p>;
  }

  const kindCounts = nodes.reduce<Record<FieldNodeKind, number>>((counts, node) => {
    counts[node.kind] += 1;
    return counts;
  }, {
    record: 0,
    evidence: 0,
    inference: 0,
    proposal: 0,
    'open-question': 0,
    correction: 0,
    amendment: 0,
  });
  const selectedRelationships = relationships.filter(
    (relationship) => relationship.from === selectedNode.id || relationship.to === selectedNode.id,
  );
  const selectedRecord = selectedNode.kind === 'record'
    ? selectedNode
    : nodeById.get(selectedNode.parentId ?? '');

  return (
    <section className="field-mode" ref={fieldRef} aria-labelledby="field-mode-title">
      <header className="field-mode-rail">
        <div className="field-mode-brand">
          <p>Field mode / public reasoning map</p>
          <h1 id="field-mode-title">Claims keep their context.</h1>
        </div>
        <div className="field-mode-stats" aria-label="Public record summary">
          <span>{kindCounts.record.toString().padStart(2, '0')} records</span>
          <span>{relationships.filter((relationship) => relationship.kind === 'declared').length.toString().padStart(2, '0')} reviewed links</span>
          <span>local controls only</span>
        </div>
        <div className="field-mode-actions">
          <a href="/">Journal</a>
          <button type="button" onClick={toggleFullscreen}>{isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}</button>
        </div>
      </header>

      <div className="field-mode-command-row">
        <p>
          Chronology fixes the public reading order. Satellites record what a note claims, proposes,
          leaves open, corrects, or amends. Every visible source and relationship is authored before it appears.
        </p>
        <div className="field-mode-controls" aria-label="Field mode controls">
          <button type="button" onClick={() => selectNode(recordNodes[0]?.id ?? '', { focus: true })}>Origin</button>
          <button type="button" onClick={() => selectNode(latestRecord?.id ?? '', { focus: true })}>Latest</button>
          <button type="button" onClick={() => setZoomLevel(zoom - ZOOM_STEP)} disabled={zoom <= MIN_ZOOM}>−</button>
          <span aria-label={`Zoom ${Math.round(zoom * 100)} percent`}>{Math.round(zoom * 100)}%</span>
          <button type="button" onClick={() => setZoomLevel(zoom + ZOOM_STEP)} disabled={zoom >= MAX_ZOOM}>+</button>
          <button type="button" onClick={() => setZoomLevel(1)} disabled={zoom === 1}>Reset view</button>
          <button type="button" aria-expanded={listOpen} onClick={() => setListOpen((open) => !open)}>List view</button>
        </div>
      </div>

      {hasReturnMemory && newRecordIds.length > 0 && (
        <div className="field-return-signal" role="status">
          <span><i aria-hidden="true"></i> Field signal</span>
          <p>{newRecordIds.length} public {newRecordIds.length === 1 ? 'record is' : 'records are'} new since your last visit.</p>
          <button type="button" onClick={() => selectNode(newRecordIds.at(-1) ?? '', { focus: true })}>Open newest</button>
          <button type="button" onClick={clearReturnMemory}>Clear local return memory</button>
        </div>
      )}

      <div className="field-mode-layout">
        <div
          className={`field-mode-viewport ${isPanning ? 'is-panning' : ''} ${spacePan ? 'is-space-pan' : ''}`}
          ref={viewportRef}
          role="region"
          aria-label="Public reasoning map. Drag blank space or use the middle mouse button to pan. Use arrow keys on a selected record to move through time."
          tabIndex={0}
          onPointerDown={beginPan}
          onPointerMove={movePan}
          onPointerUp={endPan}
          onPointerCancel={endPan}
          onKeyDown={(event) => {
            if (event.currentTarget === event.target && event.code === 'Space') {
              event.preventDefault();
              setSpacePan(true);
            }
          }}
          onKeyUp={(event) => {
            if (event.code === 'Space') setSpacePan(false);
          }}
          onBlur={() => setSpacePan(false)}
        >
          <p className="field-mode-gesture-note" aria-hidden="true">Drag blank field · middle mouse pans · arrow keys traverse</p>
          <div className="field-mode-scale" style={{ width: `${fieldWidth * zoom}px`, height: `${WORLD_HEIGHT * zoom}px` }}>
            <div className="field-mode-world" style={{ width: `${fieldWidth}px`, height: `${WORLD_HEIGHT}px`, transform: `scale(${zoom})` }}>
              <div className="field-mode-origin" aria-hidden="true">
                <span>Origin</span>
                <strong>Public record begins</strong>
              </div>
              <div className="field-mode-spine" aria-hidden="true"></div>
              <span className="field-mode-axis-start" aria-hidden="true">Earlier</span>
              <span className="field-mode-axis-end" aria-hidden="true">Latest public record</span>
              <div className="field-mode-horizon" aria-hidden="true">The field grows only when a reviewed public record is ready.</div>

              <svg className="field-mode-relationships" viewBox={`0 0 ${fieldWidth} ${WORLD_HEIGHT}`} aria-hidden="true">
                {relationships.map((relationship) => {
                  const from = nodeById.get(relationship.from);
                  const to = nodeById.get(relationship.to);
                  if (!from || !to) return null;
                  return <path className={`field-edge is-${relationship.kind}`} key={relationship.id} d={edgePath(from, to)} />;
                })}
              </svg>

              {nodes.map((node) => {
                const isSelected = node.id === selectedNode.id;
                const isNew = newRecordIds.includes(node.id);
                return (
                  <button
                    type="button"
                    className={`field-mode-node is-${node.kind} ${isSelected ? 'is-selected' : ''} ${isNew ? 'is-new' : ''}`}
                    id={`field-mode-node-${node.id}`}
                    key={node.id}
                    style={{ left: `${node.x}px`, top: `${node.y}px` }}
                    onClick={() => selectNode(node.id)}
                    onMouseEnter={() => selectNode(node.id, { center: false })}
                    onFocus={() => selectNode(node.id, { center: false })}
                    onKeyDown={(event) => handleNodeKeyDown(event, node)}
                    tabIndex={isSelected ? 0 : -1}
                    aria-pressed={isSelected}
                    aria-describedby="field-mode-detail"
                  >
                    <span className="field-mode-node-kind">{node.kind === 'record' ? `T+${((node.recordIndex ?? 0) + 1).toString().padStart(2, '0')}` : KIND_LABELS[node.kind]}</span>
                    <strong>{node.title}</strong>
                    <small>{node.kind === 'record' ? `${node.format} · ${displayDate(node.publishedDate)}` : node.source ?? node.format}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="field-mode-minimap" aria-hidden="true">
            <span className="field-mode-minimap-spine"></span>
            {nodes.map((node) => (
              <i
                className={`is-${node.kind} ${node.id === selectedNode.id ? 'is-selected' : ''}`}
                key={node.id}
                style={{ left: `${(node.x / fieldWidth) * 100}%`, top: `${(node.y / WORLD_HEIGHT) * 100}%` }}
              ></i>
            ))}
          </div>
        </div>

        <aside className="field-mode-detail" id="field-mode-detail" aria-live="polite">
          <div className="field-mode-detail-head">
            <span>Selected signal</span>
            <span>{KIND_LABELS[selectedNode.kind]}</span>
          </div>
          <p className="field-mode-detail-kicker">{selectedNode.kind === 'record' ? selectedNode.format : selectedRecord?.title ?? 'Public record context'}</p>
          <h2>{selectedNode.title}</h2>
          <p className="field-mode-detail-meta">
            {selectedNode.publishedDate && <time dateTime={selectedNode.publishedDate}>{displayDate(selectedNode.publishedDate)}</time>}
            {selectedNode.readingMinutes && <span>{selectedNode.readingMinutes} min read</span>}
            {selectedNode.kind !== 'record' && selectedRecord && <span>from {selectedRecord.format}</span>}
          </p>
          <p className="field-mode-detail-summary">{selectedNode.description}</p>
          {selectedNode.source && (
            <div className="field-mode-provenance">
              <span>Declared source</span>
              <p>{selectedNode.source}</p>
            </div>
          )}
          <a className="field-mode-open-entry" href={selectedNode.href}>Open public entry <span aria-hidden="true">→</span></a>

          <div className="field-mode-relations">
            <p>Visible relationships</p>
            {selectedRelationships.length > 0 ? selectedRelationships.map((relationship) => (
              <div key={relationship.id}>
                <span>{relationship.kind === 'declared' ? 'Reviewed link' : 'Claim context'}</span>
                <strong>{relationship.label}</strong>
                <small>{relationship.note}</small>
              </div>
            )) : <small>No additional public relationship is declared for this signal.</small>}
          </div>

          <div className="field-mode-ledger" aria-label="Public record categories">
            {(['evidence', 'inference', 'proposal', 'open-question', 'correction', 'amendment'] as FieldNodeKind[]).map((kind) => (
              <span key={kind} className={`is-${kind}`}>{kindCounts[kind]} {KIND_LABELS[kind]}</span>
            ))}
          </div>
        </aside>
      </div>

      {listOpen && (
        <section className="field-mode-list" aria-labelledby="field-mode-list-title">
          <div>
            <p>Accessible reading path</p>
            <h2 id="field-mode-list-title">Chronological public record</h2>
          </div>
          <button type="button" onClick={() => setListOpen(false)}>Close list</button>
          <ol>
            {recordNodes.map((record) => (
              <li key={record.id}>
                <button type="button" onClick={() => { setListOpen(false); selectNode(record.id, { focus: true }); }}>
                  <span>T+{((record.recordIndex ?? 0) + 1).toString().padStart(2, '0')} · {displayDate(record.publishedDate)}</span>
                  <strong>{record.title}</strong>
                </button>
                <ul>
                  {(childNodesByRecord.get(record.id) ?? []).map((child) => (
                    <li key={child.id}>
                      <button type="button" onClick={() => { setListOpen(false); selectNode(child.id, { focus: true }); }}>
                        <span>{KIND_LABELS[child.kind]}</span>
                        {child.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>
      )}
    </section>
  );
}
