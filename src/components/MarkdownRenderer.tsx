// src/components/MarkdownRenderer.tsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import slugify from 'slugify';
import CodeBlock from './CodeBlock';
import { API_BASE_URL } from '../lib/apiConfig';

interface MarkdownRendererProps {
  content: string;
  onImageClick?: (src: string) => void;
}

// Central markdown renderer shared by Next server and client article views.
// Keep URL normalization here so server and client article views stay consistent.
export default function MarkdownRenderer({ content, onImageClick }: MarkdownRendererProps) {
  const components: Components = {
    // Avoid nested <pre> wrappers because CodeBlock owns the final code container.
    pre({ children }) {
      return <>{children}</>;
    },
    // Route fenced code blocks to the syntax highlighter while keeping inline code lightweight.
    code({ className, children, ...props }) {
      const match = /language-([^\s]+)/.exec(className || '');
      const isBlockCode = (className && className.startsWith('language-')) ||
                          (children && typeof children === 'string' && children.includes('\n'));

      const codeText = String(children)
        .replace(/\n$/, '')
        .replace(/^`+|`+$/g, '');

      const language = match ? match[1] : 'text';

      if (isBlockCode) {
        return <CodeBlock codeText={codeText} language={language} />;
      }

      // Inline code block rendering
      return (
        <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-purple-950/35 text-purple-600 dark:text-purple-300 font-mono text-sm font-semibold border border-gray-200 dark:border-purple-900/20" {...props}>
          {children}
        </code>
      );
    },

    // Tables need explicit wrappers so wide technical tables remain scrollable on mobile.
    table({ children }) {
      return (
        <div className="my-6 overflow-hidden rounded-2xl border border-gray-200 dark:border-purple-900/30 bg-white dark:bg-gray-900/40 shadow-md dark:shadow-black/10">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm font-sans" style={{ display: 'table', tableLayout: 'auto', borderCollapse: 'collapse' }}>
              {children}
            </table>
          </div>
        </div>
      );
    },
    thead({ children }) {
      return (
        <thead className="bg-purple-50/70 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300 text-xs font-bold uppercase tracking-wider border-b-2 border-purple-100 dark:border-purple-950/60" style={{ display: 'table-header-group' }}>
          {children}
        </thead>
      );
    },
    tbody({ children }) {
      return (
        <tbody className="divide-y divide-gray-100 dark:divide-purple-950/20 bg-transparent" style={{ display: 'table-row-group' }}>
          {children}
        </tbody>
      );
    },
    tr({ children }) {
      return (
        <tr className="hover:bg-purple-50/30 dark:hover:bg-purple-950/10 transition-colors duration-150" style={{ display: 'table-row' }}>
          {children}
        </tr>
      );
    },
    th({ children }) {
      return (
        <th className="px-6 py-4 font-bold text-left text-purple-900 dark:text-purple-300" style={{ display: 'table-cell', verticalAlign: 'middle', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          {children}
        </th>
      );
    },
    td({ children }) {
      return (
        <td className="px-6 py-4 text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-purple-950/10" style={{ display: 'table-cell', verticalAlign: 'middle', paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          {children}
        </td>
      );
    },

    // Normalize relative backend image paths and keep zoom support opt-in for article pages.
    img(props) {
      const src = typeof props.src === 'string' ? props.src : undefined;
      const alt = typeof props.alt === 'string' ? props.alt : undefined;
      const isRelative = src?.startsWith('/') ?? false;
      const fullSrc = src && isRelative ? `${API_BASE_URL}${src}` : src;
      const imageClickProps = onImageClick && fullSrc
        ? { onClick: () => onImageClick(fullSrc) }
        : {};

      return (
        <figure className="my-8">
          <img
            {...props}
            {...imageClickProps}
            src={fullSrc}
            className="w-full h-auto rounded-lg shadow-md cursor-zoom-in hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-800"
            loading="lazy"
          />
          {alt && (
            <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
              {alt}
            </figcaption>
          )}
        </figure>
      );
    },

    // H2/H3 anchors are reused by the right-sidebar table of contents.
    h2: ({ children }) => {
      const text = React.Children.toArray(children).join('');
      const id = slugify(text, { lower: true, strict: true });
      return (
        <h2 id={id} className="group flex items-center gap-2 text-2xl md:text-3xl font-bold mt-12 mb-6 text-gray-900 dark:text-white scroll-mt-24">
          {children}
          <a href={`#${id}`} className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-purple-500 transition-opacity" aria-label="Link to this section">
            #
          </a>
        </h2>
      );
    },

    // H3 anchors stay aligned with generated table-of-contents links.
    h3: ({ children }) => {
      const text = React.Children.toArray(children).join('');
      const id = slugify(text, { lower: true, strict: true });
      return (
        <h3 id={id} className="group flex items-center gap-2 text-xl md:text-2xl font-bold mt-8 mb-4 text-gray-900 dark:text-white scroll-mt-24">
          {children}
        </h3>
      );
    },

    // ReactMarkdown wraps markdown images in paragraphs; unwrap them to keep figure layout valid.
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
