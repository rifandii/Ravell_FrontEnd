// src/components/CodeBlock.tsx
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Terminal, Copy, Check, ExternalLink, Sparkles } from 'lucide-react';

interface CodeBlockProps {
  codeText: string;
  language: string;
}

const CodeBlock = ({ codeText, language }: CodeBlockProps) => {
  const [copied, setCopied] = useState(false);
  const [isHoverHighlightEnabled, setIsHoverHighlightEnabled] = useState(true);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExtern = () => {
    const w = 900;
    const h = 700;
    const left = window.screen.width / 2 - w / 2;
    const top = window.screen.height / 2 - h / 2;
    
    const newWin = window.open(
      '', 
      '_blank', 
      `width=${w},height=${h},top=${top},left=${left},resizable=yes,scrollbars=yes,status=no,toolbar=no,menubar=no,location=no`
    );

    if (newWin) {
      newWin.document.open();
      newWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Raw Code - ${language}</title>
            <meta charset="utf-8">
            <style>
              body {
                background-color: #07050e;
                color: #e9d5ff;
                font-family: 'Consolas', 'Courier New', Courier, monospace;
                font-size: 0.95rem;
                line-height: 1.6;
                padding: 2.5rem;
                margin: 0;
                white-space: pre-wrap;
                word-wrap: break-word;
              }
              ::selection {
                background-color: #6b21a8;
                color: #ffffff;
              }
            </style>
          </head>
          <body>${escapeHtml(codeText)}</body>
        </html>
      `);
      newWin.document.close();
    }
  };

  const escapeHtml = (text: string) => {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

  const isDefaultLang = ['text', 'plaintext'].includes(language.toLowerCase());

  return (
    <div className="my-6 rounded-2xl overflow-hidden border border-gray-200 dark:border-purple-900/30 bg-[#07050e] dark:bg-[#07050e]/95 backdrop-blur shadow-xl dark:shadow-purple-950/15 relative group font-mono text-sm">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between px-4 h-11 bg-gray-50/80 dark:bg-[#120e22]/90 border-b border-gray-200 dark:border-purple-950/50 select-none">
        <div className="flex items-center gap-3">
          <Terminal className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          {!isDefaultLang && (
            <span className="text-xs text-gray-500 dark:text-purple-300 font-bold uppercase tracking-wider">
              {language}
            </span>
          )}
        </div>
        
        {/* Toolbar Buttons */}
        <div className="flex items-center gap-2">
          {/* Copy Button */}
          <div className="relative group/tooltip">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border border-purple-500/20 bg-purple-500/5 text-purple-600 dark:text-purple-300 hover:bg-purple-500/15 hover:border-purple-500/30 hover:text-purple-200 active:scale-95 transition-all cursor-pointer select-none"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400 animate-in zoom-in duration-200" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-purple-600/70 dark:text-purple-400/70 group-hover/tooltip:text-purple-300" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[10px] font-semibold text-white bg-gray-950 dark:bg-gray-900 rounded-md opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg border border-gray-800 z-20">
              Copy code to clipboard
            </span>
          </div>

          {/* Extern Button */}
          <div className="relative group/tooltip">
            <button
              onClick={handleExtern}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border border-purple-500/20 bg-purple-500/5 text-purple-600 dark:text-purple-300 hover:bg-purple-500/15 hover:border-purple-500/30 hover:text-purple-200 active:scale-95 transition-all cursor-pointer select-none"
            >
              <ExternalLink className="w-3.5 h-3.5 text-purple-600/70 dark:text-purple-400/70 group-hover/tooltip:text-purple-300" />
              <span>Extern</span>
            </button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[10px] font-semibold text-white bg-gray-950 dark:bg-gray-900 rounded-md opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg border border-gray-800 z-20">
              Open code in new window
            </span>
          </div>

          {/* EnlighterJS Button */}
          <div className="relative group/tooltip">
            <button
              onClick={() => {
                setIsHoverHighlightEnabled(!isHoverHighlightEnabled);
                setHoveredLine(null);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all cursor-pointer select-none ${
                isHoverHighlightEnabled
                  ? 'bg-purple-600 border-purple-500 text-white shadow-sm shadow-purple-500/30 hover:bg-purple-700'
                  : 'border-purple-500/20 bg-purple-500/5 text-purple-600 dark:text-purple-300 hover:bg-purple-500/15 hover:border-purple-500/30 hover:text-purple-200'
              }`}
            >
              <Sparkles className={`w-3.5 h-3.5 ${isHoverHighlightEnabled ? 'text-white' : 'text-purple-600/70 dark:text-purple-400/70'}`} />
              <span>EnlighterJS</span>
            </button>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 text-[10px] font-semibold text-white bg-gray-950 dark:bg-gray-900 rounded-md opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg border border-gray-800 z-20">
              {isHoverHighlightEnabled ? 'Disable hover highlighting' : 'Enable hover line-highlighting'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Code highlight layout with layout prevention */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language}
          PreTag="div"
          showLineNumbers={true}
          wrapLines={true}
          lineNumberStyle={{
            color: 'rgba(167, 139, 250, 0.4)',
            paddingRight: '1rem',
            borderRight: '1px solid rgba(167, 139, 250, 0.15)',
            marginRight: '0.75rem',
            minWidth: '2.5rem',
            textAlign: 'right',
            userSelect: 'none'
          }}
          lineProps={(lineNumber) => {
            const style: React.CSSProperties = {
              display: 'block',
              width: '100%',
              paddingLeft: '0.5rem',
              cursor: isHoverHighlightEnabled ? 'pointer' : 'default',
              transition: 'background-color 0.15s ease, border-left-color 0.15s ease'
            };
            
            if (isHoverHighlightEnabled && hoveredLine === lineNumber) {
              style.backgroundColor = 'rgba(139, 92, 246, 0.15)'; // purple-500/15
              style.borderLeft = '3px solid #8b5cf6';
              style.paddingLeft = 'calc(0.5rem - 3px)'; // adjust to offset border
            } else {
              style.borderLeft = '3px solid transparent';
            }

            return {
              style,
              onMouseEnter: () => {
                if (isHoverHighlightEnabled) setHoveredLine(lineNumber);
              },
              onMouseLeave: () => {
                if (isHoverHighlightEnabled) setHoveredLine(null);
              }
            };
          }}
          customStyle={{ 
            margin: 0, 
            padding: '1.25rem 1.25rem 1.25rem 0.5rem', 
            background: 'transparent', 
            fontSize: '0.875rem', 
            lineHeight: '1.7',
            fontFamily: 'Consolas, Monaco, monospace'
          }}
          codeTagProps={{
            style: {
              fontFamily: 'Consolas, Monaco, monospace'
            }
          }}
        >
          {codeText}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default CodeBlock;
