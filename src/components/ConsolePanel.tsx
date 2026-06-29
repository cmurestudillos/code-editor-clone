import { useState, useEffect, useRef } from 'react';
import { Terminal, X, Trash2 } from 'lucide-react';

interface ConsoleMessage {
  id: number;
  type: 'log' | 'error' | 'warn' | 'info' | 'separator';
  message: string;
  timestamp: Date;
}

interface ConsolePanelProps {
  theme: 'dark' | 'light';
  isVisible: boolean;
  onToggle: () => void;
}

const ConsolePanel = ({ theme, isVisible, onToggle }: ConsolePanelProps) => {
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageIdCounter = useRef(0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'run-start') {
        setMessages(prev => {
          if (prev.length === 0) return prev;
          return [...prev, { id: messageIdCounter.current++, type: 'separator', message: '', timestamp: new Date() }];
        });
        return;
      }

      if (event.data?.type === 'console') {
        const newMessage: ConsoleMessage = {
          id: messageIdCounter.current++,
          type: event.data.level || 'log',
          message: event.data.message,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, newMessage]);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const clearConsole = () => setMessages([]);

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '📝';
    }
  };

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'error':
        return theme === 'dark' ? 'text-red-400' : 'text-red-600';
      case 'warn':
        return theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600';
      case 'info':
        return theme === 'dark' ? 'text-blue-400' : 'text-blue-600';
      default:
        return theme === 'dark' ? 'text-gray-300' : 'text-gray-700';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 h-64 ${
        theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
      } border-t z-50 flex flex-col`}>
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-2 ${
          theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-100 border-gray-200'
        } border-b`}>
        <div className="flex items-center gap-2">
          <Terminal size={16} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
          <span className={`font-medium text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>Consola</span>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
            }`}>
            {messages.filter(m => m.type !== 'separator').length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearConsole}
            className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            title="Limpiar consola">
            <Trash2 size={14} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
          </button>

          <button
            onClick={onToggle}
            className={`p-1 rounded transition-colors ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
            title="Cerrar consola">
            <X size={14} className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {messages.length === 0 ? (
          <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            <Terminal size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">La consola está vacía</p>
            <p className="text-xs">Los mensajes de console.log aparecerán aquí</p>
          </div>
        ) : (
          messages.map(message =>
            message.type === 'separator' ? (
              <div
                key={message.id}
                className={`flex items-center gap-2 my-1 text-xs ${
                  theme === 'dark' ? 'text-gray-600' : 'text-gray-300'
                }`}>
                <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
                <span>nueva ejecución</span>
                <div className={`flex-1 h-px ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`} />
              </div>
            ) : (
              <div
                key={message.id}
                className={`flex items-start gap-2 px-2 py-1 rounded text-sm font-mono ${
                  theme === 'dark' ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                } transition-colors`}>
                <span className="flex-shrink-0 text-xs">{getMessageIcon(message.type)}</span>
                <span className={`flex-1 whitespace-pre-wrap break-all ${getMessageColor(message.type)}`}>
                  {message.message}
                </span>
                <span className={`flex-shrink-0 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            )
          )
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ConsolePanel;
