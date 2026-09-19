import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FarmerChat } from './components/FarmerChat';
import { VaoPortal } from './components/VaoPortal';
import { VaoLoginModal } from './components/VaoLoginModal';
import { SchemesDrawer } from './components/SchemesDrawer';
import { VillageInfo } from './types';
import { COIMBATORE_VILLAGES } from './data/villages';

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<string>('ta');
  const [activeView, setActiveView] = useState<'farmer' | 'vao'>('farmer');
  const [loggedInVao, setLoggedInVao] = useState<VillageInfo | null>(null);
  const [isVaoModalOpen, setIsVaoModalOpen] = useState(false);
  const [isSchemesOpen, setIsSchemesOpen] = useState(false);

  // Restore saved VAO login session if any
  useEffect(() => {
    const savedVaoUser = localStorage.getItem('nalavi_vao_user');
    if (savedVaoUser) {
      const match = COIMBATORE_VILLAGES.find((v) => v.vaoUsername === savedVaoUser);
      if (match) {
        setLoggedInVao(match);
      }
    }
  }, []);

  const handleVaoLoginSuccess = (officer: VillageInfo) => {
    setLoggedInVao(officer);
    localStorage.setItem('nalavi_vao_user', officer.vaoUsername);
    setActiveView('vao');
  };

  const handleVaoLogout = () => {
    setLoggedInVao(null);
    localStorage.removeItem('nalavi_vao_user');
    setActiveView('farmer');
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 font-sans flex flex-col">
      {/* Official Government Header */}
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
        onOpenVaoLogin={() => setIsVaoModalOpen(true)}
        loggedInVao={loggedInVao}
        onVaoLogout={handleVaoLogout}
        activeView={activeView}
        onSwitchView={setActiveView}
        onOpenSchemes={() => setIsSchemesOpen(true)}
      />

      {/* Main Content: Either Farmer Voice/Text Portal or VAO Administration Portal */}
      <main className="flex-1">
        {activeView === 'farmer' ? (
          <FarmerChat
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            onOpenSchemes={() => setIsSchemesOpen(true)}
            onOpenVaoLogin={() => setIsVaoModalOpen(true)}
          />
        ) : (
          loggedInVao && (
            <VaoPortal
              currentVao={loggedInVao}
              onLogout={handleVaoLogout}
              onSwitchToFarmerView={() => setActiveView('farmer')}
            />
          )
        )}
      </main>

      {/* VAO Official Login Modal */}
      <VaoLoginModal
        isOpen={isVaoModalOpen}
        onClose={() => setIsVaoModalOpen(false)}
        onLoginSuccess={handleVaoLoginSuccess}
      />

      {/* Schemes Directory Drawer */}
      <SchemesDrawer
        isOpen={isSchemesOpen}
        onClose={() => setIsSchemesOpen(false)}
        onSelectSchemeToAsk={(schemePrompt) => {
          // Send query in chat by emitting custom event or letting FarmerChat pick it up
          setActiveView('farmer');
          const input = document.querySelector('input[type="text"]') as HTMLInputElement;
          if (input) {
            input.value = schemePrompt;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }}
      />
    </div>
  );
}
