import React from 'react';
import { Shield, Volume2, UserCheck, BookOpen, LogOut, PhoneCall } from 'lucide-react';
import { VillageInfo } from '../types';

interface HeaderProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  onOpenVaoLogin: () => void;
  loggedInVao: VillageInfo | null;
  onVaoLogout: () => void;
  activeView: 'farmer' | 'vao';
  onSwitchView: (view: 'farmer' | 'vao') => void;
  onOpenSchemes: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLanguage,
  onLanguageChange,
  onOpenVaoLogin,
  loggedInVao,
  onVaoLogout,
  activeView,
  onSwitchView,
  onOpenSchemes,
}) => {
  return (
    <header className="bg-white border-b border-stone-300 sticky top-0 z-30 shadow-xs">
      {/* Tricolor top strip: Saffron, White, Green */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-amber-600"></div>
        <div className="flex-1 bg-stone-100"></div>
        <div className="flex-1 bg-emerald-700"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Government Brand & Emblem */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onSwitchView('farmer')}>
          <div className="w-12 h-12 rounded-full border-2 border-emerald-800 bg-emerald-50 flex items-center justify-center text-emerald-900 shrink-0 font-serif font-bold text-xl shadow-xs">
            🏛️
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-900 font-serif">
                Nalavi <span className="text-stone-700 font-medium text-base">| PACS PECHU (பாக்ஸ் பேச்சு)</span>
              </span>
              <span className="bg-emerald-100 text-emerald-900 text-xs px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider border border-emerald-300">
                VAO e-SEVAI Assistant
              </span>
            </div>
            <p className="text-xs text-stone-600 font-medium">
              Tamil Nadu Agricultural Schemes, PACS Cooperative Laws & VAO Services | வேளாண்மை, கூட்டுறவு & நில ஆவணங்கள்
            </p>
          </div>
        </div>

        {/* Action Controls: Language, Schemes, VAO Login */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="flex items-center space-x-1 bg-stone-100 px-2 py-1 rounded border border-stone-300 text-xs">
            <Volume2 className="w-3.5 h-3.5 text-stone-600" />
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent font-medium text-stone-800 focus:outline-hidden cursor-pointer"
              aria-label="Language selection"
            >
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="te">తెలుగు (Telugu)</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="ml">മലയാളം (Malayalam)</option>
            </select>
          </div>

          {/* Schemes Directory Button */}
          <button
            onClick={onOpenSchemes}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-stone-800 text-xs font-semibold rounded cursor-pointer transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-800" />
            <span>அரசு திட்டங்கள் (Schemes)</span>
          </button>

          {/* VAO Section / Login Button */}
          {loggedInVao ? (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onSwitchView(activeView === 'vao' ? 'farmer' : 'vao')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded border cursor-pointer transition-colors ${
                  activeView === 'vao'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>
                  {activeView === 'vao' ? '👨‍🌾 விவசாயி பக்கம் (Farmer Portal)' : '🏛️ VAO பக்கம் (VAO Portal)'}
                </span>
              </button>

              <div className="hidden md:flex items-center text-xs bg-emerald-50 text-emerald-900 border border-emerald-200 px-2 py-1 rounded">
                <UserCheck className="w-3 h-3 mr-1 text-emerald-700" />
                <span className="font-semibold">{loggedInVao.name} VAO</span>
              </div>

              <button
                onClick={onVaoLogout}
                title="Logout VAO"
                className="p-1.5 text-stone-600 hover:text-red-700 bg-stone-100 hover:bg-stone-200 rounded border border-stone-300 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenVaoLogin}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold rounded border border-emerald-950 shadow-xs cursor-pointer transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>VAO Login | கிராம நிர்வாக அலுவலர்</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
