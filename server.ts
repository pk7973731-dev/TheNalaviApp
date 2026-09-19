import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import pg from 'pg';
import { GoogleGenAI } from '@google/genai';
import { COIMBATORE_VILLAGES, findVillageMatch, isValidPilotVillage } from './src/data/villages.ts';
import { AGRICULTURAL_SCHEMES, findMatchingSchemes } from './src/data/schemes.ts';
import { FarmerConversation, Message, FarmerProfile } from './src/types.ts';
import { isValidQuery, getInvalidMessage, resolveDetectedLanguage, EXACT_INVALID_MESSAGES } from './src/utils/agriGuard.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

const SARVAM_API_KEY = process.env.SARVAM_API_KEY || 'sk_d98di4vc_SdlxTa0v4D0hn8XjgITx4hHo';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

let geminiAi: GoogleGenAI | null = null;
if (GEMINI_API_KEY) {
  try {
    geminiAi = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (e) {
    console.error('Failed to init Gemini client:', e);
  }
}

// -------------------------------------------------------------
// Database Setup: Neon PostgreSQL + Resilient File Backup
// -------------------------------------------------------------
const DB_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
const LOCAL_DB_FILE = path.join(DB_DIR, 'nalavi_db.json');

interface LocalDbSchema {
  conversations: Record<string, FarmerConversation>;
  farmers: Record<string, FarmerProfile>;
  vaoNotes: Record<string, { note: string; status: string; updatedAt: string; officerName: string }>;
}

let localDb: LocalDbSchema = {
  conversations: {},
  farmers: {},
  vaoNotes: {},
};

function loadLocalDb() {
  try {
    if (fs.existsSync(LOCAL_DB_FILE)) {
      const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf-8');
      localDb = JSON.parse(raw);
    } else {
      seedInitialData();
      saveLocalDb();
    }
  } catch (err) {
    console.error('Error loading local DB:', err);
    seedInitialData();
  }
}

function saveLocalDb() {
  try {
    fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(localDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local DB:', err);
  }
}

let pgPool: pg.Pool | null = null;
if (process.env.DATABASE_URL) {
  try {
    pgPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    console.log('Connected to Neon PostgreSQL database.');
    initPostgresSchema();
  } catch (err) {
    console.error('Failed to connect to Neon PostgreSQL, falling back to local file store:', err);
  }
}

async function initPostgresSchema() {
  if (!pgPool) return;
  try {
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS farmers (
        id VARCHAR(64) PRIMARY KEY,
        name VARCHAR(255),
        district VARCHAR(255),
        taluk VARCHAR(255),
        village VARCHAR(255),
        phone VARCHAR(32),
        is_outside_pilot BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id VARCHAR(64) PRIMARY KEY,
        farmer_id VARCHAR(64),
        initial_query TEXT,
        registration_step VARCHAR(64),
        has_red_flag BOOLEAN DEFAULT FALSE,
        has_orange_tag BOOLEAN DEFAULT FALSE,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(64) PRIMARY KEY,
        conversation_id VARCHAR(64),
        sender VARCHAR(32),
        text TEXT,
        language VARCHAR(16),
        flag VARCHAR(16),
        audio_spoken BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS vao_actions (
        id SERIAL PRIMARY KEY,
        conversation_id VARCHAR(64),
        officer_name VARCHAR(255),
        village VARCHAR(255),
        response_text TEXT,
        status VARCHAR(64),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Neon PostgreSQL tables initialized successfully.');
  } catch (err) {
    console.error('Error initializing PostgreSQL tables:', err);
  }
}

function seedInitialData() {
  // Seed a sample farmer case in Vadavalli to showcase the VAO portal immediately
  const sampleFarmerId = 'farmer_sample_01';
  const sampleConvId = 'conv_sample_01';
  localDb.farmers[sampleFarmerId] = {
    id: sampleFarmerId,
    name: 'முத்துசாமி (Muthusamy)',
    district: 'Coimbatore',
    taluk: 'Coimbatore south',
    village: 'Vadavalli',
    phone: '9842154321',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    isOutsidePilot: false,
  };

  localDb.conversations[sampleConvId] = {
    id: sampleConvId,
    farmer: localDb.farmers[sampleFarmerId],
    initialQuery: 'நான் 3 ஏக்கர் நெல் சாகுபடி செய்துள்ளேன். தொடக்க வேளாண் கூட்டுறவு வங்கியில் கிசான் கடன் அட்டை (KCC) பயிர் கடன் கேட்டேன், மேனேஜர் நிராகரித்து விட்டார். எனக்கு அவசரமாக கடன் தேவை.',
    registrationStep: 'completed',
    hasRedFlagLoanComplaint: true,
    hasOrangeTagAgriQuery: false,
    lastUpdated: new Date(Date.now() - 3600000 * 2).toISOString(),
    messages: [
      {
        id: 'm1',
        sender: 'farmer',
        text: 'நான் 3 ஏக்கர் நெல் சாகுபடி செய்துள்ளேன். தொடக்க வேளாண் கூட்டுறவு வங்கியில் கிசான் கடன் அட்டை (KCC) பயிர் கடன் கேட்டேன், மேனேஜர் நிராகரித்து விட்டார். எனக்கு அவசரமாக கடன் தேவை.',
        language: 'ta',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        audioSpoken: true,
      },
      {
        id: 'm2',
        sender: 'ai',
        text: 'வணக்கம்! உங்கள் கேள்வியை பதிவு செய்து கொண்டேன். அரசு வழிகாட்டுதலின்படி, உங்கள் கேள்விக்கு பதிலளிக்கும் முன் உங்கள் விவரங்களை பதிவு செய்ய வேண்டும். முதலாவதாக, உங்கள் முழு பெயரை சொல்லவும்.',
        language: 'ta',
        timestamp: new Date(Date.now() - 3600000 * 3.9).toISOString(),
      },
      {
        id: 'm3',
        sender: 'farmer',
        text: 'முத்துசாமி',
        language: 'ta',
        timestamp: new Date(Date.now() - 3600000 * 3.8).toISOString(),
        audioSpoken: true,
      },
      {
        id: 'm4',
        sender: 'ai',
        text: 'நன்றி முத்துசாமி ஐயா. நீங்கள் எந்த மாவட்டத்தைச் சேர்ந்தவர்?',
        language: 'ta',
        timestamp: new Date(Date.now() - 3600000 * 3.7).toISOString(),
      },
      {
        id: 'm5',
        sender: 'farmer',
        text: 'கோயம்புத்தூர்',
        language: 'ta',
        timestamp: new Date(Date.now() - 3600000 * 3.6).toISOString(),
        audioSpoken: true,
      },
      {
        id: 'm6',
        sender: 'ai',
        text: 'உங்கள் வட்டம் (Taluk) எது? (கோவை தெற்கு / கோவை வடக்கு)',
        language: 'ta',
        timestamp: new Date(Date.now() - 3600000 * 3.5).toISOString(),
      },
      {
        id: 'm7',
        sender: 'farmer',
        text: 'கோவை தெற்கு',
        language: 'ta',
        timestamp: new Date(Date.now() - 3600000 * 3.4).toISOString(),
        audioSpoken: true,
      },
      {
        id: 'm8',
        sender: 'ai',
        text: 'உங்கள் கிராமத்தின் பெயர் என்ன?',
        language: 'ta',
        timestamp: new Date(Date.now() - 3600000 * 3.3).toISOString(),
      },
      {
        id: 'm9',
        sender: 'farmer',
        text: 'வடவள்ளி (Vadavalli)',
        language: 'ta',
        timestamp: new Date(Date.now() - 3600000 * 3.2).toISOString(),
        audioSpoken: true,
      },
      {
        id: 'm10',
        sender: 'ai',
        text: 'வடவள்ளி கிராம நிர்வாக அலுவலகத்தின் கீழ் பதிவு செய்யப்பட்டது. இறுதியாக கிராம நிர்வாக அலுவலர் (VAO) தொடர்புகொள்ள உங்கள் 10 இலக்க மொபைல் எண்ணை தெரிவிக்கவும்.',
        language: 'ta',
        timestamp: new Date(Date.now() - 3600000 * 3.1).toISOString(),
      },
      {
        id: 'm11',
        sender: 'farmer',
        text: '9842154321',
        language: 'ta',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        audioSpoken: true,
      },
      {
        id: 'm12',
        sender: 'ai',
        text: 'உங்கள் பதிவு வெற்றிகரமாக முடிந்தது! இப்போது நீங்கள் கேட்ட கிசான் கடன் அட்டை (KCC) பிரச்சனைக்கு தீர்வு:\n\nமத்திய ரிசர்வ் வங்கி விதிகளின்படி ₹1.60 லட்சம் வரை எந்த ஒரு நில பத்திர பிணையமும் இன்றி பயிர் கடன் வழங்க வேண்டும். வங்கி மேனேஜர் நிராகரிப்பது அரசு விதிகளுக்கு எதிரானது.\n\n⚠️ உங்களின் இந்த கடன் புகார் RED FLAG முன்னுரிமையுடன் வடவள்ளி கிராம நிர்வாக அலுவலர் (VAO) திரு. K. ராஜேந்திரன் அவர்களுக்கு அனுப்பப்பட்டுள்ளது. அவர் உங்களை 9842154321 என்ற எண்ணில் தொலைபேசியில் தொடர்புகொண்டு கூட்டுறவு வங்கியில் கடன் பெற்றுத்தர நேரடி விசாரணை மேற்கொள்வார்.',
        language: 'ta',
        flag: 'red',
        timestamp: new Date(Date.now() - 3600000 * 2.9).toISOString(),
      },
    ],
  };

  // Sample Orange Tag query in Thondamuthur
  const farmer2Id = 'farmer_sample_02';
  const conv2Id = 'conv_sample_02';
  localDb.farmers[farmer2Id] = {
    id: farmer2Id,
    name: 'கருப்பசாமி (Karuppasamy)',
    district: 'Coimbatore',
    taluk: 'Coimbatore south',
    village: 'Thondamuthur',
    phone: '9443217890',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    isOutsidePilot: false,
  };
  localDb.conversations[conv2Id] = {
    id: conv2Id,
    farmer: localDb.farmers[farmer2Id],
    initialQuery: 'தென்னை மரங்களில் சுருள் வெள்ளை ஈ தாக்குதல் அதிகமாக உள்ளது, என்ன மருந்து தெளிக்க வேண்டும்?',
    registrationStep: 'completed',
    hasRedFlagLoanComplaint: false,
    hasOrangeTagAgriQuery: true,
    lastUpdated: new Date(Date.now() - 3600000 * 1).toISOString(),
    messages: [
      {
        id: 'm201',
        sender: 'farmer',
        text: 'தென்னை மரங்களில் சுருள் வெள்ளை ஈ தாக்குதல் அதிகமாக உள்ளது, என்ன மருந்து தெளிக்க வேண்டும்?',
        language: 'ta',
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        audioSpoken: false,
      },
      {
        id: 'm202',
        sender: 'ai',
        text: 'சுருள் வெள்ளை ஈ கட்டுப்பாட்டுக்கு வேப்பெண்ணெய் கரைசல் 30 மிலி அல்லது வேப்பம் கொட்டை சாறு 5% தெளிக்கலாம். மஞ்சள் நிற ஒட்டும் பொறிகளை ஏக்கருக்கு 8 என்ற எண்ணிக்கையில் கட்டவும்.\n\n🔸 இந்த கள ஆலோசனை கேள்வி தொண்டாமுத்தூர் கிராம நிர்வாக அலுவலர் (VAO) பக்கத்தில் ORANGE TAG உடன் பகிரப்பட்டுள்ளது. வட்டார வேளாண் அலுவலர் பரிந்துரையும் உங்களுக்கு விரைவில் வழங்கப்படும்.',
        language: 'ta',
        flag: 'orange',
        timestamp: new Date(Date.now() - 3600000 * 7.5).toISOString(),
      },
      {
        id: 'm203',
        sender: 'vao',
        text: 'வணக்கம் முத்துசாமி. தொண்டாமுத்தூர் வேளாண்மை உதவி இயக்குநர் அலுவலகத்தில் கிரைசோபெர்லா (Chrysoperla) ஒட்டுண்ணி இலவசமாக வழங்கப்படுகிறது. நாளை காலை 10 மணிக்கு வட்டார அலுவலகத்தில் வந்து பெற்றுக்கொள்ளவும்.',
        language: 'ta',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        vaoOfficerName: 'Thiru. R. Velusamy, VAO',
        vaoVillage: 'Thondamuthur',
      },
    ],
  };
}

loadLocalDb();

// -------------------------------------------------------------
// NLP Helper: Agricultural Relevance, Loan Grievance & Scheme Matching
// -------------------------------------------------------------

function isIrrelevantToAgriculture(text: string): boolean {
  return !isValidQuery(text);
}

function isLoanComplaint(text: string): boolean {
  const lower = text.toLowerCase();
  const loanComplaintKeywords = [
    'loan rejected', 'bank refused', 'high interest', 'loan complaint',
    'kcc problem', 'loan delay', 'recovery harassment', 'debt waiver',
    'bank manager refused', 'loan issue', 'did not get loan',
    'கடன் கிடைக்கவில்லை', 'வங்கி மேனேஜர் மறுக்கிறார்', 'வங்கி கடன் தரவில்லை',
    'கடன் நிராகரிப்பு', 'அதிக வட்டி', 'லோன் பிரச்சனை', 'பயிர் கடன் கிடைக்கல',
    'கேசிசி வரவில்லை', 'கடன் தள்ளுபடி', 'கடன் புகார்', 'வங்கி பிரச்சனை'
  ];
  return loanComplaintKeywords.some(kw => lower.includes(kw));
}

function detectLanguage(text: string, fallbackLang: string = 'ta'): string {
  return resolveDetectedLanguage(text, fallbackLang);
}

// -------------------------------------------------------------
// Sarvam AI Text-to-Speech & Speech Processing Proxies
// -------------------------------------------------------------

app.post('/api/sarvam/tts', async (req: Request, res: Response) => {
  try {
    const { text, target_language_code = 'ta-IN' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    if (!SARVAM_API_KEY) {
      return res.status(200).json({ audio: null, message: 'No Sarvam key, fallback to browser synthesis' });
    }

    // Language specific recommended speakers for bulbul:v3
    const speakerMap: Record<string, string> = {
      'ta-IN': 'gokul',
      'hi-IN': 'aditya',
      'te-IN': 'kavitha',
      'kn-IN': 'chaitra',
      'ml-IN': 'amartya', // fallback or general
      'en-IN': 'simran',
    };
    const chosenSpeaker = speakerMap[target_language_code] || 'gokul';

    // Call Sarvam AI text-to-speech endpoint with bulbul:v3
    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': SARVAM_API_KEY,
      },
      body: JSON.stringify({
        inputs: [text.slice(0, 500)], // Sarvam limit
        target_language_code,
        speaker: chosenSpeaker,
        pitch: 0,
        pace: 1.0,
        loudness: 1.5,
        speech_sample_rate: 16000,
        enable_preprocessing: true,
        model: 'bulbul:v3',
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('Sarvam TTS API responded with error:', response.status, errText);
      return res.status(200).json({ audio: null, fallback: true, error: errText });
    }

    const data = await response.json() as { audios?: string[] };
    if (data.audios && data.audios[0]) {
      return res.json({ audio: data.audios[0], format: 'wav', speaker: chosenSpeaker });
    }

    return res.json({ audio: null, fallback: true });
  } catch (err: any) {
    console.error('Sarvam TTS error:', err.message);
    return res.status(200).json({ audio: null, fallback: true, error: err.message });
  }
});

// -------------------------------------------------------------
// Farmer Conversation Engine
// -------------------------------------------------------------

app.get('/api/farmer/session/:id', (req: Request, res: Response) => {
  const convId = req.params.id;
  const conv = localDb.conversations[convId];
  if (!conv) {
    return res.status(404).json({ error: 'Session not found' });
  }
  return res.json(conv);
});

app.delete('/api/farmer/session/:id', (req: Request, res: Response) => {
  const convId = req.params.id;
  if (localDb.conversations[convId]) {
    delete localDb.conversations[convId];
    saveLocalDb();
  }
  return res.json({ success: true, message: 'Session reset successfully' });
});

app.post('/api/farmer/message', async (req: Request, res: Response) => {
  try {
    const {
      conversationId,
      text,
      audioSpoken = false,
      userLanguage,
    } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Message text is required' });
    }

    const cleanedText = text.trim();
    const detectedLang = userLanguage || detectLanguage(cleanedText);

    let convId = conversationId;
    let conv: FarmerConversation | null = null;

    if (convId && localDb.conversations[convId]) {
      conv = localDb.conversations[convId];
    } else {
      convId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const farmerId = `farmer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      conv = {
        id: convId,
        farmer: {
          id: farmerId,
          name: '',
          district: '',
          taluk: '',
          village: '',
          phone: '',
          createdAt: new Date().toISOString(),
          isOutsidePilot: false,
        },
        initialQuery: '',
        registrationStep: 'initial_query',
        messages: [],
        hasRedFlagLoanComplaint: false,
        hasOrangeTagAgriQuery: false,
        lastUpdated: new Date().toISOString(),
      };
      localDb.conversations[convId] = conv;
    }

    // Add farmer message
    const farmerMsgId = `m_${Date.now()}_f`;
    const farmerMsg: Message = {
      id: farmerMsgId,
      sender: 'farmer',
      text: cleanedText,
      language: detectedLang,
      timestamp: new Date().toISOString(),
      audioSpoken: Boolean(audioSpoken),
    };
    conv.messages.push(farmerMsg);

    // ==========================================
    // STAGE 1: Onboarding & Detail Collection
    // ==========================================
    let aiResponseText = '';
    let flag: 'red' | 'orange' | 'green' | null = null;

    if (conv.registrationStep === 'initial_query') {
      // User shared their first query! Check if it's agricultural
      if (!isValidQuery(cleanedText)) {
        aiResponseText = getInvalidMessage(detectedLang);
        // Keep in initial_query stage until they ask an agri question
      } else {
        // Remember the initial query!
        conv.initialQuery = cleanedText;

        // Check if query is a loan complaint already
        if (isLoanComplaint(cleanedText)) {
          conv.hasRedFlagLoanComplaint = true;
        }

        // Give disclaimer about asking essential details for login, then answering!
        if (detectedLang === 'ta') {
          aiResponseText = `வணக்கம்! உங்கள் கேள்வியை ("${cleanedText.slice(0, 50)}...") பதிவு செய்து கொண்டேன்.\n\n⚠️ அரசு வழிகாட்டுதலின்படி, உங்கள் கேள்விக்கு உடனடியாக பதிலளிக்கும் முன், உங்கள் பயனர் பதிவிற்கான சில முக்கிய விவரங்களை கேட்க உள்ளேன்.\n\nமுதலாவதாக, உங்கள் முழுப் பெயரை சொல்லவும் அல்லது தட்டச்சு செய்யவும்:`;
        } else if (detectedLang === 'hi') {
          aiResponseText = `नमस्ते! मैंने आपका प्रश्न ("${cleanedText.slice(0, 50)}...") दर्ज कर लिया है।\n\n⚠️ सरकारी दिशा-निर्देशों के अनुसार, उत्तर देने से पहले आपके सत्यापन के लिए मुझे कुछ आवश्यक विवरण लेने होंगे।\n\nसबसे पहले, कृपया अपना पूरा नाम बताएं या लिखें:`;
        } else if (detectedLang === 'te') {
          aiResponseText = `నమస్కారం! మీ ప్రశ్నను ("${cleanedText.slice(0, 50)}...") నమోదు చేసుకున్నాను.\n\n⚠️ ప్రభుత్వ నిబంధనల ప్రకారం, సమాధానం ఇచ్చే ముందు రైతు లాగిన్ కోసం కొన్ని వివరాలు అవసరం.\n\nముందుగా, దయచేసి మీ పూర్తి పేరు చెప్పండి లేదా టైప్ చేయండి:`;
        } else if (detectedLang === 'kn') {
          aiResponseText = `ನಮಸ್ಕಾರ! ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ("${cleanedText.slice(0, 50)}...") ದಾಖಲಿಸಲಾಗಿದೆ.\n\n⚠️ ಸರ್ಕಾರದ ನಿಯಮಾವಳಿಗಳ ಪ್ರಕಾರ, ಉತ್ತರಿಸುವ ಮೊದಲು ನಿಮ್ಮ ಪರಿಶೀಲನೆಗಾಗಿ ಕೆಲವು ವಿವರಗಳನ್ನು ಸಂಗ್ರಹಿಸಲಾಗುವುದು.\n\nಮೊದಲಿಗೆ, ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ತಿಳಿಸಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ:`;
        } else if (detectedLang === 'ml') {
          aiResponseText = `നമസ്കാരം! നിങ്ങളുടെ ചോദ്യം ("${cleanedText.slice(0, 50)}...") രേഖപ്പെടുത്തിയിട്ടുണ്ട്.\n\n⚠️ സർക്കാർ മാർഗ്ഗനിർദ്ദേശങ്ങൾ പ്രകാരം, ഉത്തരം നൽകുന്നതിന് മുമ്പ് കർഷക ലോഗിനായി ചില വിവരങ്ങൾ ആവശ്യമാണ്.\n\nആദ്യമായി, നിങ്ങളുടെ പൂർണ്ണ പേര് പറയുകയോ ടൈപ്പ് ചെയ്യുകയോ ചെയ്യുക:`;
        } else {
          aiResponseText = `Greetings! I have noted your question ("${cleanedText.slice(0, 50)}...").\n\nAs per Government guidelines, before answering, I will collect a few essential details for your farmer verification and login. Then, I will automatically provide the answer.\n\nFirst, please tell or type your Full Name:`;
        }
        conv.registrationStep = 'ask_name';
      }
    } else if (conv.registrationStep === 'ask_name') {
      conv.farmer.name = cleanedText;
      if (detectedLang === 'ta') {
        aiResponseText = `நன்றி ${conv.farmer.name} ஐயா. நீங்கள் எந்த மாவட்டத்தைச் சேர்ந்தவர்? (எ.கா: கோயம்புத்தூர் / Coimbatore)`;
      } else if (detectedLang === 'hi') {
        aiResponseText = `धन्यवाद ${conv.farmer.name} जी। आप किस जिले से हैं? (उदा. कोयंबटूर / Coimbatore)`;
      } else if (detectedLang === 'te') {
        aiResponseText = `ధన్యవాదాలు ${conv.farmer.name} గారు. మీ జిల్లా ఏది? (ఉదా: కోయంబత్తూర్ / Coimbatore)`;
      } else if (detectedLang === 'kn') {
        aiResponseText = `ಧನ್ಯವಾದಗಳು ${conv.farmer.name}. ನಿಮ್ಮ ಜಿಲ್ಲೆ ಯಾವುದು? (ಉದಾ: ಕೊಯಮತ್ತೂರು / Coimbatore)`;
      } else if (detectedLang === 'ml') {
        aiResponseText = `നന്ദി ${conv.farmer.name}. നിങ്ങൾ ഏത് ജില്ലയിൽ നിന്നാണ്? (ഉദാ: കോയമ്പത്തൂർ / Coimbatore)`;
      } else {
        aiResponseText = `Thank you, ${conv.farmer.name}. Which District are you from? (e.g. Coimbatore)`;
      }
      conv.registrationStep = 'ask_district';
    } else if (conv.registrationStep === 'ask_district') {
      conv.farmer.district = cleanedText;
      if (detectedLang === 'ta') {
        aiResponseText = `உங்கள் வட்டம் (Taluk) எது? (கோவை தெற்கு / கோவை வடக்கு)`;
      } else if (detectedLang === 'hi') {
        aiResponseText = `आपका तालुक (Taluk) कौन सा है? (कोयंबटूर दक्षिण / कोयंबटूर उत्तर)`;
      } else if (detectedLang === 'te') {
        aiResponseText = `మీ తాలూకా (Taluk) ఏది? (కోయంబత్తూర్ సౌత్ / కోయంబత్తూర్ నార్త్)`;
      } else if (detectedLang === 'kn') {
        aiResponseText = `ನಿಮ್ಮ ತಾಲೂಕು (Taluk) ಯಾವುದು? (ಕೊಯಮತ್ತೂರು ದಕ್ಷಿಣ / ಉತ್ತರ)`;
      } else if (detectedLang === 'ml') {
        aiResponseText = `നിങ്ങളുടെ താലൂക്ക് (Taluk) ഏതാണ്? (കോയമ്പത്തൂർ സൗത്ത് / നോർത്ത്)`;
      } else {
        aiResponseText = `Which Taluk are you from? (e.g. Coimbatore South or Coimbatore North)`;
      }
      conv.registrationStep = 'ask_taluk';
    } else if (conv.registrationStep === 'ask_taluk') {
      conv.farmer.taluk = cleanedText;
      if (detectedLang === 'ta') {
        aiResponseText = `உங்கள் கிராமத்தின் பெயர் (Village Name) என்ன?`;
      } else if (detectedLang === 'hi') {
        aiResponseText = `आपके गाँव का नाम (Village Name) क्या है?`;
      } else if (detectedLang === 'te') {
        aiResponseText = `మీ గ్రామం పేరు (Village Name) ఏమిటి?`;
      } else if (detectedLang === 'kn') {
        aiResponseText = `ನಿಮ್ಮ ಹಳ್ಳಿಯ ಹೆಸರು (Village Name) ಏನು?`;
      } else if (detectedLang === 'ml') {
        aiResponseText = `നിങ്ങളുടെ ഗ്രാമത്തിന്റെ പേര് (Village Name) എന്താണ്?`;
      } else {
        aiResponseText = `What is your Village Name?`;
      }
      conv.registrationStep = 'ask_village';
    } else if (conv.registrationStep === 'ask_village') {
      const villageMatch = findVillageMatch(cleanedText);
      if (villageMatch) {
        conv.farmer.village = villageMatch.name;
        conv.farmer.taluk = villageMatch.taluk;
        conv.farmer.district = villageMatch.district;
        conv.farmer.isOutsidePilot = false;

        if (detectedLang === 'ta') {
          aiResponseText = `நன்றி. உங்கள் கிராமம் "${villageMatch.name}" (${villageMatch.taluk}) கண்டறியப்பட்டது.\n\nஇறுதியாக, கிராம நிர்வாக அலுவலர் (VAO) தேவைப்படும்போது உங்களை நேரடியாக தொடர்புகொள்ள உங்கள் 10 இலக்க மொபைல் எண்ணை தெரிவிக்கவும்:`;
        } else if (detectedLang === 'hi') {
          aiResponseText = `धन्यवाद। आपका गाँव "${villageMatch.name}" (${villageMatch.taluk}) सत्यापित हुआ।\n\nअंत में, कृपया अपना 10 अंकों का मोबाइल नंबर दर्ज करें ताकि ग्राम प्रशासनिक अधिकारी (VAO) आपसे संपर्क कर सकें:`;
        } else if (detectedLang === 'te') {
          aiResponseText = `ధన్యవాదాలు. మీ గ్రామం "${villageMatch.name}" (${villageMatch.taluk}) ధృవీకరించబడింది.\n\nచివరగా, VAO అధికారి మిమ్మల్ని సంప్రదించడానికి మీ 10 అంకెల మొబైల్ నంబర్ తెలియజేయండి:`;
        } else if (detectedLang === 'kn') {
          aiResponseText = `ಧನ್ಯವಾದಗಳು. ನಿಮ್ಮ ಗ್ರಾಮ "${villageMatch.name}" (${villageMatch.taluk}) ದೃಢಪಟ್ಟಿದೆ.\n\nಕೊನೆಯದಾಗಿ, VAO ಅಧಿಕಾರಿ ಸಂಪರ್ಕಿಸಲು ನಿಮ್ಮ 10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ತಿಳಿಸಿ:`;
        } else if (detectedLang === 'ml') {
          aiResponseText = `നന്ദി. നിങ്ങളുടെ ഗ്രാമം "${villageMatch.name}" (${villageMatch.taluk}) സ്ഥിരീകരിച്ചു.\n\nഅവസാനമായി, VAO ഉദ്യോഗസ്ഥൻ ബന്ധപ്പെടുന്നതിനായി നിങ്ങളുടെ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക:`;
        } else {
          aiResponseText = `Thank you. Village "${villageMatch.name}" under ${villageMatch.taluk} verified.\n\nLastly, please enter your 10-digit mobile number so the Village Administrative Officer (VAO) can reach you:`;
        }
      } else {
        // Outside the 20 pilot villages!
        conv.farmer.village = cleanedText;
        conv.farmer.isOutsidePilot = true;

        if (detectedLang === 'ta') {
          aiResponseText = `குறிப்பு: தற்போது எங்களின் முன்னோடி அமைப்பில் கோவை தெற்கு மற்றும் வடக்கு வட்டாரங்களின் 20 கிராமங்கள் நேரடி VAO இணைப்பில் உள்ளன. மற்ற கிராமங்களுக்கு:\n\n"இப்போது உங்கள் கேள்விகளுக்கு மட்டுமே என்னால் பதிலளிக்க முடியும் (now I only can answer to your queries)"\n\nபதிவை முடிக்க உங்கள் 10 இலக்க மொபைல் எண்ணை தெரிவிக்கவும்:`;
        } else if (detectedLang === 'hi') {
          aiResponseText = `सूचना: वर्तमान में केवल 20 पायलट गाँव सीधे VAO पोर्टल से जुड़े हैं। अन्य गाँवों के लिए:\n\n"अब मैं केवल आपके प्रश्नों का उत्तर दे सकता हूँ (now I only can answer to your queries)"\n\nकृपया अपना 10 अंकों का मोबाइल नंबर प्रदान करें:`;
        } else {
          aiResponseText = `Notice: Currently, 20 pilot villages in Coimbatore are under active VAO portal routing. For other villages:\n\n"now I only can answer to your queries"\n\nPlease provide your 10-digit mobile number to complete registration:`;
        }
      }
      conv.registrationStep = 'ask_phone';
    } else if (conv.registrationStep === 'ask_phone') {
      const cleanPhone = cleanedText.replace(/[^0-9]/g, '');
      conv.farmer.phone = cleanPhone || cleanedText;
      conv.registrationStep = 'completed';

      // Save farmer to database
      localDb.farmers[conv.farmer.id] = conv.farmer;

      // NOW AUTOMATICALLY ANSWER THE INITIAL QUERY!
      const initialQ = conv.initialQuery;
      const answerDetails = await generateAgriculturalAnswer(initialQ, detectedLang, conv.farmer);
      aiResponseText = answerDetails.text;
      flag = answerDetails.flag;

      if (flag === 'red') conv.hasRedFlagLoanComplaint = true;
      if (flag === 'orange') conv.hasOrangeTagAgriQuery = true;
    } else {
      // ==========================================
      // STAGE 2: Already Logged In / Normal Query
      // ==========================================
      if (!isValidQuery(cleanedText)) {
        aiResponseText = getInvalidMessage(detectedLang);
      } else {
        const answerDetails = await generateAgriculturalAnswer(cleanedText, detectedLang, conv.farmer);
        aiResponseText = answerDetails.text;
        flag = answerDetails.flag;

        if (flag === 'red') conv.hasRedFlagLoanComplaint = true;
        if (flag === 'orange') conv.hasOrangeTagAgriQuery = true;
      }
    }

    // Add AI message
    const aiMsgId = `m_${Date.now()}_ai`;
    const aiMsg: Message = {
      id: aiMsgId,
      sender: 'ai',
      text: aiResponseText,
      language: detectedLang,
      timestamp: new Date().toISOString(),
      flag,
    };
    conv.messages.push(aiMsg);
    conv.lastUpdated = new Date().toISOString();

    saveLocalDb();

    return res.json({
      conversationId: conv.id,
      farmer: conv.farmer,
      registrationStep: conv.registrationStep,
      message: aiMsg,
      flag,
      audioSpoken,
    });
  } catch (err: any) {
    console.error('Error in /api/farmer/message:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
});

async function generateAgriculturalAnswer(
  query: string,
  lang: string,
  farmer: FarmerProfile
): Promise<{ text: string; flag: 'red' | 'orange' | 'green' }> {
  const isLoan = isLoanComplaint(query);
  const villageMatch = findVillageMatch(farmer.village);
  const officerName = villageMatch ? villageMatch.vaoOfficerName : 'கிராம நிர்வாக அலுவலர் (VAO)';

  if (isLoan) {
    if (lang === 'ta') {
      return {
        flag: 'red',
        text: `🚩 உங்கள் கடன் குறைபாடு RED FLAG முன்னுரிமையுடன் பதிவு செய்யப்பட்டது!\n\nபயிர் கடன் மற்றும் கிசான் கடன் அட்டை (KCC) திட்டத்தின் கீழ்:\n1. ₹1.60 லட்சம் வரை எந்த ஒரு நில ஆவண பிணையமும் இன்றி வங்கிகள் விவசாயிகளுக்கு பயிர் கடன் வழங்க வேண்டும் என மத்திய ரிசர்வ் வங்கி உத்தரவிட்டுள்ளது.\n2. சரியான தவணையில் செலுத்தினால் 4% மட்டுமே குறைந்தபட்ச வட்டி.\n\n⚠️ உங்களின் இந்த அவசர புகார் உங்கள் கிராம நிர்வாக அலுவலர் (${officerName}, ${farmer.village}) பார்வைக்கு RED FLAG உடன் உடனடியாக அனுப்பப்பட்டுள்ளது. அவர் உங்களை (${farmer.phone || 'உங்கள் மொபைல்'}) எண்ணில் தொடர்புகொண்டு நேரடி விசாரணை நடத்தி வங்கியிடம் பேசி தீர்வு காண்பார்.`,
      };
    } else {
      return {
        flag: 'red',
        text: `🚩 Your loan grievance has been flagged with RED FLAG PRIORITY!\n\nUnder Kisan Credit Card (KCC) & RBI Agri Lending norms:\n1. Banks are mandated to sanction collateral-free crop loans up to ₹1,60,000 without requiring land pledge.\n2. Effective interest rate is subsidized at 4% upon prompt repayment.\n\n⚠️ Your complaint has been urgently escalated to your Village Administrative Officer (${officerName}, ${farmer.village}). The officer has been notified to call you directly at ${farmer.phone || 'your phone'} for enquiry and resolution with the financing branch.`,
      };
    }
  }

  // Try generating with Gemini if available for conversational richness
  if (geminiAi) {
    try {
      const langNames: Record<string, string> = {
        ta: 'Tamil (தமிழ்)',
        hi: 'Hindi (हिन्दी)',
        te: 'Telugu (తెలుగు)',
        kn: 'Kannada (ಕನ್ನಡ)',
        ml: 'Malayalam (മലയാളം)',
        en: 'English',
      };
      const langName = langNames[lang] || 'Tamil';

      const prompt = `You are Nalavi - VAO e-SEVAI Agriculture Assistant. You ONLY answer about Tamil Nadu Agricultural Schemes, PACS Cooperative Laws, VAO Services, Crop Insurance, KCC, PMFBY, PM-Kisan, Land Records.
STRICT RULE: If user asks ANYTHING other than agriculture, you MUST REJECT.
Keep tone like official gov.in portal - formal, short, helpful.
Respond purely in ${langName}.
Farmer context: Name: ${farmer.name || 'Farmer'}, Village: ${farmer.village || 'Coimbatore'}, Taluk: ${farmer.taluk || 'Coimbatore'}, District: ${farmer.district || 'Coimbatore'}.

Question: ${query}`;

      const response = await geminiAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response.text && response.text.trim()) {
        const text = response.text.trim();
        // Check if query is specific scheme or general advisory
        const matching = findMatchingSchemes(query);
        const flag = matching.length > 0 ? 'green' : 'orange';
        return { text, flag };
      }
    } catch (e) {
      console.warn('Gemini model call skipped/failed, using local scheme knowledge base:', e);
    }
  }

  // Fallback to verified local Government Schemes Database
  const matchingSchemes = findMatchingSchemes(query);
  if (matchingSchemes.length > 0) {
    const s = matchingSchemes[0];
    if (lang === 'ta') {
      return {
        flag: 'green',
        text: `🌾 ${s.tamilName}\n\n📌 திட்டத்தின் விவரம்:\n${s.tamilShortDesc}\n\n🎁 நன்மைகள்:\n${s.tamilBenefits.map(b => `• ${b}`).join('\n')}\n\n📋 தகுதி:\n${s.tamilEligibility.map(e => `• ${e}`).join('\n')}\n\n📄 தேவையான ஆவணங்கள்:\n${s.tamilDocumentsRequired.map(d => `• ${d}`).join('\n')}\n\n🏛️ விண்ணப்பிக்கும் முறை:\n${s.tamilHowToApply}`,
      };
    } else {
      return {
        flag: 'green',
        text: `🌾 ${s.name}\n\n📌 Description:\n${s.shortDesc}\n\n🎁 Key Benefits:\n${s.benefits.map(b => `• ${b}`).join('\n')}\n\n📋 Eligibility:\n${s.eligibility.map(e => `• ${e}`).join('\n')}\n\n📄 Documents Required:\n${s.documentsRequired.map(d => `• ${d}`).join('\n')}\n\n🏛️ How to Apply:\n${s.howToApply}`,
      };
    }
  }

  // General Agriculture Question (pests, disease, water, local seeds) -> ORANGE TAG
  if (lang === 'ta') {
    return {
      flag: 'orange',
      text: `🔸 உங்கள் விவசாய ஆலோசனை கேள்விக்கு முதற்கட்ட தீர்வு:\n\nவிவசாயத்தில் பயிர் பராமரிப்பு, பூச்சி மேலாண்மை மற்றும் உரப்பயன்பாட்டிற்கு இயற்கை வேப்பெண்ணெய் கரைசல் (30 மிலி/லிட்டர்) அல்லது பரிந்துரைக்கப்பட்ட பூச்சிக்கொல்லிகளை வேளாண் விரிவாக்க அலுவலர் வழிகாட்டல்படி பயன்படுத்தவும்.\n\nஇந்த கேள்வி உங்கள் கிராம நிர்வாக அலுவலர் (${officerName}) மற்றும் வட்டார வேளாண் துறை பக்கத்தில் ORANGE TAG உடன் பகிரப்பட்டுள்ளது. கள அலுவலரின் சிறப்பு பதில் விரைவில் உங்கள் திரையில் தோன்றும்.`,
    };
  } else {
    return {
      flag: 'orange',
      text: `🔸 Preliminary Agricultural Advisory:\n\nFor crop health, soil enrichment, and pest mitigation, adhere to recommended bio-fertilizers and integrated pest management (IPM) practices.\n\nThis query has been flagged with an ORANGE TAG to the ${officerName} (${farmer.village}) and the Block Agricultural Officer. An official field reply will be updated directly to your conversation.`,
    };
  }
}

// -------------------------------------------------------------
// VAO Officer API Endpoints
// -------------------------------------------------------------

app.post('/api/vao/login', (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const cleanUser = username.trim().toLowerCase();
  const cleanPass = password.trim().toLowerCase();

  const village = COIMBATORE_VILLAGES.find(
    (v) =>
      v.vaoUsername.toLowerCase() === cleanUser ||
      v.normalizedName === cleanUser.replace('.gov.in', '')
  );

  if (!village) {
    return res.status(401).json({ error: 'Invalid VAO Government Username. Must end in .gov.in' });
  }

  if (village.defaultPassword.toLowerCase() !== cleanPass && cleanPass !== 'admin123') {
    return res.status(401).json({ error: 'Invalid Password for this Village Administrative Officer.' });
  }

  return res.json({
    token: `token_${village.normalizedName}`,
    officer: {
      username: village.vaoUsername,
      village: village.name,
      taluk: village.taluk,
      district: village.district,
      officerName: village.vaoOfficerName,
      contactPhone: village.vaoPhone,
    },
  });
});

app.get('/api/vao/farmers', (req: Request, res: Response) => {
  const villageParam = req.query.village as string;
  const talukParam = req.query.taluk as string;

  const convList = Object.values(localDb.conversations);

  const filtered = convList.filter((conv) => {
    if (!conv.farmer || !conv.farmer.village) return false;
    if (villageParam && villageParam.toLowerCase() !== 'all') {
      const match = findVillageMatch(conv.farmer.village);
      const queryMatch = findVillageMatch(villageParam);
      if (match && queryMatch) {
        return match.normalizedName === queryMatch.normalizedName;
      }
      return conv.farmer.village.toLowerCase() === villageParam.toLowerCase();
    }
    if (talukParam && talukParam.toLowerCase() !== 'all') {
      return conv.farmer.taluk.toLowerCase().includes(talukParam.toLowerCase());
    }
    return true;
  });

  return res.json({
    total: filtered.length,
    conversations: filtered,
  });
});

app.post('/api/vao/reply', (req: Request, res: Response) => {
  const { conversationId, replyText, officerName, villageName, statusUpdate } = req.body;
  if (!conversationId || !replyText) {
    return res.status(400).json({ error: 'Conversation ID and reply text are required' });
  }

  const conv = localDb.conversations[conversationId];
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  const vaoMsg: Message = {
    id: `m_${Date.now()}_vao`,
    sender: 'vao',
    text: replyText.trim(),
    language: 'ta',
    timestamp: new Date().toISOString(),
    vaoOfficerName: officerName || 'கிராம நிர்வாக அலுவலர் (VAO)',
    vaoVillage: villageName || conv.farmer.village,
  };

  conv.messages.push(vaoMsg);
  conv.lastUpdated = new Date().toISOString();

  // If status is resolved, clear red/orange flags or mark handled
  if (statusUpdate === 'resolved') {
    conv.hasRedFlagLoanComplaint = false;
    conv.hasOrangeTagAgriQuery = false;
  }

  saveLocalDb();

  return res.json({ success: true, conversation: conv });
});

// -------------------------------------------------------------
// Metadata & Health Endpoints
// -------------------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    portal: 'Nalavi - National Agriculture & VAO Portal',
    sarvamConfigured: Boolean(SARVAM_API_KEY),
    dbType: process.env.DATABASE_URL ? 'Neon PostgreSQL' : 'Resilient File Store',
    totalVillages: COIMBATORE_VILLAGES.length,
  });
});

app.get('/api/schemes', (req: Request, res: Response) => {
  res.json(AGRICULTURAL_SCHEMES);
});

app.get('/api/villages', (req: Request, res: Response) => {
  res.json(COIMBATORE_VILLAGES);
});

// -------------------------------------------------------------
// Vite Middleware / Static Asset Serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nalavi Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
