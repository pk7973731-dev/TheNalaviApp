import React, { useState } from 'react';
import { X, BookOpen, Check, ExternalLink, Sparkles, MessageCircle, FileText } from 'lucide-react';
import { AGRICULTURAL_SCHEMES } from '../data/schemes';
import { SchemeInfo } from '../types';

interface SchemesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSchemeToAsk: (schemeName: string) => void;
}

export const SchemesDrawer: React.FC<SchemesDrawerProps> = ({
  isOpen,
  onClose,
  onSelectSchemeToAsk,
}) => {
  const [selectedScheme, setSelectedScheme] = useState<SchemeInfo>(AGRICULTURAL_SCHEMES[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-900/50 backdrop-blur-2xs">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-stone-300 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="bg-emerald-900 text-white p-4 flex items-center justify-between border-b border-emerald-950">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold font-serif">
                மத்திய & மாநில அரசு உழவர் நல திட்டங்கள்
              </h2>
              <p className="text-[11px] text-emerald-200">
                Official Agricultural Schemes & Subsidies Guide (Coimbatore)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Schemes List (Left Strip) */}
          <div className="w-1/3 border-r border-stone-200 overflow-y-auto bg-stone-50 divide-y divide-stone-200">
            {AGRICULTURAL_SCHEMES.map((scheme) => {
              const isSelected = selectedScheme.id === scheme.id;
              return (
                <button
                  key={scheme.id}
                  onClick={() => setSelectedScheme(scheme)}
                  className={`w-full text-left p-3 text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-100 text-emerald-950 font-bold border-l-4 border-l-emerald-800'
                      : 'text-stone-700 hover:bg-stone-100 font-medium'
                  }`}
                >
                  <div className="truncate">{scheme.tamilName.split('(')[0]}</div>
                  <div className="text-[10px] text-stone-500 truncate mt-0.5">{scheme.name}</div>
                  {scheme.subsidyRate && (
                    <span className="inline-block mt-1 bg-emerald-200/70 text-emerald-900 text-[9px] px-1 rounded font-semibold">
                      {scheme.subsidyRate}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Scheme Details (Right View) */}
          <div className="w-2/3 p-4 overflow-y-auto space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-wider bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded font-bold border border-emerald-300">
                  {selectedScheme.category.toUpperCase()}
                </span>
                {selectedScheme.subsidyRate && (
                  <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                    மானிய விகிதம்: {selectedScheme.subsidyRate}
                  </span>
                )}
              </div>
              <h3 className="text-base font-black text-stone-900 mt-2 font-serif">
                {selectedScheme.tamilName}
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">{selectedScheme.name}</p>
            </div>

            {/* Quick Ask AI button */}
            <button
              onClick={() => {
                onSelectSchemeToAsk(`இந்த திட்டம் பற்றி விவரங்கள் கூறவும்: ${selectedScheme.name}`);
                onClose();
              }}
              className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded border border-emerald-950 shadow-xs cursor-pointer flex items-center justify-center space-x-1.5 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>இத்திட்டம் பற்றி AI உதவியாளரிடம் கேள் (Ask AI)</span>
            </button>

            {/* Description */}
            <div className="bg-stone-50 border border-stone-200 p-3 rounded text-xs space-y-1">
              <div className="font-bold text-stone-900">விளக்கம் / Summary:</div>
              <p className="text-stone-700 leading-relaxed">{selectedScheme.tamilShortDesc}</p>
            </div>

            {/* Benefits */}
            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-stone-900 flex items-center space-x-1">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>நன்மைகள் (Key Benefits):</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-stone-700 leading-relaxed">
                {selectedScheme.tamilBenefits.map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            </div>

            {/* Eligibility */}
            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-stone-900">விவசாயி தகுதி (Eligibility):</div>
              <ul className="list-disc pl-5 space-y-1 text-stone-700 leading-relaxed">
                {selectedScheme.tamilEligibility.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>

            {/* Documents Required */}
            <div className="bg-amber-50/70 border border-amber-200 p-3 rounded text-xs space-y-1.5">
              <div className="font-bold text-amber-950 flex items-center space-x-1">
                <FileText className="w-3.5 h-3.5 text-amber-800" />
                <span>தேவையான அரசு ஆவணங்கள் (Documents Needed):</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-amber-900 leading-relaxed">
                {selectedScheme.tamilDocumentsRequired.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>

            {/* How to apply */}
            <div className="space-y-1 text-xs border-t border-stone-200 pt-3">
              <div className="font-bold text-stone-900">விண்ணப்பிக்கும் முறை (How to Apply):</div>
              <p className="text-stone-700 leading-relaxed">{selectedScheme.tamilHowToApply}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
