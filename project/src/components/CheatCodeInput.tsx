import { useEffect, useRef } from 'react';

interface CheatCodeInputProps {
  onCodeEntered: () => void;
  cheatCode: string;
}

export default function CheatCodeInput({ onCodeEntered, cheatCode }: CheatCodeInputProps) {
  const keysPressedRef = useRef<string[]>([]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressedRef.current = [...keysPressedRef.current, key].slice(-cheatCode.length);
      const currentCode = keysPressedRef.current.join('');

      if (currentCode === cheatCode) {
        onCodeEntered();
        keysPressedRef.current = [];
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [onCodeEntered, cheatCode]);

  return null;
}