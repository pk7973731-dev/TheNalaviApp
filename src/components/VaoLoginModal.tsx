import React, { useState } from 'react';
import { X, Shield, Lock, User, CheckCircle2, AlertCircle, Building } from 'lucide-react';
import { VillageInfo } from '../types';
import { COIMBATORE_VILLAGES } from '../data/villages';

interface VaoLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (officer: VillageInfo) => void;
}

export const VaoLoginModal: React.FC<VaoLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [username, setUsername] = useState('thondamuthur.gov.in');
  const [password, setPassword] = useState('thondamuthur');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/vao/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      // Find village info
      const village = COIMBATORE_VILLAGES.find(
        (v) =>
          v.vaoUsername.toLowerCase() === username.trim().toLowerCase() ||
          v.name.toLowerCase() === username.trim().toLowerCase() ||
          `#${v.id}` === username.trim() ||
          String(v.id) === username.trim()
      ) || {
        id: data.officer.id || 1,
        code: data.officer.code || 'V01',
        name: data.officer.village,
        nameTa: data.officer.villageTa || data.officer.village,
        normalizedName: data.officer.village.toLowerCase().replace(/[^a-z0-9]/g, ''),
        taluk: data.officer.taluk,
        district: data.officer.district,
        vaoUsername: data.officer.username,
        defaultPassword: password,
        vaoOfficerName: data.officer.officerName,
        vaoPhone: data.officer.contactPhone,
      };

      onLoginSuccess(village);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check username and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreconfiguredVillage = (village: VillageInfo) => {
    setUsername(village.vaoUsername);
    setPassword(village.defaultPassword);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white border border-stone-300 rounded-lg max-w-lg w-full shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header with National Emblem style */}
        <div className="bg-emerald-900 text-white p-4 flex items-center justify-between border-b border-emerald-950">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded bg-emerald-800 flex items-center justify-center text-amber-400 font-serif font-bold text-lg border border-emerald-700">
              🏛️
            </div>
            <div>
              <h2 className="text-base font-bold font-serif leading-tight">
                கிராம நிர்வாக அலுவலர் உள்நுழைவு (VAO Login)
              </h2>
              <p className="text-[11px] text-emerald-200 font-medium">
                Nalavi VAO Portal | 20 முன்னோடி கிராம நிர்வாக அலுவலர் போர்ட்டல்
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

        <div className="p-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick 1-Click Village Picker for convenient reviewer testing */}
          <div className="bg-stone-50 border border-stone-200 p-3 rounded text-xs space-y-2">
            <div className="flex items-center justify-between font-bold text-stone-800">
              <span>அலுவலர் கிராமத்தை தேர்வு செய்க (Choose Pilot Village):</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-bold">20 Villages</span>
            </div>
            <select
              onChange={(e) => {
                const found = COIMBATORE_VILLAGES.find((v) => String(v.id) === e.target.value);
                if (found) handleSelectPreconfiguredVillage(found);
              }}
              value={
                COIMBATORE_VILLAGES.find((v) => v.vaoUsername === username)?.id || 5
              }
              className="w-full bg-white border border-stone-300 rounded p-2 text-xs text-stone-900 focus:outline-hidden font-medium"
            >
              <optgroup label="📍 கோவை தெற்கு வட்டம் (Coimbatore South - 15 Villages)">
                {COIMBATORE_VILLAGES.filter((v) => v.taluk.includes('south')).map((v) => (
                  <option key={v.id} value={v.id}>
                    #{v.id} - {v.nameTa} ({v.name}) • VAO: {v.vaoOfficerName}
                  </option>
                ))}
              </optgroup>
              <optgroup label="📍 கோவை வடக்கு வட்டம் (Coimbatore North - 5 Villages)">
                {COIMBATORE_VILLAGES.filter((v) => v.taluk.includes('north')).map((v) => (
                  <option key={v.id} value={v.id}>
                    #{v.id} - {v.nameTa} ({v.name}) • VAO: {v.vaoOfficerName}
                  </option>
                ))}
              </optgroup>
            </select>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              அரசு விதிமுறை: பயனர்பெயர்: <code className="bg-stone-200 px-1 rounded font-bold">ஊர்பெயர்.gov.in</code> (எ.கா: <code className="bg-stone-200 px-1 rounded font-bold">thondamuthur.gov.in</code>) | கடவுச்சொல்: <code className="bg-stone-200 px-1 rounded font-bold">thondamuthur</code>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                அரசு பயனர்பெயர் (Username ending in .gov.in):
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. vadavalli.gov.in"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded text-xs font-medium focus:bg-white focus:border-emerald-800 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-800 mb-1">
                கடவுச்சொல் (Password - village name in small letter):
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="e.g. vadavalli"
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded text-xs font-medium focus:bg-white focus:border-emerald-800 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-xs rounded border border-emerald-950 shadow-xs cursor-pointer transition-colors flex items-center justify-center space-x-1.5 mt-2"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{loading ? 'சரிபார்க்கிறது...' : 'VAO தளத்திற்குள் நுழையவும் (Secure Login)'}</span>
            </button>
          </form>
        </div>

        <div className="bg-stone-100 p-3 border-t border-stone-200 text-center text-[11px] text-stone-500">
          தமிழ்நாடு மின்னாளுமை முகமை (TNeGA) & வருவாய்த்துறை வழிகாட்டுதல்
        </div>
      </div>
    </div>
  );
};
