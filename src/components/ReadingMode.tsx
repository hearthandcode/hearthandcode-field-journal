import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

/* ==========================================================================
   Types
   ========================================================================== */

type FontFamily = 'default' | 'serif' | 'mono';
type Theme = 'warm-dark' | 'cream' | 'ember' | 'plasma';

interface ReadingSettings {
  fontFamily: FontFamily;
  fontSize: number;
  lineHeight: number;
  theme: Theme;
}

interface ReadingModeContextValue extends ReadingSettings {
  setFontFamily: (f: FontFamily) => void;
  adjustFontSize: (delta: number) => void;
  adjustLineHeight: (delta: number) => void;
  setTheme: (t: Theme) => void;
}

/* ==========================================================================
   Constants
   ========================================================================== */

const FONT_FAMILIES: FontFamily[] = ['default', 'serif', 'mono'];
const FONT_SIZE_MIN = 1;
const FONT_SIZE_MAX = 1.5;
const FONT_SIZE_STEP = 0.0625;
const LINE_HEIGHT_MIN = 1.5;
const LINE_HEIGHT_MAX = 2.0;
const LINE_HEIGHT_STEP = 0.1;
const THEMES: Theme[] = ['warm-dark', 'cream', 'ember', 'plasma'];
const STORAGE_KEY = 'hc-reading-mode';

const FONT_FAMILY_LABELS: Record<FontFamily, string> = {
  default: 'mono',
  serif: 'serif',
  mono: 'mono',
};

const THEME_LABELS: Record<Theme, string> = {
  'warm-dark': 'warm dark',
  cream: 'cream',
  ember: 'ember',
  plasma: 'plasma',
};

const FONT_FAMILY_CSS: Record<FontFamily, string> = {
  default: "var(--mono-font)",
  serif: "'Georgia', 'Times New Roman', serif",
  mono: "'JetBrains Mono', 'Fira Mono', 'SF Mono', monospace",
};

/* ==========================================================================
   Theme palettes — applied as CSS custom properties on <html>
   ========================================================================== */

interface ThemeTokens {
  bg: string;
  fg: string;
  surface: string;
  surfaceRaised: string;
  border: string;
  textPrimary: string;
  textMuted: string;
  textFaint: string;
}

const THEME_PALETTES: Record<Theme, ThemeTokens> = {
  'warm-dark': {
    bg: '#1a1614',
    fg: '#f5f0e8',
    surface: '#211d19',
    surfaceRaised: '#2a2520',
    border: '#332e27',
    textPrimary: '#f5f0e8',
    textMuted: '#978f82',
    textFaint: '#5c554c',
  },
  cream: {
    bg: '#f5f0e8',
    fg: '#1a1614',
    surface: '#e8e2d8',
    surfaceRaised: '#dbd4c8',
    border: '#c4b8a2',
    textPrimary: '#1a1614',
    textMuted: '#5c554c',
    textFaint: '#8a8276',
  },
  ember: {
    bg: '#1a1410',
    fg: '#e8c88a',
    surface: '#241d16',
    surfaceRaised: '#2e261d',
    border: '#3d3225',
    textPrimary: '#e8c88a',
    textMuted: '#b8955c',
    textFaint: '#6b5a3e',
  },
  plasma: {
    bg: '#1a1214',
    fg: '#f5e0d0',
    surface: '#24191c',
    surfaceRaised: '#2e2024',
    border: '#3d282c',
    textPrimary: '#f5e0d0',
    textMuted: '#c08878',
    textFaint: '#7a5044',
  },
};

const DEFAULT_SETTINGS: ReadingSettings = {
  fontFamily: 'default',
  fontSize: 1.125,
  lineHeight: 1.7,
  theme: 'warm-dark',
};

/* ==========================================================================
   Persistence helpers
   ========================================================================== */

function loadSettings(): ReadingSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    /* corrupted localStorage — use defaults */
  }
  return DEFAULT_SETTINGS;
}

function saveSettings(s: ReadingSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* localStorage full or disabled — degrade gracefully */
  }
}

