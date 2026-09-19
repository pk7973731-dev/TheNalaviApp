// Nalavi - VAO e-SEVAI Agriculture Whitelist & Guard

export const VALID_KEYWORDS = [
  // User specified core keywords
  "pacs", "pmfby", "kcc", "pm-kisan", "patta", "chitta", "crop", "loan", "subsidy", "fertilizer", "vao", "mandi", "agri",
  // Expanded user whitelist
  "paddy", "cooperative society", "cooperative", "society", "adangal", "seeds", "seed", "land", "farming", "farm", 
  "irrigation", "market price", "scheme eligibility", "scheme", "by-law", "bylaw", "section 21", "sec 21", "grievance",
  // Agriculture domain terms
  "soil", "rice", "wheat", "cotton", "sugarcane", "coconut", "banana", "tomato", "onion", "vegetable", "urea", "dap",
  "potash", "pesticide", "insect", "pest", "disease", "drip", "sprinkler", "water", "borewell", "well", "pump", "solar",
  "tractor", "fasal", "bima", "insurance", "fmb", "harvest", "weed", "cow", "cows", "cattle", "dairy", "milk", "goat",
  "poultry", "drought", "rain", "weather", "monsoon", "tnau", "uzhavan", "tahsildar", "acre", "cent", "kisan",
  "subvention", "interest", "horticulture",

  // Tamil keywords (தமிழ்)
  "விவசாயம்", "வேளாண்", "பயிர்", "நெல்", "கரும்பு", "தென்னை", "வாழை", "மண்", "உரம்",
  "யூரியா", "பூச்சி", "நோய்", "மருந்து", "சொட்டு நீர்", "பாசனம்", "கிணறு",
  "போர்வெல்", "சூரிய ஒளி", "சோலார்", "டிராக்டர்", "மானியம்", "திட்டம்", "கடன்", "கிசான்",
  "காப்பீடு", "பட்டா", "சிட்டா", "அடங்கல்", "புல வரைபடம்", "அறுவடை", "விதை", "களை",
  "மாடு", "ஆடு", "கோழி", "பால்", "சந்தை", "விலை", "வறட்சி", "மழை", "பருவமழை",
  "உழவன்", "ஏக்கர்", "சென்ட்", "நிலம்", "கூட்டுறவு", "பாக்ஸ்", "சங்கம்", "பிரிவு 21",
  "வி.ஏ.ஓ", "கிராம நிர்வாக", "துணை விதி", "புகார்", "இ-சேவை"
];

export const EXACT_INVALID_MESSAGES: Record<string, string> = {
  ta: "🚫 மன்னிக்கவும், இது வேளாண் திட்டங்கள் சம்பந்தப்பட்ட கேள்வி அல்ல. நான் வேளாண் உதவி மற்றும் PACS சட்டங்கள் பற்றி மட்டுமே பதிலளிப்பேன். வேளாண் திட்டம் பற்றி கேளுங்கள். (எ.கா: PMFBY, KCC கடன், பட்டா நிலை)",
  en: "🚫 Sorry, this is not related to agricultural schemes. I can only assist with agricultural schemes, PACS laws and VAO services. Please ask about a farming scheme. (Eg: PMFBY, KCC loan, Patta status)",
  hi: "🚫 क्षमा करें, यह कृषि योजनाओं से संबंधित नहीं है। मैं केवल कृषि योजनाओं, PACS कानूनों और VAO सेवाओं के बारे में ही सहायता कर सकता हूँ। कृपया कृषि योजना के बारे में पूछें। (उदा: PMFBY, KCC ऋण, पट्टा स्थिति)",
  te: "🚫 క్షమించండి, ఇది వ్యవసాయ పథకాలకు సంబంధించినది కాదు. నేను వ్యవసాయ పథకాలు, PACS చట్టాలు మరియు VAO సేవల గురించి మాత్రమే సహాయం చేస్తాను. (ఉదా: PMFBY, KCC రుణం, పట్టా స్థితి)",
  ml: "🚫 ക്ഷമിക്കണം, ഇത് കാർഷിക പദ്ധതികളുമായി ബന്ധപ്പെട്ടതല്ല. ഞാൻ കാർഷിക പദ്ധതികൾ, PACS നിയമങ്ങൾ, VAO സേവനങ്ങൾ എന്നിവയെക്കുറിച്ച് മാത്രമേ സഹായിക്കൂ. (ഉദാ: PMFBY, KCC വായ്പ, പട്ട സ്ഥിതി)",
  kn: "🚫 ಕ್ಷಮಿಸಿ, ಇದು ಕೃಷಿ ಯೋಜನೆಗಳಿಗೆ ಸಂಬಂಧಿಸಿಲ್ಲ. ನಾನು ಕೃಷಿ ಯೋಜನೆಗಳು, PACS ಕಾನೂನುಗಳು ಮತ್ತು VAO ಸೇವೆಗಳ ಬಗ್ಗೆ ಮಾತ್ರ ಸಹಾಯ ಮಾಡುತ್ತೇನೆ. (ಉದಾ: PMFBY, KCC ಸಾಲ, ಪಟ್ಟಾ ಸ್ಥಿತಿ)"
};

export function resolveDetectedLanguage(text: string, fallbackLang: string = 'ta'): string {
  if (!text) return fallbackLang;
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta';
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te';
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml';
  
  // English words check
  if (/^[a-zA-Z0-9\s.,!?'"()-]+$/.test(text.trim())) {
    return 'en';
  }
  return fallbackLang || 'ta';
}

export function getInvalidMessage(lang: string = 'ta'): string {
  return EXACT_INVALID_MESSAGES[lang] || EXACT_INVALID_MESSAGES['en'];
}

/**
 * Validates whether user text has valid agricultural / PACS / VAO intent.
 * Also accommodates brief standard greetings, while rejecting non-agricultural topics.
 */
export function isValidQuery(text: string): boolean {
  if (!text || !text.trim()) return false;
  const t = text.toLowerCase().trim();

  // Allow single words like "hi", "hello", "வணக்கம்", "namaste" only for polite first contact
  const politeGreetings = ["வணக்கம்", "namaste", "vanakkam"];
  if (politeGreetings.some(g => t === g || t.startsWith(g))) {
    return true;
  }

  // Check against valid whitelist keywords
  return VALID_KEYWORDS.some(k => t.includes(k.toLowerCase()));
}
