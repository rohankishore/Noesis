import { useState, useEffect } from 'react';

export default function GlitchText({ text, className = '' }) {
  const [glitchIndex, setGlitchIndex] = useState(-1);
  const [glitchSymbol, setGlitchSymbol] = useState('');
  
  const symbols = ['∑', '∫', 'π', 'φ', 'Ω', '∂', '∇', 'λ', 'α', 'β', 'θ', '⚡', '∞', '≈', '÷', '×', '±', '√', 'Δ'];

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * text.length);
      const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      setGlitchIndex(randomIndex);
      setGlitchSymbol(randomSymbol);
      
      setTimeout(() => {
        setGlitchIndex(-1);
      }, 120);
    }, 300);

    return () => clearInterval(glitchInterval);
  }, [text]);

  return (
    <div className={`relative inline-block ${className}`}>
      <div className="relative">
        {text.split('').map((char, index) => (
          <span
            key={index}
            className="relative inline-block"
            style={{
              animation: glitchIndex === index ? 'glitch 0.1s ease-in-out' : 'none'
            }}
          >
            {glitchIndex === index ? (
              <>
                <span className="opacity-0">{char}</span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                  {glitchSymbol}
                </span>
              </>
            ) : (
              <span className={className}>{char}</span>
            )}
          </span>
        ))}
      </div>

      <style jsx>{`
        @keyframes glitch {
          0%, 100% {
            transform: translate(0);
          }
          20% {
            transform: translate(-1px, 1px);
          }
          40% {
            transform: translate(-1px, -1px);
          }
          60% {
            transform: translate(1px, 1px);
          }
          80% {
            transform: translate(1px, -1px);
          }
        }
      `}</style>
    </div>
  );
}
