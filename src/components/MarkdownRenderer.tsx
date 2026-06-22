// src/components/MarkdownRenderer.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import slugify from 'slugify';
import CopyButton from './CopyButton';
import { Terminal } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  onImageClick?: (src: string) => void;
}

export default function MarkdownRenderer({ content, onImageClick }: MarkdownRendererProps) {
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
                <Terminal className="w-4 h-4 text-purple-400" />
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
    },

    // Custom Images rendering with zoom support
    img({ ...props }: any) { 
      const isRelative = props.src && props.src.startsWith('/');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://api.ravell.tech';
      const fullSrc = isRelative ? `${apiBaseUrl}${props.src}` : props.src;
      return (
        <figure className="my-8">
          <img
            {...props}
            src={fullSrc}
            className="w-full h-auto rounded-lg shadow-md cursor-zoom-in hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-800"
            onClick={() => onImageClick && onImageClick(fullSrc)}
            loading="lazy"
          />
          {props.alt && (
            <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
              {props.alt}
            </figcaption>
          )}
        </figure>
      );
    },

    // Custom Headings (H2) rendering with auto-ID slugification for ToC jump anchors
    h2: ({ children }) => {
      const text = React.Children.toArray(children).join('');
      const id = slugify(text, { lower: true, strict: true });
      return (
        <h2 id={id} className="group flex items-center gap-2 text-2xl md:text-3xl font-bold mt-12 mb-6 text-gray-900 dark:text-white scroll-mt-24">
          {children}
          <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-purple-500 transition-opacity" aria-label="Link to this section">
            
          </a>
        </h2>
      );
    },

    // Custom Headings (H3) rendering with auto-ID slugification
    h3: ({ children }) => {
      const text = React.Children.toArray(children).join('');
      const id = slugify(text, { lower: true, strict: true });
      return (
        <h3 id={id} className="group flex items-center gap-2 text-xl md:text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white scroll-mt-24">
          {children}
        </h3>
      );
    },

    // Prevent wrapping images inside paragraphs
    p({ children }) {
      const hasImg = React.Children.toArray(children).some(
        (child) =>
          React.isValidElement(child) &&
          (child.type === 'img' || (typeof child.type === 'function' && child.type.name === 'img'))
      );
      if (hasImg) {
        return <>{children}</>;
      }
      return <p className="leading-relaxed mb-6">{children}</p>;
    },

    // Custom Blockquote rendering
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20 p-4 my-6 rounded-r-lg text-gray-700 dark:text-gray-300 italic">
        {children}
      </blockquote>
    ),
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
