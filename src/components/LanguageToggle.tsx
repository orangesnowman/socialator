import React from 'react';
import { Language } from '../types';

interface LanguageToggleProps {
  language: Language;
  onToggle: (newLang: Language) => void;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ language, onToggle }) => {
  const isSpanish = language === 'es';

  return (
    <div className="flex items-center gap-2 select-none" id="language-toggle-wrapper">
      <button
        type="button"
        id="language-toggle-button"
        onClick={() => onToggle(isSpanish ? 'en' : 'es')}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 ${
          isSpanish ? 'bg-slate-700' : 'bg-slate-300'
        }`}
        role="switch"
        aria-checked={isSpanish}
        aria-label="Toggle language between English and Spanish"
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
            isSpanish ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
      <span className="text-sm font-semibold tracking-wide text-slate-700 min-w-[20px]" id="language-label">
        {language.toUpperCase()}
      </span>
    </div>
  );
};
