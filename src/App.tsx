import { useState, useEffect, useCallback, useRef, type ChangeEvent } from 'react';
import Editor from './components/Editor';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import ConsolePanel from './components/ConsolePanel';
import { Play, Save, Download, Upload, RotateCcw, Settings, Moon, Sun, Terminal, Share2 } from 'lucide-react';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T) => {
      try {
        setStoredValue(value);
        localStorage.setItem(key, JSON.stringify(value));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

// URL sharing — encode/decode state as base64 hash
const encodeState = (html: string, css: string, js: string): string => {
  try {
    const json = JSON.stringify({ html, css, js });
    const bytes = new TextEncoder().encode(json);
    const binary = Array.from(bytes, b => String.fromCharCode(b)).join('');
    return btoa(binary);
  } catch {
    return '';
  }
};

const decodeState = (hash: string): { html: string; css: string; js: string } | null => {
  try {
    const binary = atob(hash);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(json) as { html?: string; css?: string; js?: string };
    return { html: parsed.html ?? '', css: parsed.css ?? '', js: parsed.js ?? '' };
  } catch {
    return null;
  }
};

// Plantillas predefinidas
const templates = {
  blank: {
    html: '',
    css: '',
    js: '',
    name: 'En Blanco',
  },
  basic: {
    html: `<div class="container">
  <h1>¡Hola Mundo!</h1>
  <p>Este es un ejemplo básico.</p>
  <button onclick="cambiarColor()">Cambiar Color</button>
</div>`,
    css: `.container {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  text-align: center;
  font-family: Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  color: white;
}

button {
  background: #ff6b6b;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-top: 20px;
}

button:hover {
  background: #ee5a5a;
}`,
    js: `function cambiarColor() {
  const container = document.querySelector('.container');
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  ];
  
  const currentBg = container.style.background;
  let nextColor = colors[0];
  
  for (let i = 0; i < colors.length; i++) {
    if (currentBg === colors[i]) {
      nextColor = colors[(i + 1) % colors.length];
      break;
    }
  }
  
  container.style.background = nextColor;
}`,
    name: 'Ejemplo Básico',
  },
  calculator: {
    html: `<div class="calculator">
  <div class="display">
    <input type="text" id="display" readonly>
  </div>
  <div class="buttons">
    <button onclick="clearDisplay()" class="clear">C</button>
    <button onclick="deleteLast()" class="delete">⌫</button>
    <button onclick="appendToDisplay('/')" class="operator">÷</button>
    <button onclick="appendToDisplay('*')" class="operator">×</button>
    
    <button onclick="appendToDisplay('7')">7</button>
    <button onclick="appendToDisplay('8')">8</button>
    <button onclick="appendToDisplay('9')">9</button>
    <button onclick="appendToDisplay('-')" class="operator">−</button>
    
    <button onclick="appendToDisplay('4')">4</button>
    <button onclick="appendToDisplay('5')">5</button>
    <button onclick="appendToDisplay('6')">6</button>
    <button onclick="appendToDisplay('+')" class="operator">+</button>
    
    <button onclick="appendToDisplay('1')">1</button>
    <button onclick="appendToDisplay('2')">2</button>
    <button onclick="appendToDisplay('3')">3</button>
    <button onclick="calculate()" class="equals" rowspan="2">=</button>
    
    <button onclick="appendToDisplay('0')" class="zero">0</button>
    <button onclick="appendToDisplay('.')">.</button>
  </div>
</div>`,
    css: `.calculator {
  max-width: 300px;
  margin: 50px auto;
  background: #2c3e50;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}

.display {
  margin-bottom: 15px;
}

#display {
  width: 100%;
  height: 60px;
  font-size: 24px;
  text-align: right;
  background: #34495e;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0 15px;
  box-sizing: border-box;
}

.buttons {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

button {
  height: 50px;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(0,0,0,0.2);
}

button:active {
  transform: translateY(0);
}

button:not(.operator):not(.equals):not(.clear):not(.delete) {
  background: #95a5a6;
  color: #2c3e50;
}

.operator {
  background: #e67e22;
  color: white;
}

.equals {
  background: #27ae60;
  color: white;
  grid-row: span 2;
}

.clear {
  background: #e74c3c;
  color: white;
}

.delete {
  background: #f39c12;
  color: white;
}

.zero {
  grid-column: span 2;
}`,
    js: `let display = document.getElementById('display');
let currentInput = '';
let operator = '';
let previousInput = '';

function appendToDisplay(value) {
  if (display.value === '0' && value !== '.') {
    display.value = value;
  } else {
    display.value += value;
  }
}

function clearDisplay() {
  display.value = '';
  currentInput = '';
  operator = '';
  previousInput = '';
}

function deleteLast() {
  display.value = display.value.slice(0, -1);
}

function calculate() {
  try {
    // Reemplazar símbolos para evaluación
    let expression = display.value;
    expression = expression.replace(/×/g, '*');
    expression = expression.replace(/÷/g, '/');
    expression = expression.replace(/−/g, '-');
    
    let result = eval(expression);
    display.value = result;
  } catch (error) {
    display.value = 'Error';
    setTimeout(() => {
      clearDisplay();
    }, 1500);
  }
}`,
    name: 'Calculadora',
  },
};

function App() {
  const [html, setHtml] = useLocalStorage('code-editor-html', '');
  const [css, setCss] = useLocalStorage('code-editor-css', '');
  const [js, setJs] = useLocalStorage('code-editor-js', '');
  const [theme, setTheme] = useLocalStorage('code-editor-theme', 'dark');
  const [isAutoRun, setIsAutoRun] = useLocalStorage('code-editor-autorun', true);
  const [showSettings, setShowSettings] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [copied, setCopied] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Función para ejecutar el código
  const runCode = useCallback(() => {
    if (iframeRef.current) {
      const srcDoc = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            ${css}
          </style>
        </head>
        <body>
          ${html}
          <script>
            window.parent.postMessage({ type: 'run-start' }, '*');

            function __serialize(args) {
              return args.map(function(a) {
                if (a === null) return 'null';
                if (a === undefined) return 'undefined';
                if (typeof a === 'object') { try { return JSON.stringify(a); } catch(e) { return String(a); } }
                return String(a);
              }).join(' ');
            }

            const originalLog = console.log;
            const originalError = console.error;
            const originalWarn = console.warn;
            const originalInfo = console.info;

            console.log = function(...args) {
              originalLog.apply(console, args);
              window.parent.postMessage({ type: 'console', level: 'log', message: __serialize(args) }, '*');
            };
            console.error = function(...args) {
              originalError.apply(console, args);
              window.parent.postMessage({ type: 'console', level: 'error', message: __serialize(args) }, '*');
            };
            console.warn = function(...args) {
              originalWarn.apply(console, args);
              window.parent.postMessage({ type: 'console', level: 'warn', message: __serialize(args) }, '*');
            };
            console.info = function(...args) {
              originalInfo.apply(console, args);
              window.parent.postMessage({ type: 'console', level: 'info', message: __serialize(args) }, '*');
            };

            window.addEventListener('error', function(e) {
              console.error('Error:', e.message);
              document.body.innerHTML += '<div style="background: #ffebee; color: #c62828; padding: 10px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #c62828;"><strong>Error:</strong> ' + e.message + '</div>';
            });

            try {
              ${js}
            } catch (error) {
              console.error('JavaScript Error:', error.message);
              document.body.innerHTML += '<div style="background: #ffebee; color: #c62828; padding: 10px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #c62828;"><strong>Error:</strong> ' + error.message + '</div>';
            }
          </script>
        </body>
        </html>
      `;
      iframeRef.current.srcdoc = srcDoc;
    }
  }, [html, css, js]);

  // Auto-ejecutar con debounce
  useEffect(() => {
    if (isAutoRun) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(runCode, 300);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [html, css, js, isAutoRun, runCode]);

  // Carga estado desde URL hash al montar (tiene prioridad sobre localStorage)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const decoded = decodeState(hash);
    if (!decoded) return;
    setHtml(decoded.html);
    setCss(decoded.css);
    setJs(decoded.js);
  }, [setHtml, setCss, setJs]);

  // Actualiza el hash al cambiar el código (debounced, sin crear entradas en historial)
  useEffect(() => {
    const id = setTimeout(() => {
      const encoded = encodeState(html, css, js);
      window.history.replaceState(null, '', encoded ? `#${encoded}` : window.location.pathname);
    }, 500);
    return () => clearTimeout(id);
  }, [html, css, js]);

  // Funciones de utilidad
  const saveProject = () => {
    const project = {
      html,
      css,
      js,
      timestamp: new Date().toISOString(),
      name: `Proyecto ${new Date().toLocaleDateString()}`,
    };

    const blob = new Blob([JSON.stringify(project, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'codigo-proyecto.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadProject = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        try {
          const project = JSON.parse(e.target?.result as string) as {
            html?: string;
            css?: string;
            js?: string;
          };
          setHtml(project.html ?? '');
          setCss(project.css ?? '');
          setJs(project.js ?? '');
        } catch {
          alert('Error al cargar el archivo. Asegúrate de que sea un archivo JSON válido.');
        }
      };
      reader.readAsText(file);
      setSelectedTemplate('blank');
    }
  };

  const resetCode = () => {
    if (confirm('¿Estás seguro de que quieres resetear todo el código?')) {
      setHtml('');
      setCss('');
      setJs('');
      setSelectedTemplate('blank');
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  const loadTemplate = (templateKey: keyof typeof templates) => {
    const template = templates[templateKey];
    setHtml(template.html);
    setCss(template.css);
    setJs(template.js);
    setSelectedTemplate(templateKey);
  };

  const exportHTML = () => {
    const fullHTML = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mi Proyecto</title>
  <style>
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    ${js}
  </script>
</body>
</html>`;

    const blob = new Blob([fullHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'proyecto.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareProject = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt('Copia este enlace:', window.location.href);
    }
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const toggleSettings = () => setShowSettings(!showSettings);
  const toggleConsole = () => setShowConsole(!showConsole);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} ${showConsole ? 'pb-64' : ''}`}>
      {/* Barra de herramientas */}
      <div
        className={`${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} p-3`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              🚀 Editor de Código
            </h1>

            {/* Plantillas */}
            <select
              value={selectedTemplate}
              onChange={e => loadTemplate(e.target.value)}
              className={`px-3 py-1 rounded text-sm ${
                theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
              } border focus:outline-none focus:ring-2 focus:ring-blue-500`}>
              <option value="blank">🗒️ En Blanco</option>
              <option value="basic">🎨 Ejemplo Básico</option>
              <option value="calculator">🧮 Calculadora</option>
            </select>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Controles */}
            <button
              onClick={runCode}
              disabled={isAutoRun}
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
                isAutoRun ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-600'
              } bg-green-500 text-white`}>
              <Play size={16} />
              Ejecutar
            </button>

            <button
              onClick={saveProject}
              className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors">
              <Save size={16} />
              Guardar
            </button>

            <button
              onClick={shareProject}
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
                copied ? 'bg-green-600 text-white' : 'bg-teal-500 text-white hover:bg-teal-600'
              }`}>
              <Share2 size={16} />
              {copied ? '¡Copiado!' : 'Compartir'}
            </button>

            <label className="flex items-center gap-2 px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 transition-colors cursor-pointer">
              <Upload size={16} />
              Cargar
              <input type="file" accept=".json" onChange={loadProject} className="hidden" />
            </label>

            <button
              onClick={exportHTML}
              className="flex items-center gap-2 px-3 py-1 bg-indigo-500 text-white rounded text-sm hover:bg-indigo-600 transition-colors">
              <Download size={16} />
              Exportar
            </button>

            <button
              onClick={resetCode}
              className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors">
              <RotateCcw size={16} />
              Reset
            </button>

            <button
              onClick={toggleConsole}
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
                showConsole
                  ? 'bg-green-600 text-white'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}>
              <Terminal size={16} />
              Consola
            </button>

            <button
              onClick={toggleSettings}
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}>
              <Settings size={16} />
              Config
            </button>

            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              {theme === 'dark' ? 'Claro' : 'Oscuro'}
            </button>
          </div>
        </div>

        {/* Panel de configuración */}
        {showSettings && (
          <div
            className={`mt-3 p-3 rounded ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-4 flex-wrap">
              <label className={`flex items-center gap-2 text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                <input
                  type="checkbox"
                  checked={isAutoRun}
                  onChange={e => setIsAutoRun(e.target.checked)}
                  className="rounded"
                />
                Ejecutar automáticamente
              </label>

              <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Los cambios se ejecutan automáticamente con un retraso de 300ms
              </span>

              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                <strong>Atajos de teclado:</strong>
                <div className="mt-1 space-y-1">
                  <div>Ctrl+Enter: Ejecutar | Ctrl+S: Guardar | Ctrl+D: Cambiar tema</div>
                  <div>Ctrl+Shift+R: Reset | Ctrl+,: Configuración</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editores */}
      <div className={`flex ${showConsole ? 'h-[40vh]' : 'h-[50vh]'} p-3 gap-0 flex-wrap lg:flex-nowrap`}>
        <Editor language="xml" displayName="HTML" value={html} onChange={setHtml} theme={theme} />
        <Editor language="css" displayName="CSS" value={css} onChange={setCss} theme={theme} />
        <Editor language="javascript" displayName="JavaScript" value={js} onChange={setJs} theme={theme} />
      </div>

      {/* Vista previa */}
      <div
        className={`${showConsole ? 'h-[35vh]' : 'h-[45vh]'} m-3 rounded-lg overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div
          className={`px-4 py-2 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-800'} border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} font-medium text-sm`}>
          <span className="flex items-center gap-2">
            👁️ Vista Previa
            <span className="text-xs opacity-70">Resultado en tiempo real</span>
          </span>
        </div>
        <iframe
          ref={iframeRef}
          title="output"
          sandbox="allow-scripts allow-modals allow-forms allow-popups allow-popups-to-escape-sandbox"
          className="w-full h-full bg-white border-0"
        />
      </div>

      {/* Componentes adicionales */}
      <KeyboardShortcuts
        onRun={runCode}
        onSave={saveProject}
        onReset={resetCode}
        onToggleTheme={toggleTheme}
        onToggleSettings={toggleSettings}
      />

      <ConsolePanel theme={theme} isVisible={showConsole} onToggle={toggleConsole} />
    </div>
  );
}

export default App;
