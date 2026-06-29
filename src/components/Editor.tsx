import { useEffect, useRef } from 'react';
import { basicSetup } from 'codemirror';
import { EditorView } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

interface EditorProps {
  language: string;
  displayName: string;
  value: string;
  onChange: (value: string) => void;
  theme?: 'dark' | 'light';
}

const getLanguageExtension = (language: string) => {
  switch (language) {
    case 'xml':
      return html();
    case 'css':
      return css();
    default:
      return javascript();
  }
};

const getIcon = (language: string) => {
  switch (language) {
    case 'xml':
      return '🌐';
    case 'css':
      return '🎨';
    case 'javascript':
      return '⚡';
    default:
      return '📄';
  }
};

const baseTheme = EditorView.theme({
  '&': { height: '100%' },
  '.cm-scroller': {
    fontFamily: "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
    fontSize: '14px',
    lineHeight: '1.6',
    overflow: 'auto',
  },
  '.cm-content': { padding: '16px 0' },
  '.cm-line': { paddingLeft: '16px', paddingRight: '16px' },
});

const Editor = ({ language, displayName, value, onChange, theme = 'dark' }: EditorProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const themeCompartment = useRef(new Compartment());
  const onChangeRef = useRef(onChange);
  const isInternalUpdate = useRef(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Create editor once on mount — value/theme updates handled in separate effects
  useEffect(() => {
    if (!containerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions: [
          basicSetup,
          getLanguageExtension(language),
          themeCompartment.current.of(theme === 'dark' ? oneDark : []),
          baseTheme,
          EditorView.updateListener.of(update => {
            if (update.docChanged && !isInternalUpdate.current) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
        ],
      }),
      parent: containerRef.current,
    });

    viewRef.current = view;
    return () => view.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync external value changes (template load, reset)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    isInternalUpdate.current = true;
    view.dispatch({ changes: { from: 0, to: current.length, insert: value } });
    isInternalUpdate.current = false;
  }, [value]);

  // Sync theme changes
  useEffect(() => {
    viewRef.current?.dispatch({
      effects: themeCompartment.current.reconfigure(theme === 'dark' ? oneDark : []),
    });
  }, [theme]);

  return (
    <div className="flex flex-col flex-1 mx-1 first:ml-0 last:mr-0">
      <div
        className={`flex justify-between items-center px-4 py-2 font-medium transition-colors ${
          theme === 'dark' ? 'bg-gray-800 text-white border-gray-600' : 'bg-gray-200 text-gray-800 border-gray-300'
        } rounded-t-lg border-b`}>
        <span className="flex items-center gap-2">
          <span>{getIcon(language)}</span>
          {displayName}
        </span>
        <span className="text-xs opacity-70">{language.toUpperCase()}</span>
      </div>
      <div
        ref={containerRef}
        className={`flex-1 rounded-b-lg overflow-hidden [&_.cm-editor]:h-full ${
          theme === 'dark' ? 'bg-gray-900' : 'bg-white'
        }`}
      />
    </div>
  );
};

export default Editor;
