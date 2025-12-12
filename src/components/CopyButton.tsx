// src/components/CopyButton.tsx
import { useState } from 'react';

interface CopyButtonProps {
  text: string;
}

const CopyButton = ({ text }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text); // Menggunakan API clipboard browser
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset state setelah 2 detik
  };

  return (
    <div className="absolute top-2 right-2">
      <button
        onClick={handleCopy}
        className="bg-gray-700 text-white text-xs px-2 py-1 rounded hover:bg-gray-600 transition-colors"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  );
};

export default CopyButton;