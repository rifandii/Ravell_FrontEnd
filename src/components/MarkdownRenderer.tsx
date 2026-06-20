// src/components/MarkdownRenderer.tsx
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import CopyButton from './CopyButton';
import { Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const components: Components = {
    // Override standard code blocks
    code({ className, children, ...props }) {
      const match = /language-([^\s]+)/.exec(className || '');
      const isBlockCode = (className && className.startsWith('language-')) || 
                          (children && typeof children === 'string' && children.includes('\n'));
      
      const codeText = String(children)
        .replace(/\n$/, '')
        .replace(/^`+|`+$/g, '');

      const language = match ? match[1] : 'text';

      if (isBlockCode) {
        return (
          <div className="my-6 rounded-lg overflow-hidden border border-[#333] bg-[#1e1e1e] shadow-2xl relative group font-mono text-sm">
            {/* Header Toolbar */}
            <div className="flex items-center justify-between px-4 h-10 bg-[#252526] border-b border-[#1e1e1e] select-none">
              <div className="flex items-center gap-3">
                <Terminal className="w-4 h-4 text-blue-400" />
                <span className="text-xs text-gray-300 font-medium uppercase tracking-wider">
                  {language}
                </span>
              </div>
              
              {/* Copy button container */}
              <div className="flex items-center h-full relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                <CopyButton text={codeText} />
              </div>
            </div>
            
            {/* Code highlight layout with layout prevention */}
            <div className="overflow-x-auto">
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={language}
                PreTag="div"
                showLineNumbers={true}
                customStyle={{ 
                  margin: 0, 
                  padding: '1.25rem', 
                  background: 'transparent', 
                  fontSize: '0.9rem', 
                  lineHeight: '1.6' 
                }}
                {...(props as any)}
              >
                {codeText}
              </SyntaxHighlighter>
            </div>
          </div>
        );
      }

      // Inline code block rendering
      return (
        <code className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-red-600 dark:text-red-400 font-mono text-sm font-medium" {...props}>
          {children}
        </code>
      );
    },
    // Table block override to prevent layout breaks in parent grid/flex views
    table({ children }) {
      return (
        <div className="overflow-x-auto my-6 w-full">
          <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-800 text-left text-sm">
            {children}
          </table>
        </div>
      );
    }
  };

  return (
    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