/* ==========================================================================
   Apply to DOM
   ========================================================================== */

function applySettings(s: ReadingSettings): void {
  const root = document.documentElement;

  // ── Typography ──
  root.style.setProperty('--rm-font-family', FONT_FAMILY_CSS[s.fontFamily]);
  root.style.setProperty('--rm-font-size', `${s.fontSize}rem`);
  root.style.setProperty('--rm-line-height', String(s.lineHeight));

  // ── Theme (canonical tokens) ──
  const t = THEME_PALETTES[s.theme];
  root.style.setProperty('--bg-warm-dark', t.bg);
  root.style.setProperty('--fg-cream', t.fg);
  root.style.setProperty('--surface', t.surface);
  root.style.setProperty('--surface-raised', t.surfaceRaised);
  root.style.setProperty('--border-subtle', t.border);
  root.style.setProperty('--text-primary', t.textPrimary);
  root.style.setProperty('--text-muted', t.textMuted);
  root.style.setProperty('--text-faint', t.textFaint);

  // ── Backward-compat aliases (components & reading-mode.css reference these) ──
  root.style.setProperty('--color-bg', t.bg);
  root.style.setProperty('--color-surface', t.surface);
  root.style.setProperty('--color-surface-raised', t.surfaceRaised);
  root.style.setProperty('--color-border', t.border);
  root.style.setProperty('--color-text', t.textPrimary);
  root.style.setProperty('--color-text-muted', t.textMuted);
  root.style.setProperty('--color-text-faint', t.textFaint);
  root.style.setProperty('--color-cream', t.fg);
}

/* ==========================================================================
   Context
   ========================================================================== */

const ReadingModeContext = createContext<ReadingModeContextValue>({
  ...DEFAULT_SETTINGS,
  setFontFamily: () => {},
  adjustFontSize: () => {},
  adjustLineHeight: () => {},
  setTheme: () => {},
});

function useReadingMode(): ReadingModeContextValue {
  return useContext(ReadingModeContext);
}

/* ==========================================================================
   Provider
   ========================================================================== */

function ReadingModeContextProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<ReadingSettings>(DEFAULT_SETTINGS);

  // Hydrate from localStorage on first mount
  useEffect(() => {
    const saved = loadSettings();
    setSettings(saved);
    applySettings(saved);
  }, []);

  const update = useCallback((patch: Partial<ReadingSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      applySettings(next);
      return next;
    });
  }, []);

  const setFontFamily = useCallback(
    (f: FontFamily) => update({ fontFamily: f }),
    [update],
  );

  const adjustFontSize = useCallback(
    (delta: number) => {
      setSettings((prev) => {
        const next = Math.min(
          FONT_SIZE_MAX,
          Math.max(FONT_SIZE_MIN, prev.fontSize + delta),
        );
        const rounded =
          Math.round(next / FONT_SIZE_STEP) * FONT_SIZE_STEP;
        const clamped =
          rounded > FONT_SIZE_MAX
            ? FONT_SIZE_MAX
            : rounded < FONT_SIZE_MIN
              ? FONT_SIZE_MIN
              : rounded;
        const nextSettings = { ...prev, fontSize: clamped };
        saveSettings(nextSettings);
        applySettings(nextSettings);
        return nextSettings;
      });
    },
    [],
  );

  const adjustLineHeight = useCallback(
    (delta: number) => {
      setSettings((prev) => {
        const next = Math.min(
          LINE_HEIGHT_MAX,
          Math.max(LINE_HEIGHT_MIN, prev.lineHeight + delta),
        );
        const rounded = Math.round(next / LINE_HEIGHT_STEP) * LINE_HEIGHT_STEP;
        const clamped =
          rounded > LINE_HEIGHT_MAX
            ? LINE_HEIGHT_MAX
            : rounded < LINE_HEIGHT_MIN
              ? LINE_HEIGHT_MIN
              : rounded;
        const nextSettings = { ...prev, lineHeight: clamped };
        saveSettings(nextSettings);
        applySettings(nextSettings);
        return nextSettings;
      });
    },
    [],
  );

  const setTheme = useCallback(
    (t: Theme) => update({ theme: t }),
    [update],
  );

  return (
    <ReadingModeContext.Provider
      value={{
        ...settings,
        setFontFamily,
        adjustFontSize,
        adjustLineHeight,
        setTheme,
      }}
    >
      {children}
    </ReadingModeContext.Provider>
  );
}

