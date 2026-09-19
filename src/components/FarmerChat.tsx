import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  AlertTriangle,
  HelpCircle,
  CheckCircle,
  Building2,
  Phone,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { Message, FarmerConversation, FarmerProfile } from '../types';
import { getSpeechRecognition, speakText, stopSpeaking } from '../utils/audio';
import { isValidQuery, getInvalidMessage, resolveDetectedLanguage } from '../utils/agriGuard';

interface FarmerChatProps {
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  onOpenSchemes: () => void;
  onOpenVaoLogin: () => void;
}

export const FarmerChat: React.FC<FarmerChatProps> = ({
  currentLanguage,
  onLanguageChange,
  onOpenSchemes,
  onOpenVaoLogin,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [registrationStep, setRegistrationStep] = useState<string>('initial_query');
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [transcriptPreview, setTranscriptPreview] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load existing session from localStorage if present
  useEffect(() => {
    const savedConvId = localStorage.getItem('nalavi_active_conv_id');
    if (savedConvId) {
      fetch(`/api/farmer/session/${savedConvId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: FarmerConversation | null) => {
          if (data && data.messages.length > 0) {
            setConversationId(data.id);
            setMessages(data.messages);
            setFarmerProfile(data.farmer);
            setRegistrationStep(data.registrationStep);
          } else {
            initializeWelcomeMessage();
          }
        })
        .catch(() => {
          initializeWelcomeMessage();
        });
    } else {
      initializeWelcomeMessage();
    }
  }, []);

  // Poll for VAO responses if registered
  useEffect(() => {
    if (!conversationId) return;
    const interval = setInterval(() => {
      fetch(`/api/farmer/session/${conversationId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: FarmerConversation | null) => {
          if (data && data.messages.length > messages.length) {
            setMessages(data.messages);
            // If new message came from VAO, optionally speak alert
            const latest = data.messages[data.messages.length - 1];
            if (latest.sender === 'vao' && autoSpeak) {
              speakText(`கிராம நிர்வாக அலுவலர் பதில் அளித்துள்ளார்: ${latest.text}`, currentLanguage);
            }
          }
        })
        .catch((err) => console.error('Error polling conversation:', err));
    }, 4000);

    return () => clearInterval(interval);
  }, [conversationId, messages.length, autoSpeak, currentLanguage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const initializeWelcomeMessage = () => {
    const welcomeMsg: Message = {
      id: 'welcome_msg',
      sender: 'ai',
      text:
        currentLanguage === 'ta'
          ? 'வணக்கம் விவசாயி அவர்களே! நான் பாக்ஸ் பேச்சு (PACS PECHU) - VAO இ-சேவை வேளாண் உதவியாளர்.\n\n🌾 நான் தமிழ்நாடு அரசு வேளாண் திட்டங்கள், PACS கூட்டுறவு சங்க சட்டங்கள் (பிரிவு 21), VAO பட்டா/சிட்டா/அடங்கல் சேவைகள், PMFBY பயிர் காப்பீடு மற்றும் KCC பயிர் கடன் பற்றி மட்டுமே பதிலளிப்பேன்.\n\n🎙️ கீழே உள்ள பெரிய பச்சை மைக் (MIC) பொத்தானை ஒருமுறை தொட்டு பேசலாம் அல்லது உங்கள் விவசாயக் கேள்வியை தட்டச்சு செய்யலாம்.'
          : 'Greetings! I am PACS PECHU - VAO e-SEVAI Agriculture Assistant.\n\n🌾 I strictly assist with Tamil Nadu Agricultural Schemes, PACS Cooperative Laws (Section 21 & By-laws), VAO Land Records (Patta, Chitta, Adangal), PMFBY Crop Insurance, and KCC crop loans.\n\n🎙️ Single-tap the Big Green MIC button below to speak directly in your language, or type your question below.',
      language: currentLanguage,
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMsg]);
  };

  // Start speech recognition
  const handleToggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    stopSpeaking();
    setRecognitionError(null);
    setTranscriptPreview('');

    const recognition = getSpeechRecognition();
    if (!recognition) {
      setRecognitionError(
        'Speech recognition is not supported in this browser. Please use Chrome, Edge, or mobile browser, or type in the box below.'
      );
      return;
    }

    const langCodeMap: Record<string, string> = {
      ta: 'ta-IN',
      hi: 'hi-IN',
      en: 'en-IN',
      te: 'te-IN',
      kn: 'kn-IN',
      ml: 'ml-IN',
    };
    recognition.lang = langCodeMap[currentLanguage] || 'ta-IN';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscriptPreview(finalTranscript || interimTranscript);
      if (finalTranscript.trim()) {
        recognition.stop();
        sendMessage(finalTranscript.trim(), true);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      setIsListening(false);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setRecognitionError(
          currentLanguage === 'ta'
            ? 'மைக்ரோஃபோன் அணுகல் அனுமதி மறுக்கப்பட்டுள்ளது. உலாவி முகவரிப் பட்டியில் (URL bar) பூட்டு/கேமரா குறியீட்டைத் தட்டி Microphone "Allow" என்பதை தேர்ந்தெடுக்கவும் அல்லது ஆப்லை புதிய விண்டோவில் திறக்கவும்.'
            : 'Microphone permission blocked. Please click the Lock icon in your browser address bar and enable Microphone, or open the app in a new tab.'
        );
      } else if (event.error !== 'no-speech') {
        setRecognitionError(
          currentLanguage === 'ta'
            ? `குரல் அறிவதில் சிரமம் (${event.error}). தயவுசெய்து மீண்டும் பேசவும் அல்லது கீழே தட்டச்சு செய்யவும்.`
            : `Voice recognition error (${event.error}). Please try speaking again or type your message.`
        );
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const sendMessage = async (textToSend: string, isAudioSpoken: boolean = false) => {
    if (!textToSend.trim() || loading) return;

    const userText = textToSend.trim();
    setInputText('');
    setTranscriptPreview('');
    setLoading(true);

    // Optimistically append farmer message
    const tempUserMsg: Message = {
      id: `temp_${Date.now()}`,
      sender: 'farmer',
      text: userText,
      language: currentLanguage,
      timestamp: new Date().toISOString(),
      audioSpoken: isAudioSpoken,
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    // STRICT GUARD: If user asks ANYTHING other than agriculture, REJECT immediately.
    // Guardrail Check: PACS PECHU strict agriculture verification (only for inquiry turns)
    if (registrationStep === 'initial_query' || registrationStep === 'completed') {
      const detectedLang = resolveDetectedLanguage(userText, currentLanguage);
      if (!isValidQuery(userText)) {
        const invalidMsgText = getInvalidMessage(detectedLang);
        const rejectionMsg: Message = {
          id: `m_${Date.now()}_invalid`,
          sender: 'ai',
          text: invalidMsgText,
          language: detectedLang,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, rejectionMsg]);
        if (isAudioSpoken || autoSpeak) {
          setIsPlayingAudio(true);
          speakText(invalidMsgText, detectedLang, () => {
            setIsPlayingAudio(false);
          });
        }
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/farmer/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          text: userText,
          audioSpoken: isAudioSpoken,
          userLanguage: currentLanguage,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get response from Nalavi server');
      }

      const data = await res.json();
      if (data.conversationId) {
        setConversationId(data.conversationId);
        localStorage.setItem('nalavi_active_conv_id', data.conversationId);
      }
      if (data.farmer) {
        setFarmerProfile(data.farmer);
      }
      if (data.registrationStep) {
        setRegistrationStep(data.registrationStep);
      }

      if (data.message) {
        setMessages((prev) => [...prev, data.message]);

        // "the ai it will recognize farmer's language and if he speaks it need to speak if he type it need to msg all"
        if (isAudioSpoken || autoSpeak) {
          setIsPlayingAudio(true);
          speakText(data.message.text, data.message.language || currentLanguage, () => {
            setIsPlayingAudio(false);
          });
        }
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        sender: 'ai',
        text:
          currentLanguage === 'ta'
            ? 'மன்னிக்கவும், தகவலைப் பெறுவதில் தற்காலிக இடையூறு ஏற்பட்டது. தயவுசெய்து மீண்டும் முயற்சி செய்யவும்.'
            : 'Sorry, could not process request right now. Please try again.',
        language: currentLanguage,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    sendMessage(promptText, false);
  };

  const handleResetConversation = async () => {
    // Stop any ongoing speech or recognition
    stopSpeaking();
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
    setLoading(false);
    setInputText('');
    setTranscriptPreview('');
    setRecognitionError(null);

    const oldConvId = conversationId || localStorage.getItem('nalavi_active_conv_id');
    localStorage.removeItem('nalavi_active_conv_id');
    setConversationId(null);
    setFarmerProfile(null);
    setRegistrationStep('initial_query');

    // Immediately restore clean initial welcome message
    initializeWelcomeMessage();

    // Also tell the backend to delete the old session if it existed
    if (oldConvId) {
      try {
        await fetch(`/api/farmer/session/${oldConvId}`, { method: 'DELETE' });
      } catch (e) {
        console.warn('Could not delete old conversation from backend:', e);
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-68px)] max-w-5xl mx-auto bg-stone-50 border-x border-stone-300 shadow-sm relative">
      {/* Top Banner: Status, District Info, Pilot Badge, Audio Toggle */}
      <div className="bg-stone-100 border-b border-stone-300 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-700">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block animate-pulse"></span>
          <span className="font-semibold text-stone-900">
            தமிழ்நாடு வேளாண்மை & வருவாய்த்துறை முன்னோடி திட்டம் (Coimbatore Pilot)
          </span>
          <span className="hidden sm:inline text-stone-400">|</span>
          <span className="hidden md:inline bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-medium border border-emerald-300">
            20 VAO கிராமங்கள் நேரடி இணைப்பு
          </span>
        </div>

        <div className="flex items-center space-x-3">
          {/* Registered Farmer Profile Indicator */}
          {farmerProfile && farmerProfile.name && (
            <div className="flex items-center bg-white border border-stone-300 px-2.5 py-0.5 rounded shadow-2xs text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 mr-1" />
              <span className="font-bold text-stone-900 mr-1">{farmerProfile.name}</span>
              <span className="text-stone-600">({farmerProfile.village || 'கண்டறியப்படாத கிராமம்'})</span>
            </div>
          )}

          {/* Auto voice toggle */}
          <button
            onClick={() => {
              const next = !autoSpeak;
              setAutoSpeak(next);
              if (!next) stopSpeaking();
            }}
            className={`flex items-center space-x-1 px-2 py-1 rounded border cursor-pointer ${
              autoSpeak
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-stone-200 text-stone-600 border-stone-300'
            }`}
            title="Toggle Voice Output"
          >
            {autoSpeak ? <Volume2 className="w-3.5 h-3.5 text-emerald-700" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-medium">
              {autoSpeak ? 'ஒலி வடிவம் ஆன் (Voice ON)' : 'ஒலி ஆஃப் (Muted)'}
            </span>
          </button>

          {/* New Chat button */}
          <button
            onClick={handleResetConversation}
            className="flex items-center space-x-1 text-stone-600 hover:text-stone-900 px-2 py-1 bg-stone-200 hover:bg-stone-300 rounded border border-stone-300 cursor-pointer"
            title="Start New Inquiry"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="text-[11px]">புதியது (Reset)</span>
          </button>
        </div>
      </div>

      {/* Illiterate Farmer Audio Prompt Helpers (Only shown when starting) */}
      {messages.length <= 2 && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-amber-900 flex items-center">
              <Sparkles className="w-3.5 h-3.5 text-amber-700 mr-1.5" />
              விரைவு கேள்விகள் (தட்டினால் ஒலிக்கும்):
            </span>
            <button
              onClick={onOpenSchemes}
              className="text-[11px] text-amber-900 hover:underline font-semibold cursor-pointer"
            >
              அனைத்து திட்டங்கள் காண்க &rarr;
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {[
              {
                text: 'தொடக்க வேளாண்மை கூட்டுறவு சங்கம் (PACS) சட்டம் பிரிவு 21 விவசாயி உறுப்பினர் உரிமை என்ன?',
                label: '🏛️ PACS பிரிவு 21 சட்டம்',
              },
              {
                text: 'கிராம நிர்வாக அலுவலரிடம் (VAO) பட்டா மாறுதல் மற்றும் சிட்டா அடங்கல் பெறுவது எப்படி?',
                label: '📜 பட்டா / சிட்டா / அடங்கல்',
              },
              {
                text: 'பிரதமர் பயிர் காப்பீட்டுத் திட்டம் (PMFBY) பிரீமியம் மற்றும் இழப்பீடு விவரம் என்ன?',
                label: '🌾 PMFBY பயிர் காப்பீடு',
              },
              {
                text: 'பயிர் கடன் பெற கிசான் கிரெடிட் கார்டு (KCC) 0% வட்டியில் எப்படி விண்ணப்பிப்பது?',
                label: '💳 KCC பயிர் கடன்',
              },
              {
                text: 'பி.எம் கிசான் ₹6,000 ஆண்டு உதவித்தொகை தகுதி விவரங்கள் என்ன?',
                label: '💰 PM கிசான் ₹6000',
              },
              {
                text: 'வங்கி பயிர் கடன் தர மறுக்கிறது, அவசர RED FLAG உதவி தேவை',
                label: '🚩 கடன் மறுப்பு புகார் (VAO)',
                isAlert: true,
              },
            ].map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleQuickPrompt(item.text)}
                className={`text-left p-2 rounded border text-xs font-medium cursor-pointer transition-all shadow-2xs ${
                  item.isAlert
                    ? 'bg-red-50 border-red-300 text-red-900 hover:bg-red-100 font-semibold'
                    : 'bg-white border-amber-300 text-stone-800 hover:bg-amber-100/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{item.label}</span>
                  <Volume2 className="w-3 h-3 text-stone-400 shrink-0 ml-1" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => {
          const isFarmer = msg.sender === 'farmer';
          const isVao = msg.sender === 'vao';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isFarmer ? 'items-end' : 'items-start'} max-w-3xl ${
                isFarmer ? 'ml-auto' : 'mr-auto'
              }`}
            >
              {/* Sender label */}
              <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-stone-500 mb-1 px-1">
                {isFarmer && (
                  <>
                    <span>👨‍🌾 உழவர் (Farmer)</span>
                    {msg.audioSpoken && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1 rounded font-normal flex items-center">
                        <Mic className="w-2.5 h-2.5 mr-0.5" /> குரல் வழி (Spoken)
                      </span>
                    )}
                  </>
                )}
                {!isFarmer && !isVao && <span>🏛️ நலவி உழவர் AI (Nalavi Official AI)</span>}
                {isVao && (
                  <span className="bg-blue-800 text-white px-2 py-0.5 rounded text-[11px] font-bold flex items-center shadow-xs">
                    🏛️ கிராம நிர்வாக அலுவலர் நேரடி பதில் (VAO Official Reply)
                  </span>
                )}
                <span className="text-stone-400 font-normal">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Message Bubble */}
              <div
                className={`p-3.5 sm:p-4 rounded-lg shadow-2xs border text-sm sm:text-base leading-relaxed ${
                  isFarmer
                    ? 'bg-emerald-900 text-white border-emerald-950 rounded-tr-xs'
                    : isVao
                    ? 'bg-blue-50 text-blue-950 border-blue-400 rounded-tl-xs ring-1 ring-blue-300'
                    : 'bg-white text-stone-900 border-stone-300 rounded-tl-xs'
                }`}
              >
                {/* Visual Flag Badges on AI message */}
                {msg.flag === 'red' && (
                  <div className="mb-2 p-2 bg-red-100 border border-red-300 text-red-950 rounded text-xs font-bold flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="uppercase tracking-wider text-[11px]">🔴 RED FLAG: கடன் புகார் (Loan Complaint)</div>
                      <div className="font-normal text-[12px] text-red-900 mt-0.5">
                        இந்த புகார் உங்கள் கிராம நிர்வாக அலுவலருக்கு (VAO) உடனடியாக அனுப்பப்பட்டுள்ளது. அவர் உங்களை
                        நேரடியாக தொலைபேசியில் அழைத்து விசாரிப்பார்.
                      </div>
                    </div>
                  </div>
                )}

                {msg.flag === 'orange' && (
                  <div className="mb-2 p-2 bg-amber-100 border border-amber-300 text-amber-950 rounded text-xs font-bold flex items-start space-x-2">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="uppercase tracking-wider text-[11px]">🟠 ORANGE TAG: வேளாண்மை ஆலோசனை கேள்வி</div>
                      <div className="font-normal text-[12px] text-amber-900 mt-0.5">
                        இந்த கள சந்தேகம் VAO மற்றும் வட்டார வேளாண் துறை அதிகாரிகளுக்கு பகிரப்பட்டுள்ளது.
                      </div>
                    </div>
                  </div>
                )}

                {isVao && (
                  <div className="mb-2 border-b border-blue-200 pb-1.5 text-xs text-blue-900 font-semibold flex items-center justify-between">
                    <span>அலுவலர்: {msg.vaoOfficerName || 'கிராம நிர்வாக அலுவலர்'}</span>
                    <span>கிராமம்: {msg.vaoVillage}</span>
                  </div>
                )}

                {/* Message text with whitespace support */}
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Audio playback button for AI & VAO messages */}
                {!isFarmer && (
                  <div className="mt-2.5 pt-2 border-t border-stone-200/80 flex items-center justify-between text-xs">
                    <button
                      onClick={() => speakText(msg.text, msg.language || currentLanguage)}
                      className="flex items-center space-x-1 text-emerald-800 hover:text-emerald-950 font-semibold bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 cursor-pointer transition-colors"
                      title="Listen to this message"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>குரலில் கேட்க (Read aloud)</span>
                    </button>
                    <span className="text-[11px] text-stone-400">Official Agriculture Advisory</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex items-center space-x-2 text-stone-600 bg-white border border-stone-300 p-3 rounded-lg w-fit shadow-2xs text-xs">
            <div className="w-4 h-4 border-2 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
            <span className="font-medium">அரசு தரவுத்தளத்தில் சரிபார்க்கிறது... / Searching official records...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Speech Recognition Error Banner if any */}
      {recognitionError && (
        <div className="bg-red-50 border-t border-red-200 px-4 py-2 text-xs text-red-800 flex items-center justify-between">
          <span>{recognitionError}</span>
          <button onClick={() => setRecognitionError(null)} className="font-bold underline ml-2 cursor-pointer">
            சரி
          </button>
        </div>
      )}

      {/* Active Speech Recording Floating Indicator */}
      {isListening && (
        <div className="bg-emerald-900 text-white px-4 py-2.5 flex items-center justify-between border-t border-emerald-950 animate-pulse">
          <div className="flex items-center space-x-2 text-xs sm:text-sm">
            <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
            <span className="font-bold">
              கேட்கிறது... இப்போது பேசவும் (Listening in {currentLanguage === 'ta' ? 'தமிழ்' : currentLanguage})
            </span>
            {transcriptPreview && (
              <span className="italic text-emerald-200 max-w-xs truncate">"{transcriptPreview}"</span>
            )}
          </div>
          <button
            onClick={handleToggleMic}
            className="bg-white text-emerald-950 px-3 py-1 rounded text-xs font-bold hover:bg-stone-100 cursor-pointer"
          >
            பேசி முடித்தேன் (Done)
          </button>
        </div>
      )}

      {/* BOTTOM INPUT AREA: Big Mic Button + Clean Government Text Field */}
      <div className="bg-white border-t border-stone-300 p-3 sm:p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputText, false);
          }}
          className="flex items-center space-x-2 sm:space-x-3"
        >
          {/* BIG MIC BUTTON FOR ILLITERATE FARMERS */}
          <button
            type="button"
            onClick={handleToggleMic}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center shrink-0 shadow-md border-2 transition-all cursor-pointer ${
              isListening
                ? 'bg-red-600 hover:bg-red-700 text-white border-red-800 ring-4 ring-red-200 animate-pulse'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-900 ring-2 ring-emerald-300'
            }`}
            title="Single tap to speak / பேச தொடங்குங்கள்"
            aria-label="Microphone speech input"
          >
            {isListening ? (
              <MicOff className="w-6 h-6 sm:w-7 sm:h-7" />
            ) : (
              <Mic className="w-7 h-7 sm:w-8 sm:h-8" />
            )}
            <span className="text-[9px] sm:text-[10px] font-bold tracking-tight mt-0.5 uppercase">
              {isListening ? 'நிறுத்து' : 'பேசுக'}
            </span>
          </button>

          {/* Text Input Field */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                currentLanguage === 'ta'
                  ? 'விவசாய சந்தேகத்தை தட்டச்சு செய்யவும்... (அல்லது இடதுபுறம் உள்ள மைக்கை தொடவும்)'
                  : 'Type your agriculture question... (or tap the Mic on the left)'
              }
              className="w-full pl-3.5 pr-10 py-3 sm:py-3.5 bg-stone-50 hover:bg-white focus:bg-white text-stone-900 border border-stone-300 focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 rounded text-sm sm:text-base font-medium placeholder:text-stone-400 transition-colors"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded flex items-center justify-center shrink-0 border transition-colors cursor-pointer ${
              inputText.trim() && !loading
                ? 'bg-emerald-900 hover:bg-emerald-950 text-white border-emerald-950 shadow-xs'
                : 'bg-stone-100 text-stone-400 border-stone-300 cursor-not-allowed'
            }`}
            title="Send Message / கேள்வியை அனுப்புக"
          >
            <Send className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Quick Reset Button for instant restart */}
          <button
            type="button"
            onClick={handleResetConversation}
            className="w-10 h-12 sm:w-12 sm:h-14 rounded flex flex-col items-center justify-center shrink-0 border border-stone-300 bg-stone-100 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-stone-600 transition-colors cursor-pointer"
            title="Start New Chat / புதிய உரையாடல் (Reset)"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-[9px] font-semibold tracking-tighter mt-0.5 uppercase">Reset</span>
          </button>
        </form>

        {/* Footer Government Disclaimer / Micro notice */}
        <div className="mt-2 text-center text-[11px] text-stone-500 flex items-center justify-center space-x-2">
          <span>🏛️ தேசிய வேளாண்மை தகவல் மையம் & தமிழ்நாடு வருவாய்த்துறை</span>
          <span>•</span>
          <button
            onClick={onOpenVaoLogin}
            className="text-emerald-800 hover:underline font-semibold cursor-pointer"
          >
            VAO Login Portal
          </button>
        </div>
      </div>
    </div>
  );
};
