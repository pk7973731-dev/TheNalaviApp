import React, { useState, useEffect } from 'react';
import {
  Shield,
  Phone,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  Filter,
  Search,
  MessageSquare,
  Send,
  User,
  MapPin,
  RefreshCw,
  Building,
  Check,
} from 'lucide-react';
import { VillageInfo, FarmerConversation, Message } from '../types';
import { COIMBATORE_VILLAGES } from '../data/villages';

interface VaoPortalProps {
  currentVao: VillageInfo;
  onLogout: () => void;
  onSwitchToFarmerView: () => void;
}

export const VaoPortal: React.FC<VaoPortalProps> = ({
  currentVao,
  onLogout,
  onSwitchToFarmerView,
}) => {
  const [conversations, setConversations] = useState<FarmerConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState<FarmerConversation | null>(null);
  const [filterTag, setFilterTag] = useState<'all' | 'red' | 'orange' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVillage, setSelectedVillage] = useState<string>(currentVao.name);
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState<string>('in_progress');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replySuccessMsg, setReplySuccessMsg] = useState(false);

  const fetchConversations = async (villageName: string = selectedVillage) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/vao/farmers?village=${encodeURIComponent(villageName)}`);
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
        if (data.conversations && data.conversations.length > 0) {
          // preserve selection or select first
          setSelectedConv((prev) => {
            if (!prev) return data.conversations[0];
            const found = data.conversations.find((c: FarmerConversation) => c.id === prev.id);
            return found || data.conversations[0];
          });
        } else {
          setSelectedConv(null);
        }
      }
    } catch (err) {
      console.error('Error fetching VAO conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations(selectedVillage);
    const timer = setInterval(() => {
      fetchConversations(selectedVillage);
    }, 10000);
    return () => clearInterval(timer);
  }, [selectedVillage]);

  const handleSendReply = async () => {
    if (!selectedConv || !replyText.trim() || submittingReply) return;
    setSubmittingReply(true);
    try {
      const res = await fetch('/api/vao/reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: selectedConv.id,
          replyText: replyText.trim(),
          officerName: currentVao.vaoOfficerName,
          villageName: currentVao.name,
          statusUpdate: replyStatus,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setReplyText('');
        setReplySuccessMsg(true);
        setTimeout(() => setReplySuccessMsg(false), 4000);
        // refresh
        await fetchConversations(selectedVillage);
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setSubmittingReply(false);
    }
  };

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    if (filterTag === 'red' && !c.hasRedFlagLoanComplaint) return false;
    if (filterTag === 'orange' && !c.hasOrangeTagAgriQuery) return false;
    if (filterTag === 'resolved' && (c.hasRedFlagLoanComplaint || c.hasOrangeTagAgriQuery)) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const farmerName = c.farmer?.name?.toLowerCase() || '';
      const phone = c.farmer?.phone || '';
      const village = c.farmer?.village?.toLowerCase() || '';
      const initial = c.initialQuery?.toLowerCase() || '';
      return farmerName.includes(q) || phone.includes(q) || village.includes(q) || initial.includes(q);
    }

    return true;
  });

  const redFlagCount = conversations.filter((c) => c.hasRedFlagLoanComplaint).length;
  const orangeTagCount = conversations.filter((c) => c.hasOrangeTagAgriQuery).length;

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 flex flex-col min-h-[calc(100vh-70px)]">
      {/* Officer Header Card */}
      <div className="bg-white border border-stone-300 rounded-lg p-4 mb-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="w-12 h-12 rounded-md bg-emerald-900 text-amber-400 flex items-center justify-center font-bold text-2xl shrink-0 shadow-xs">
              🏛️
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-black text-stone-900 font-serif">
                  {currentVao.vaoOfficerName}
                </h1>
                <span className="bg-emerald-100 text-emerald-900 text-xs px-2 py-0.5 rounded font-semibold border border-emerald-300">
                  அங்கீகரிக்கப்பட்ட VAO அதிகாரி
                </span>
              </div>
              <p className="text-xs text-stone-600 font-medium mt-0.5">
                கிராம நிர்வாக அலுவலகம்: <span className="font-bold text-stone-900">{currentVao.name}</span> | வட்டம்:{' '}
                <span className="font-bold text-stone-900">{currentVao.taluk}</span> | மாவட்டம்: கோவை
              </p>
              <div className="flex items-center space-x-3 text-xs text-stone-500 mt-1">
                <span>அரசு ஐடி: <strong className="text-stone-700">{currentVao.vaoUsername}</strong></span>
                <span>•</span>
                <span>அலுவலக தொடர்பு: <strong className="text-stone-700">{currentVao.vaoPhone}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Actions & Village Switcher for Testing 20 Villages */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-1.5 text-xs bg-stone-50 border border-stone-300 p-1.5 rounded">
              <span className="text-stone-600 font-medium">பார்வை கிராமம்:</span>
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="font-bold text-stone-800 bg-white border border-stone-300 rounded px-1.5 py-0.5 focus:outline-hidden"
              >
                {COIMBATORE_VILLAGES.map((v) => (
                  <option key={v.normalizedName} value={v.name}>
                    {v.name} ({v.taluk.includes('south') ? 'South' : 'North'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => fetchConversations()}
              className="flex items-center space-x-1 text-xs px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded border border-stone-300 cursor-pointer"
              title="Refresh Records"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>புதுப்பி (Refresh)</span>
            </button>

            <button
              onClick={onSwitchToFarmerView}
              className="text-xs px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded cursor-pointer transition-colors shadow-2xs"
            >
              👨‍🌾 உழவர் பக்கம் செல்லவும்
            </button>

            <button
              onClick={onLogout}
              className="text-xs px-3 py-1.5 bg-stone-200 hover:bg-red-100 text-stone-800 hover:text-red-900 font-semibold rounded border border-stone-300 cursor-pointer"
            >
              வெளியேறு (Logout)
            </button>
          </div>
        </div>

        {/* Metric Counters Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-stone-200">
          <div className="bg-stone-50 border border-stone-200 p-2.5 rounded text-center">
            <div className="text-xs text-stone-500 font-medium">மொத்த விவசாயிகள்</div>
            <div className="text-xl font-black text-stone-900 mt-0.5">{conversations.length}</div>
          </div>
          <div className="bg-red-50 border border-red-200 p-2.5 rounded text-center">
            <div className="text-xs text-red-800 font-bold flex items-center justify-center space-x-1">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
              <span>🔴 அவசர கடன் புகார்கள்</span>
            </div>
            <div className="text-xl font-black text-red-900 mt-0.5">{redFlagCount}</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 p-2.5 rounded text-center">
            <div className="text-xs text-amber-800 font-bold flex items-center justify-center space-x-1">
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>🟠 கள ஆலோசனைகள்</span>
            </div>
            <div className="text-xl font-black text-amber-900 mt-0.5">{orangeTagCount}</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded text-center">
            <div className="text-xs text-emerald-800 font-bold flex items-center justify-center space-x-1">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>🟢 வழக்கமான திட்டங்கள்</span>
            </div>
            <div className="text-xl font-black text-emerald-900 mt-0.5">
              {conversations.length - (redFlagCount + orangeTagCount)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column View: Farmer Directory (Left) + Detailed Conversation & Action Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        {/* LEFT COLUMN: Farmer List */}
        <div className="lg:col-span-5 bg-white border border-stone-300 rounded-lg flex flex-col h-[650px] shadow-xs">
          {/* Filter Bar & Search */}
          <div className="p-3 border-b border-stone-200 space-y-2 bg-stone-50 rounded-t-lg">
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="பெயர், தொலைபேசி அல்லது வினவலைத் தேடு..."
                className="w-full pl-9 pr-3 py-1.5 bg-white text-xs border border-stone-300 rounded focus:outline-hidden focus:border-emerald-800"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 text-xs">
              <button
                onClick={() => setFilterTag('all')}
                className={`px-2 py-1 rounded font-medium cursor-pointer ${
                  filterTag === 'all'
                    ? 'bg-stone-800 text-white'
                    : 'bg-white text-stone-600 hover:bg-stone-200 border border-stone-300'
                }`}
              >
                அனைத்தும் ({conversations.length})
              </button>
              <button
                onClick={() => setFilterTag('red')}
                className={`px-2 py-1 rounded font-bold cursor-pointer ${
                  filterTag === 'red'
                    ? 'bg-red-700 text-white'
                    : 'bg-red-50 text-red-900 hover:bg-red-100 border border-red-300'
                }`}
              >
                🔴 புகார்கள் ({redFlagCount})
              </button>
              <button
                onClick={() => setFilterTag('orange')}
                className={`px-2 py-1 rounded font-bold cursor-pointer ${
                  filterTag === 'orange'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
                }`}
              >
                🟠 ஆலோசனைகள் ({orangeTagCount})
              </button>
            </div>
          </div>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-200">
            {loading ? (
              <div className="p-8 text-center text-xs text-stone-500">
                பதிவுகள் ஏற்றப்படுகின்றன... / Loading farmer records...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500">
                இந்த பிரிவில் விவசாயிகள் பதிவுகள் இல்லை. / No farmer queries found for this village.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedConv?.id === conv.id;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`p-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-emerald-50/90 border-l-4 border-l-emerald-800'
                        : 'hover:bg-stone-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-bold text-stone-900 text-sm flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-stone-500" />
                        <span>{conv.farmer?.name || 'பெயர் பதியப்படாத உழவர்'}</span>
                      </div>
                      {/* Flag Tags */}
                      {conv.hasRedFlagLoanComplaint && (
                        <span className="bg-red-100 text-red-900 text-[10px] font-black px-1.5 py-0.5 rounded border border-red-300 uppercase shrink-0 animate-pulse">
                          🔴 RED FLAG
                        </span>
                      )}
                      {conv.hasOrangeTagAgriQuery && !conv.hasRedFlagLoanComplaint && (
                        <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-1.5 py-0.5 rounded border border-amber-300 uppercase shrink-0">
                          🟠 ORANGE
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-stone-600 mt-1 flex items-center space-x-2">
                      <span className="font-semibold text-emerald-950">📞 {conv.farmer?.phone || 'எண் இல்லை'}</span>
                      <span>•</span>
                      <span>{conv.farmer?.village}</span>
                    </div>

                    {/* Query excerpt */}
                    <div className="text-xs text-stone-700 mt-1.5 line-clamp-2 italic bg-white/80 p-1.5 rounded border border-stone-200">
                      "{conv.initialQuery || conv.messages[0]?.text || 'வினவல் இல்லை'}"
                    </div>

                    <div className="text-[10px] text-stone-400 mt-1.5 flex items-center justify-between">
                      <span>செய்திகள்: {conv.messages.length}</span>
                      <span>{new Date(conv.lastUpdated).toLocaleDateString()} {new Date(conv.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Detailed Conversation Script & VAO Action */}
        <div className="lg:col-span-7 bg-white border border-stone-300 rounded-lg flex flex-col h-[650px] shadow-xs">
          {selectedConv ? (
            <>
              {/* Farmer Profile Banner & Click-to-Call */}
              <div className="p-3.5 border-b border-stone-200 bg-stone-50 rounded-t-lg">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-base font-bold text-stone-900">
                        {selectedConv.farmer?.name || 'உழவர் விவரம்'}
                      </h2>
                      {selectedConv.hasRedFlagLoanComplaint && (
                        <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded font-black">
                          🔴 கடன் குறைபாடு (Loan Grievance)
                        </span>
                      )}
                      {selectedConv.hasOrangeTagAgriQuery && (
                        <span className="bg-amber-600 text-white text-xs px-2 py-0.5 rounded font-black">
                          🟠 கள ஆலோசனை (Field Advice)
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-stone-600 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>கிராமம்: <strong>{selectedConv.farmer?.village}</strong></span>
                      <span>வட்டம்: <strong>{selectedConv.farmer?.taluk}</strong></span>
                      <span>மாவட்டம்: <strong>{selectedConv.farmer?.district}</strong></span>
                    </div>
                  </div>

                  {/* DIRECT CLICK TO CALL BUTTON FOR VAO ENQUIRY */}
                  {selectedConv.farmer?.phone && (
                    <a
                      href={`tel:${selectedConv.farmer.phone}`}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded shadow-xs cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-white" />
                      <span>உழவரை அழைக்கவும்: {selectedConv.farmer.phone}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Detailed Conversation Script (in exact script/language of conversation) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50/50">
                <div className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-2 border-b pb-1">
                  📜 உழவர் உரையாடல் ஸ்கிரிப்ட் (Detailed Conversation Script in Farmer's Language)
                </div>

                {selectedConv.messages.map((msg, idx) => {
                  const isFarmer = msg.sender === 'farmer';
                  const isVao = msg.sender === 'vao';

                  return (
                    <div
                      key={msg.id || idx}
                      className={`p-3 rounded border text-xs sm:text-sm leading-relaxed ${
                        isFarmer
                          ? 'bg-emerald-950 text-white border-emerald-950 ml-6'
                          : isVao
                          ? 'bg-blue-100 text-blue-950 border-blue-400 mr-6 font-medium'
                          : 'bg-white text-stone-900 border-stone-300 mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-bold mb-1 opacity-75">
                        <span>
                          {isFarmer && '👨‍🌾 உழவர் (Farmer)'}
                          {!isFarmer && !isVao && '🤖 நலவி AI அமைப்பு (Nalavi AI Assistant)'}
                          {isVao && `🏛️ VAO பதில்: ${msg.vaoOfficerName || 'கிராம நிர்வாக அலுவலர்'}`}
                        </span>
                        <span>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    </div>
                  );
                })}
              </div>

              {/* VAO Action & Reply Box */}
              <div className="p-3.5 border-t border-stone-200 bg-white rounded-b-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 flex items-center space-x-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-800" />
                    <span>VAO அதிகாரப்பூர்வ நடவடிக்கை / பதில் (Official Action & Response):</span>
                  </span>
                  <div className="flex items-center space-x-1 text-xs">
                    <span className="text-stone-500">நிலை:</span>
                    <select
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value)}
                      className="bg-stone-100 border border-stone-300 rounded px-1.5 py-0.5 font-medium text-stone-800"
                    >
                      <option value="in_progress">விசாரணையில் (Under Enquiry)</option>
                      <option value="contacted">தொலைபேசியில் பேசப்பட்டது (Contacted)</option>
                      <option value="resolved">தீர்வு காணப்பட்டது (Resolved & Cleared)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-end space-x-2">
                  <textarea
                    rows={2}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="விவசாயிக்கு அனுப்ப வேண்டிய அதிகாரப்பூர்வ குறிப்பு அல்லது வங்கியிடம் பேசிய விவரத்தை எழுதவும்... (இது விவசாயியின் திரையிலும் தோன்றும்)"
                    className="flex-1 p-2 bg-stone-50 border border-stone-300 focus:border-emerald-800 focus:bg-white rounded text-xs leading-relaxed focus:outline-hidden"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || submittingReply}
                    className={`px-3 py-2 rounded text-xs font-bold flex items-center space-x-1 shrink-0 cursor-pointer ${
                      replyText.trim() && !submittingReply
                        ? 'bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs'
                        : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingReply ? 'பதிவாகிறது...' : 'பதில் அனுப்புக'}</span>
                  </button>
                </div>

                {replySuccessMsg && (
                  <div className="text-xs text-emerald-800 font-bold bg-emerald-50 p-1.5 rounded border border-emerald-300 flex items-center space-x-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>அதிகாரப்பூர்வ பதில் உழவரின் திரையில் வெற்றிகரமாக சேர்க்கப்பட்டது!</span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
              <MessageSquare className="w-12 h-12 stroke-1 mb-2 text-stone-300" />
              <p className="text-sm font-medium text-stone-600">விவசாயியை தேர்வு செய்யவும்</p>
              <p className="text-xs text-stone-400 max-w-sm mt-1">
                இடதுபுறம் உள்ள பட்டியலில் இருந்து ஒரு உழவரை கிளிக் செய்து அவரது விரிவான உரையாடலை பார்வையிடவும்,
                தொலைபேசியில் அழைக்கவும் மற்றும் அரசு பதிலை அளிக்கவும்.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