/* ==========================================================================
   Panel component
   ========================================================================== */

function formatRem(value: number): string {
  return value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}

function formatLineHeight(value: number): string {
  return value.toFixed(1);
}

export default function ReadingMode() {
  const {
    fontFamily,
    fontSize,
    lineHeight,
    theme,
    setFontFamily,
    adjustFontSize,
    adjustLineHeight,
    setTheme,
  } = useReadingMode();

  return (
    <aside aria-label="Reading preferences" className="reading-mode-panel">
      <details>
        <summary>reading controls</summary>
        <div className="reading-mode-controls">
      {/* ── Font family (select) ── */}
      <div className="rm-control-group">
        <label htmlFor="rm-font-family" className="rm-label">
          font
        </label>
        <select
          id="rm-font-family"
          className="rm-select"
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value as FontFamily)}
        >
          {FONT_FAMILIES.map((f) => (
            <option key={f} value={f}>
              {FONT_FAMILY_LABELS[f]}
            </option>
          ))}
        </select>
      </div>

      {/* ── Font size (stepper buttons) ── */}
      <div className="rm-control-group">
        <span className="rm-label" id="rm-font-size-label">
          size
        </span>
        <div className="rm-stepper" role="group" aria-labelledby="rm-font-size-label">
          <button
            type="button"
            className="rm-stepper-btn"
            aria-label="Decrease font size"
            disabled={fontSize <= FONT_SIZE_MIN}
            onClick={() => adjustFontSize(-FONT_SIZE_STEP)}
          >
            −
          </button>
          <span className="rm-stepper-value" aria-live="polite">
            {formatRem(fontSize)}rem
          </span>
          <button
            type="button"
            className="rm-stepper-btn"
            aria-label="Increase font size"
            disabled={fontSize >= FONT_SIZE_MAX}
            onClick={() => adjustFontSize(FONT_SIZE_STEP)}
          >
            +
          </button>
        </div>
      </div>

      {/* ── Line height (stepper buttons) ── */}
      <div className="rm-control-group">
        <span className="rm-label" id="rm-line-height-label">
          lead
        </span>
        <div
          className="rm-stepper"
          role="group"
          aria-labelledby="rm-line-height-label"
        >
          <button
            type="button"
            className="rm-stepper-btn"
            aria-label="Decrease line height"
            disabled={lineHeight <= LINE_HEIGHT_MIN}
            onClick={() => adjustLineHeight(-LINE_HEIGHT_STEP)}
          >
            −
          </button>
          <span className="rm-stepper-value" aria-live="polite">
            {formatLineHeight(lineHeight)}
          </span>
          <button
            type="button"
            className="rm-stepper-btn"
            aria-label="Increase line height"
            disabled={lineHeight >= LINE_HEIGHT_MAX}
            onClick={() => adjustLineHeight(LINE_HEIGHT_STEP)}
          >
            +
          </button>
        </div>
      </div>

      {/* ── Theme (select) ── */}
      <div className="rm-control-group">
        <label htmlFor="rm-theme" className="rm-label">
          theme
        </label>
        <select
          id="rm-theme"
          className="rm-select"
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
        >
          {THEMES.map((t) => (
            <option key={t} value={t}>
              {THEME_LABELS[t]}
            </option>
          ))}
        </select>
      </div>
        </div>
      </details>
    </aside>
  );
}

/* ==========================================================================
   Public export: Astro island wrapper
   ========================================================================== */

export function ReadingModeProvider({ children }: { children: ReactNode }) {
  return (
    <ReadingModeContextProvider>
      {children}
      <ReadingMode />
    </ReadingModeContextProvider>
  );
}