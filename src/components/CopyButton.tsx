// src/components/CopyButton.tsx
import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  className?: string;
}

const CopyButton = ({ text, className = "relative" }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={className}>
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-purple-500/20 bg-purple-500/5 text-purple-300 hover:bg-purple-500/15 hover:border-purple-500/30 hover:text-purple-200 active:scale-95 transition-all cursor-pointer select-none"
        aria-label={copied ? "Copied code" : "Copy code"}
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-purple-400 animate-in zoom-in duration-200" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 text-purple-400/80 group-hover:text-purple-300 transition-colors" />
            <span>Copy</span>
          </>
        )}
      </button>
    </div>
  );
};

export default CopyButton;