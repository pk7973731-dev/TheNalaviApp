import { SchemeInfo } from '../types';

export const AGRICULTURAL_SCHEMES: SchemeInfo[] = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    tamilName: 'பி.எம் கிசான் திட்டம் (பிரதம மந்திரி கிசான் சம்மான் நிதி)',
    hindiName: 'पीएम-किसान (प्रधानमंत्री किसान सम्मान निधि)',
    category: 'direct_benefit',
    shortDesc: 'Financial support of ₹6,000 per year directly to bank accounts in 3 equal installments of ₹2,000 every 4 months.',
    tamilShortDesc: 'விவசாயிகளுக்கு ஆண்டுக்கு ₹6,000 நேரடி உதவித்தொகை (4 மாதங்களுக்கு ஒருமுறை ₹2,000 வீதம் 3 தவணைகள்).',
    benefits: [
      '₹6,000 per year credited directly to Aadhaar-linked bank account (DBT).',
      'Assists with purchasing seeds, fertilizers, and meeting domestic farm expenses.',
      'No intermediary or commission; 100% transparent central funding.'
    ],
    tamilBenefits: [
      'ஆண்டுக்கு ₹6,000 நேரடியாக ஆதார் இணைக்கப்பட்ட வங்கிக் கணக்கில் வரவு வைக்கப்படுகிறது.',
      'விதை, உரம் வாங்க மற்றும் சாகுபடி செலவுகளுக்கு நிதி உதவி.',
      'இடைத்தரகர்கள் இன்றி 100% நேரடி மத்திய அரசு நிதி உதவி.'
    ],
    eligibility: [
      'All landholding farmer families having cultivable landholding in their names.',
      'Name must be updated in Tamil Nadu Land Records (Patta/Chitta).',
      'Excludes institutional landholders, income tax payers, and serving/retired govt employees.'
    ],
    tamilEligibility: [
      'சொந்தமாக சாகுபடி நிலம் வைத்துள்ள அனைத்து விவசாய குடும்பங்கள்.',
      'தமிழ்நாடு நில ஆவணங்களில் (பட்டா/சிட்டா) பெயர் பதிவு செய்திருக்க வேண்டும்.',
      'வருமான வரி செலுத்துவோர் மற்றும் அரசு ஊழியர்கள் தவிர பிற அனைத்து சிறு, குறு, பெரிய விவசாயிகள் தகுதியானவர்கள்.'
    ],
    documentsRequired: [
      'Aadhaar Card (linked with mobile number for OTP / e-KYC)',
      'Land Records (Patta, Chitta, Adangal)',
      'Bank Account Passbook (Aadhaar Seeded)',
      'Passport size photograph'
    ],
    tamilDocumentsRequired: [
      'ஆதார் அட்டை (மொபைல் எண் இணைக்கப்பட்டிருக்க வேண்டும்)',
      'நில ஆவணங்கள் (பட்டா, சிட்டா, அடங்கல்)',
      'ஆதார் இணைக்கப்பட்ட வங்கிக் கணக்கு புத்தகம்',
      'பாஸ்போர்ட் அளவு புகைப்படம்'
    ],
    howToApply: 'Apply through your local Village Administrative Officer (VAO), e-Sevai / CSC Center, or via pmkisan.gov.in portal. e-KYC via OTP or biometrics is mandatory.',
    tamilHowToApply: 'உங்கள் கிராம நிர்வாக அலுவலர் (VAO), இ-சேவை மையம் மூலமாகவோ அல்லது pmkisan.gov.in தளத்திலோ விண்ணப்பிக்கலாம். இ-கேஒய்சி (e-KYC) முடிப்பது கட்டாயமாகும்.',
    subsidyRate: '₹6,000 annually (100% grant)'
  },
  {
    id: 'pmfby',
    name: 'PMFBY (Pradhan Mantri Fasal Bima Yojana - Crop Insurance)',
    tamilName: 'பிரதம மந்திரி பயிர் காப்பீட்டுத் திட்டம் (பயிர் நஷ்டஈடு)',
    hindiName: 'प्रधानमंत्री फसल बीमा योजना',
    category: 'insurance',
    shortDesc: 'Comprehensive crop insurance covering non-preventable natural risks from pre-sowing to post-harvest.',
    tamilShortDesc: 'வறட்சி, வெள்ளம், பூச்சித் தாக்குதலால் பயிர் சேதமடைந்தால் உரிய நிவாரணம் வழங்கும் விரிவான பயிர் காப்பீட்டுத் திட்டம்.',
    benefits: [
      'Very low farmer premium: 2% for Kharif, 1.5% for Rabi, 5% for annual commercial/horticulture crops.',
      'Full insured amount disbursed for localized calamities (hailstorm, landslide, inundation) and post-harvest losses.',
      'Direct DBT settlement to bank accounts based on satellite & crop cutting experiments.'
    ],
    tamilBenefits: [
      'விவசாயி செலுத்த வேண்டிய பிரீமியம் மிகக் குறைவு: காரிஃப் 2%, ரபி 1.5%, வணிகப் பயிர்களுக்கு 5% மட்டுமே.',
      'வறட்சி, பெருமழை, பூச்சித் தாக்குதலால் மகசூல் இழப்பு ஏற்பட்டால் முழு இழப்பீடு கிடைக்கும்.',
      'அறுவடைக்கு பிந்தைய இழப்புகளுக்கும் உடனடி ஆய்வு செய்து இழப்பீடு.'
    ],
    eligibility: [
      'All farmers including sharecroppers and tenant farmers growing notified crops in notified areas.',
      'Both loanee and non-loanee farmers are eligible.'
    ],
    tamilEligibility: [
      'அறிவிக்கப்பட்ட பகுதிகளில் பயிர் சாகுபடி செய்யும் அனைத்து விவசாயிகள், குத்தகை விவசாயிகள்.',
      'வங்கி கடன் பெற்ற மற்றும் கடன் பெறாத விவசாயிகள் இருவரும் காப்பீடு செய்யலாம்.'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Land ownership document (Patta/Chitta) or Sowing Certificate issued by VAO',
      'Bank passbook copy',
      'Crop Sowing Certificate / Adangal copy from VAO'
    ],
    tamilDocumentsRequired: [
      'ஆதார் அட்டை',
      'நில உரிமை ஆவணம் (பட்டா/சிட்டா)',
      'கிராம நிர்வாக அலுவலர் (VAO) வழங்கும் பயிர் சாகுபடி சான்றிதழ் / அடங்கல்',
      'வங்கி கணக்கு புத்தகம்'
    ],
    howToApply: 'Contact your Village Administrative Officer (VAO), Primary Agricultural Cooperative Credit Society (PACCS), Commercial Bank, or CSC e-Sevai Center within notified cutoff dates.',
    tamilHowToApply: 'பயிரிடப்பட்ட குறிப்பிட்ட காலக்கெடுவுக்குள் கிராம நிர்வாக அலுவலர் (VAO), தொடக்க வேளாண்மை கூட்டுறவு வங்கி (PACCS) அல்லது பொது இ-சேவை மையத்தில் பதிவு செய்ய வேண்டும்.',
    subsidyRate: 'Govt subsidizes 80% to 90% of total actuarial premium'
  },
  {
    id: 'kcc',
    name: 'Kisan Credit Card (KCC) Scheme',
    tamilName: 'கிசான் கடன் அட்டை திட்டம் (பயிர் கடன்)',
    hindiName: 'किसान क्रेडिट कार्ड योजना',
    category: 'credit',
    shortDesc: 'Timely and adequate credit support to farmers for cultivation expenses and animal husbandry at heavily subsidized interest.',
    tamilShortDesc: 'விவசாயிகளுக்கு சாகுபடி மற்றும் கால்நடை பராமரிப்பு செலவுகளுக்கு 4% குறைந்த வட்டியில் உரிய நேரத்தில் கிடைக்கும் வங்கி கடன் அட்டை.',
    benefits: [
      'Crop loan up to ₹3,00,000 at effective interest rate of only 4% per annum (with prompt repayment 3% interest subvention).',
      'No collateral required for loans up to ₹1,60,000.',
      'Covers crop cultivation, post-harvest expenses, pump repairs, and farm maintenance.',
      'ATM-enabled RuPay Kisan Card for easy withdrawal whenever required.'
    ],
    tamilBenefits: [
      'சரியான நேரத்தில் திரும்பச் செலுத்தினால் வெறும் 4% வட்டி மட்டுமே (₹3 லட்சம் வரை).',
      '₹1.60 லட்சம் வரை பிணையம் (Collateral/பத்திரம்) எதுவும் தேவையில்லை.',
      'ரூபே கிசான் ஏடிஎம் கார்டு (ATM Card) மூலம் தேவையான நேரத்தில் பணம் எடுத்துக் கொள்ளலாம்.',
      'கால்நடை வளர்ப்பு, ஆடு, மாடு, கோழி வளர்ப்புக்கும் தனியாக KCC கடன் வழங்கப்படுகிறது.'
    ],
    eligibility: [
      'All individual farmers, joint borrowers, tenant farmers, oral lessees, and Self Help Groups (SHGs).',
      'Dairy, poultry, and fishery farmers also eligible up to ₹2 Lakh.'
    ],
    tamilEligibility: [
      'சொந்த நிலமுள்ள விவசாயிகள், குத்தகை விவசாயிகள், சுயஉதவிக் குழுக்கள்.',
      'கால்நடை, ஆடு மாடு வளர்ப்போர், மீன்வளர்ப்பு விவசாயிகளுக்கும் உண்டு.'
    ],
    documentsRequired: [
      'Duly filled KCC Application Form',
      'Aadhaar Card and Voter ID',
      'Land revenue records (Patta, Chitta, Adangal with VAO verification)',
      'No-Due Certificate from other local financial institutions (or declaration)'
    ],
    tamilDocumentsRequired: [
      'பூர்த்தி செய்யப்பட்ட கேசிசி விண்ணப்பப் படிவம்',
      'ஆதார் அட்டை மற்றும் வாக்காளர் அட்டை',
      'நில ஆவணங்கள் (பட்டா, சிட்டா, VAO கையொப்பமிட்ட அடங்கல்)',
      'பாஸ்போர்ட் சைஸ் போட்டோ மற்றும் பிற வங்கிகளில் கடன் இல்லை என்ற உறுதிமொழி'
    ],
    howToApply: 'Submit application to your local Cooperative Society (PACCS) or Nationalized Bank branch. Your VAO can verify your land holding and issue the required Cultivation Certificate.',
    tamilHowToApply: 'உங்கள் கிராம தொடக்க வேளாண்மை கூட்டுறவு சங்கம் (PACCS) அல்லது அருகிலுள்ள தேசிய மயமாக்கப்பட்ட வங்கியில் VAO சான்றளித்த அடங்கலுடன் விண்ணப்பிக்கவும்.',
    subsidyRate: '4% effective interest (7% normal - 3% prompt repayment rebate)'
  },
  {
    id: 'pmksy-drip',
    name: 'PMKSY - Micro Irrigation (Drip & Sprinkler Subsidy)',
    tamilName: 'பிரதம மந்திரி நுண்ணீர் பாசனத் திட்டம் (சொட்டு நீர் பாசனம்)',
    hindiName: 'पीएम कृषि सिंचाई योजना (सूक्ष्म सिंचाई)',
    category: 'irrigation',
    shortDesc: 'Up to 100% subsidy for Small & Marginal farmers and 75% for other farmers to install Drip and Sprinkler irrigation systems.',
    tamilShortDesc: 'சிறு மற்றும் குறு விவசாயிகளுக்கு 100% முழு மானியத்திலும், இதர விவசாயிகளுக்கு 75% மானியத்திலும் சொட்டு நீர் பாசன கருவிகள்.',
    benefits: [
      'Saves 40% to 60% water while increasing crop yield by 30% to 50%.',
      '100% financial assistance for small & marginal farmers in Tamil Nadu.',
      'Fertigation equipment (injecting fertilizer through drip water) covered.',
      'Full installation, pipes, emitters, and 3-year warranty included.'
    ],
    tamilBenefits: [
      'தமிழ்நாட்டில் சிறு, குறு விவசாயிகளுக்கு 100% முழு மானியம்; இதர விவசாயிகளுக்கு 75% மானியம்.',
      'தண்ணீர் பயன்பாடு 50% வரை மிச்சமாகும்; மகசூல் 30% முதல் 50% வரை அதிகரிக்கும்.',
      'உரங்களை நேரடியாக வேர்களுக்கு சொட்டுநீர் வழியாக செலுத்தும் வசதி (Fertigation).',
      'அரசு அங்கீகாரம் பெற்ற நிறுவனங்கள் மூலம் இலவசமாக வயலில் நிறுவித் தரப்படும்.'
    ],
    eligibility: [
      'Farmers having valid land records and an operational water source (borewell, open well, or farm pond).',
      'Small/Marginal Farmers (< 5 acres / 2.5 hectares) get top priority.'
    ],
    tamilEligibility: [
      'சொந்த நிலம் மற்றும் பாசன நீர் ஆதாரம் (போர்வெல், கிணறு அல்லது பண்ணைக் குட்டை) உள்ள அனைத்து விவசாயிகள்.',
      'சிறு/குறு விவசாயிகள் (5 ஏக்கருக்கும் குறைவான நிலம்) முன்னுரிமை பெறுவர்.'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Patta, Chitta, FMB Sketch, Adangal copy',
      'Small/Marginal Farmer Certificate from VAO (சிறு/குறு விவசாயி சான்றிதழ்)',
      'Water source & pump certificate',
      'Bank passbook copy'
    ],
    tamilDocumentsRequired: [
      'ஆதார் அட்டை நகல்',
      'பட்டா, சிட்டா, புல வரைபடம் (FMB) மற்றும் அடங்கல்',
      'கிராம நிர்வாக அலுவலர் (VAO) வழங்கும் சிறு/குறு விவசாயி சான்றிதழ்',
      'கிணறு/போர்வெல் மின் இணைப்பு ஆவணம்',
      'வங்கி கணக்கு புத்தக நகல்'
    ],
    howToApply: 'Register at the local Block Agricultural Extension Office (ADA Office) or Horticultural Department, or online at tnhorticulture.tn.gov.in / mifarmers.gov.in with VAO certificate.',
    tamilHowToApply: 'உங்கள் வட்டார வேளாண்மை உதவி இயக்குநர் அலுவலகம் அல்லது தோட்டக்கலைத் துறை அலுவலகத்தில் VAO வழங்கிய சிறு/குறு விவசாயி சான்றிதழுடன் விண்ணப்பிக்கவும்.',
    subsidyRate: '100% for Small/Marginal Farmers; 75% for others'
  },
  {
    id: 'pm-kusum',
    name: 'PM-KUSUM (Pradhan Mantri Kisan Urja Suraksha evam Utthaan Mahabhiyan)',
    tamilName: 'பி.எம் குசும் - சூரிய ஒளி மின் மோட்டார் பம்பு திட்டம்',
    hindiName: 'पीएम कुसुम योजना (सोलर पंप)',
    category: 'solar',
    shortDesc: 'Subsidized standalone Solar Agriculture Pumps (5 HP, 7.5 HP, 10 HP) providing reliable daytime electricity for irrigation.',
    tamilShortDesc: 'பகல் நேர விவசாய பாசனத்திற்கு 70% வரை மானியத்துடன் கூடிய சோலார் பம்பு செட் திட்டம்.',
    benefits: [
      'Up to 70% total subsidy (30% Central + 40% State in Tamil Nadu). Farmer pays only 30%.',
      'Uninterrupted free daytime solar power for 25 years without recurring electricity bills.',
      'Solar panels carry 25 years performance warranty.',
      'Eliminates diesel generator costs completely.'
    ],
    tamilBenefits: [
      '70% வரை அரசு மானியம் (மத்திய அரசு 30% + தமிழக அரசு 40%). விவசாயி 30% மட்டுமே செலுத்த வேண்டும்.',
      '25 வருடங்களுக்கு பகலில் தடையற்ற இலவச மின்சாரம்; மாதாந்திர மின் கட்டணம் இல்லை.',
      'டீசல் பம்பு செட் செலவு முற்றிலும் நீங்குகிறது.',
      'சோலார் பேனல்களுக்கு 25 ஆண்டுகள் வரை உத்தரவாதம் உண்டு.'
    ],
    eligibility: [
      'Farmers waiting for agricultural electricity service connection or with un-electrified diesel pumpsets.',
      'Adequate water source available.'
    ],
    tamilEligibility: [
      'விவசாய மின் இணைப்பு வேண்டி காத்திருக்கும் விவசாயிகள் மற்றும் டீசல் இன்ஜின் பயன்படுத்தும் விவசாயிகள்.',
      'நிலத்தடி நீர் ஆதாரம் உள்ள நிலம்.'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Patta & Chitta',
      'VAO Certificate regarding land ownership and water availability',
      'Photographs of water source / well',
      'Bank passbook copy'
    ],
    tamilDocumentsRequired: [
      'ஆதார் அட்டை',
      'பட்டா மற்றும் சிட்டா',
      'VAO வழங்கும் நில உரிமை மற்றும் நீர் ஆதாரம் உறுதி சான்றிதழ்',
      'கிணறு/போர்வெல் புகைப்படங்கள் மற்றும் வங்கி கணக்கு புத்தகம்'
    ],
    howToApply: 'Apply through Tamil Nadu Energy Development Agency (TEDA) or Agriculture Engineering Department (AED) through TEDA/TANGEDCO portal with VAO verification.',
    tamilHowToApply: 'வேளாண் பொறியியல் துறை (AED) அல்லது தமிழ்நாடு எரிசக்தி மேம்பாட்டு முகமை (TEDA) மூலமாக VAO ஒப்புதலுடன் விண்ணப்பிக்கலாம்.',
    subsidyRate: 'Up to 70% subsidy (Farmer pays 30%)'
  },
  {
    id: 'smam',
    name: 'SMAM (Sub-Mission on Agricultural Mechanization)',
    tamilName: 'வேளாண் இயந்திரமயமாக்கல் திட்டம் (டிராக்டர், பவர் டில்லர் மானியம்)',
    hindiName: 'कृषि यंत्रीकरण उप-मिशन',
    category: 'machinery',
    shortDesc: 'Financial assistance for purchasing tractors, power tillers, rotavators, harvesters, and establishing Custom Hiring Centres.',
    tamilShortDesc: 'டிராக்டர், பவர் டில்லர், களையெடுக்கும் இயந்திரங்கள் மற்றும் நெல் அறுவடை இயந்திரங்கள் வாங்க 40% முதல் 50% வரை மானியம்.',
    benefits: [
      '40% to 50% subsidy on agricultural machinery for individual farmers.',
      'Special 50% subsidy for SC/ST, small, marginal, and women farmers.',
      'Up to ₹10 Lakh subsidy (40%) to establish Village Custom Hiring Centers for rental machinery.'
    ],
    tamilBenefits: [
      'டிராக்டர், பவர்டில்லர், ரோட்டவேட்டர், விதைப்புக் கருவிகள் வாங்க 40% முதல் 50% வரை நேரடி மானியம்.',
      'பெண்கள், தாழ்த்தப்பட்டோர் மற்றும் சிறு குறு விவசாயிகளுக்கு 50% வரை மானியம்.',
      'கிராம அளவில் வாடகை இயந்திர மையம் (Custom Hiring Centre) அமைக்க ₹10 லட்சம் வரை மானியம்.'
    ],
    eligibility: [
      'All landholding farmers registered in the state farmer database (Agrisnet/Uzhavan).',
      'Must not have availed subsidy for the same machine in the last 5 to 7 years.'
    ],
    tamilEligibility: [
      'நில உரிமையுள்ள அனைத்து விவசாயிகள்.',
      'கடந்த 5 முதல் 7 ஆண்டுகளில் அதே இயந்திரத்திற்கு மானியம் பெற்றிருக்கக் கூடாது.'
    ],
    documentsRequired: [
      'Aadhaar Card',
      'Patta, Chitta, Adangal',
      'Small/Marginal Farmer Certificate from VAO',
      'Driving license (for tractor subsidy)',
      'Quotation from authorized implement dealer'
    ],
    tamilDocumentsRequired: [
      'ஆதார் அட்டை',
      'பட்டா, சிட்டா, அடங்கல் நகல்',
      'VAO சான்றளித்த சிறு/குறு விவசாயி சான்றிதழ்',
      'அங்கீகரிக்கப்பட்ட டீலரிடமிருந்து பெறப்பட்ட விலைப்புள்ளி (Quotation)'
    ],
    howToApply: 'Apply via Uzhavan App (உழவன் செயலி) or online at agrimachinery.nic.in / Department of Agricultural Engineering office with VAO land certificate.',
    tamilHowToApply: 'உழவன் செயலி (Uzhavan App) அல்லது வட்டார வேளாண் பொறியியல் துறை உதவி செயற்பொறியாளர் அலுவலகத்தில் விண்ணப்பிக்கவும்.',
    subsidyRate: '40% to 50% direct subsidy'
  },
  {
    id: 'soil-health-card',
    name: 'Soil Health Card Scheme',
    tamilName: 'மண் வள அட்டை திட்டம் (இலவச மண் பரிசோதனை)',
    hindiName: 'मृदा स्वास्थ्य कार्ड योजना',
    category: 'soil_health',
    shortDesc: 'Free scientific testing of farm soil every 2 years with custom recommendations for fertilizers and micronutrients.',
    tamilShortDesc: 'விவசாய நிலத்தின் மண்ணை இலவசமாக ஆய்வு செய்து, தகுந்த உர அளவு மற்றும் சத்து குறைபாடுகளை தெரிவிக்கும் அட்டை.',
    benefits: [
      'Free testing of 12 critical parameters: N, P, K, Secondary (S), Micronutrients (Zn, Fe, Cu, Mn, Bo), and Physical (pH, EC, OC).',
      'Prevents overuse of chemical fertilizers and reduces cultivation cost by 20% to 30%.',
      'Improves long-term soil productivity and crop resistance to pests.'
    ],
    tamilBenefits: [
      '12 விதமான மண் சத்துக்கள் (தழை, மணி, சாம்பல் சத்து மற்றும் நுண்ணூட்டச் சத்துக்கள்) இலவசமாக ஆய்வு செய்யப்படும்.',
      'தேவைக்கு அதிகமான ரசாயன உர பயன்பாட்டை தடுத்து சாகுபடி செலவை 25% வரை குறைக்கிறது.',
      'மண்ணின் வளத்தை பாதுகாத்து கூடுதல் மகசூலை உறுதி செய்கிறது.'
    ],
    eligibility: ['All farmers having agricultural land.'],
    tamilEligibility: ['விவசாய நிலம் வைத்துள்ள அனைத்து விவசாயிகள்.'],
    documentsRequired: ['Patta/Chitta copy', 'Aadhaar Card', 'GPS coordinates or survey number of the field'],
    tamilDocumentsRequired: ['பட்டா/சிட்டா அல்லது சர்வே எண்', 'ஆதார் அட்டை', 'மண் மாதிரி எடுக்கப்படும் வயல் விவரம்'],
    howToApply: 'Contact your Village Administrative Officer (VAO) or Block Agricultural Officer (AO) during village soil collection drives or visit nearest Soil Testing Lab.',
    tamilHowToApply: 'உங்கள் கிராம வேளாண் உதவி அலுவலர் (AAO) அல்லது VAO-வை அணுகி இலவச மண் மாதிரி சேகரிப்புக்கு பதிவு செய்யலாம்.',
    subsidyRate: '100% Free of Cost'
  },
  {
    id: 'aif',
    name: 'Agriculture Infrastructure Fund (AIF)',
    tamilName: 'வேளாண் உள்கட்டமைப்பு நிதி திட்டம் (AIF - சேமிப்பு கிடங்கு & குளிர்பதன கிடங்கு)',
    hindiName: 'कृषि अवसंरचना कोष',
    category: 'infrastructure',
    shortDesc: 'Medium to long term debt financing facility with 3% interest subvention for post-harvest management and community farming assets.',
    tamilShortDesc: 'தானிய கிடங்கு, குளிர்பதன கிடங்கு, பேக்கிங் மற்றும் மதிப்புக்கூட்டு நிலையம் அமைக்க 3% வட்டி தள்ளுபடியுடன் கூடிய வங்கிக் கடன் திட்டம்.',
    benefits: [
      '3% per annum interest subvention for loans up to ₹2 Crore for a maximum tenure of 7 years.',
      'Credit guarantee coverage under CGTMSE scheme for loans up to ₹2 Crore.',
      'Supports cold stores, warehouses, silos, sorting and grading units, ripening chambers.'
    ],
    tamilBenefits: [
      '₹2 கோடி வரையிலான கடன்களுக்கு ஆண்டுக்கு 3% வட்டி மானியம் 7 ஆண்டுகள் வரை கிடைக்கும்.',
      'CGTMSE மூலம் கடன் உத்தரவாதம் (Security guarantee) அரசு வழங்குகிறது.',
      'விளைபொருட்களை பதப்படுத்தல், சேமிப்பு கிடங்கு, உலர் களம் அமைக்க மிகச் சிறந்த திட்டம்.'
    ],
    eligibility: ['Farmers, FPOs, PACS, Agri-entrepreneurs, Startups, Self Help Groups.'],
    tamilEligibility: ['தனிப்பட்ட விவசாயிகள், உழவர் உற்பத்தியாளர் நிறுவனங்கள் (FPO), தொடக்க வேளாண் கூட்டுறவு சங்கங்கள்.'],
    documentsRequired: ['Project Detailed Project Report (DPR)', 'Land documents (Patta/Chitta)', 'Bank KYC', 'Aadhaar & PAN'],
    tamilDocumentsRequired: ['திட்ட அறிக்கை (DPR)', 'நில ஆவணங்கள் (பட்டா/சிட்டா/கிரய பத்திரம்)', 'ஆதார் மற்றும் பான் கார்டு', 'வங்கி கணக்கு விவரம்'],
    howToApply: 'Submit project DPR online via agriinfra.dac.gov.in portal and select your financing bank.',
    tamilHowToApply: 'agriinfra.dac.gov.in இணையதளத்தில் திட்ட அறிக்கையை சமர்ப்பித்து தங்களுக்கு விருப்பமான வங்கியை தேர்வு செய்யலாம்.',
    subsidyRate: '3% interest subvention up to ₹2 Crore'
  },
  {
    id: 'pacs-laws',
    name: 'PACS Cooperative Laws & By-Laws (TN Co-op Societies Act Section 21)',
    tamilName: 'தொடக்க வேளாண்மை கூட்டுறவு கடன் சங்கம் (PACS) சட்டங்கள் & பிரிவு 21',
    hindiName: 'पैक्स (PACS) सहकारी समितियां कानून एवं धारा 21',
    category: 'credit',
    shortDesc: 'Tamil Nadu Cooperative Societies Act 1983, Section 21 governing membership rights, zero percent crop loans, fertilizer distribution, and democratic by-laws.',
    tamilShortDesc: 'தமிழ்நாடு கூட்டுறவுச் சங்கங்களின் சட்டம் 1983, பிரிவு 21 - விவசாயிகளின் உறுப்பினர் உரிமை, 0% வட்டியில்லா பயிர்க்கடன், உரம் வழங்கல் மற்றும் துணை விதிகள்.',
    benefits: [
      'Section 21 Guarantee: Any farmer owning or cultivating land in the society area of operation is entitled to admission as a member with voting rights.',
      'Interest-free crop loans (0% interest) upon prompt repayment within 12 months under TN Govt scheme.',
      'Fair distribution of quality fertilizers (IFFCO Urea, DAP, Potash) at subsidized MRP directly at village level.',
      'Storage and jewel loan facilities at concessional cooperative interest rates.'
    ],
    tamilBenefits: [
      'பிரிவு 21 உரிமை: கிராம சங்க எல்லையில் நிலமுள்ள அல்லது சாகுபடி செய்யும் எந்த ஒரு விவசாயிக்கும் கூட்டுறவு உறுப்பினர் உரிமை மற்றும் வாக்குரிமை மறுக்கப்படக் கூடாது.',
      'தமிழக அரசின் 0% வட்டியில்லா பயிர்க்கடன் (12 மாதத்திற்குள் திருப்பிச் செலுத்தினால் முழு வட்டி தள்ளுபடி).',
      'அரசு மானிய விலையில் தரமான யூரியா, டிஏபி (DAP), பொட்டாஷ் உரங்கள் மற்றும் விதைகள் நேரடி விநியோகம்.',
      'குறைந்த வட்டியில் விவசாய நகைக்கடன் மற்றும் விளைபொருள் பாதுகாப்பு கடன் வசதிகள்.'
    ],
    eligibility: [
      'Any individual farmer aged 18+ owning agricultural land or tenant farmer in the jurisdiction of the PACS.',
      'Must purchase at least one share capital in the Primary Agricultural Cooperative Credit Society.'
    ],
    tamilEligibility: [
      'சங்கத்தின் எல்லைக்குட்பட்ட கிராமத்தில் நிலம் வைத்துள்ள அல்லது குத்தகைக்கு சாகுபடி செய்யும் 18 வயது பூர்த்தியடைந்த விவசாயிகள்.',
      'தொடக்க வேளாண்மை கூட்டுறவு கடன் சங்கத்தில் பங்குத் தொகை (Share capital) செலுத்திய அனைத்து உறுப்பினர்கள்.'
    ],
    documentsRequired: [
      'Patta/Chitta copy and VAO Sowing Certificate / Adangal',
      'Aadhaar Card and Ration Card copy',
      'Two passport size photographs',
      'No Objection Certificate / No Due certificate from nearby commercial banks'
    ],
    tamilDocumentsRequired: [
      'பட்டா/சிட்டா நகல் மற்றும் VAO சான்றளித்த அடங்கல் (பயிர் சாகுபடி சான்றிதழ்)',
      'ஆதார் அட்டை மற்றும் குடும்ப அட்டை (Ration Card) நகல்',
      'பாஸ்போர்ட் அளவு புகைப்படங்கள்',
      'பிற வங்கிகளில் நிலுவை இல்லை என்ற சுய உறுதிமொழி'
    ],
    howToApply: 'Visit your local Village Primary Agricultural Cooperative Credit Society (PACCS) Secretary with land documents. If admission is delayed, appeal under Section 21 to the Deputy Registrar of Cooperative Societies.',
    tamilHowToApply: 'உங்கள் கிராம தொடக்க வேளாண்மை கூட்டுறவு கடன் சங்க (PACCS) செயலரிடம் விண்ணப்பிக்கவும். உறுப்பினர் சேர்க்கை மறுக்கப்பட்டால் சரக கூட்டுறவு துணைப் பதிவாளரிடம் (Deputy Registrar) மேல்முறையீடு செய்யலாம்.',
    subsidyRate: '0% Interest on prompt repayment of crop loans'
  },
  {
    id: 'vao-services',
    name: 'VAO e-Sevai Land Records Services (Patta, Chitta, Adangal, FMB)',
    tamilName: 'கிராம நிர்வாக அலுவலர் (VAO) இ-சேவை & நில ஆவண சேவைகள்',
    hindiName: 'ग्राम प्रशासनिक अधिकारी (VAO) भूमि रिकॉर्ड एवं ई-सेवाएं',
    category: 'direct_benefit',
    shortDesc: 'Official revenue and e-Sevai certificates issued by the Village Administrative Officer including Patta transfer, Chitta, Adangal, FMB, and Small Farmer certificates.',
    tamilShortDesc: 'பட்டா மாறுதல், சிட்டா, பயிர் சாகுபடி அடங்கல் (Adangal), புல வரைபடம் (FMB) மற்றும் சிறு/குறு விவசாயி சான்றிதழ் வழங்கும் வருவாய்த்துறை சேவைகள்.',
    benefits: [
      'Official e-Adangal is mandatory for securing PMFBY Crop Insurance compensation and PM-Kisan payments.',
      'Small/Marginal Farmer Certificate enables 100% drip irrigation subsidy and 50% tractor subsidy.',
      'Transparent verification of land ownership and crop cultivation directly at the village level.',
      'Redressal of land boundary and revenue record grievances directly through VAO and Tahsildar.'
    ],
    tamilBenefits: [
      'இ-அடங்கல் (e-Adangal): பயிர் காப்பீட்டு இழப்பீடு மற்றும் நிவாரணம் பெற VAO வழங்கும் பயிர் சாகுபடி சான்றிதழ் கட்டாயமானது.',
      'சிறு/குறு விவசாயி சான்றிதழ்: 100% சொட்டுநீர் பாசன மானியம் மற்றும் 50% வேளாண் இயந்திர மானியம் பெற உதவுகிறது.',
      'தனிப்பட்டா மற்றும் கூட்டுப்பட்டா மாறுதல் (Patta Transfer) விண்ணப்பங்கள் கிராம நிர்வாக அலுவலர் மூலம் கள ஆய்வு செய்யப்பட்டு தீர்வு.',
      'நில எல்லை மற்றும் சர்வே எண் தொடர்பான குறைகளுக்கு நேரடி கிராம அளவில் தீர்வு.'
    ],
    eligibility: [
      'All landowning and tenant farmers cultivating agricultural lands in Tamil Nadu revenue villages.'
    ],
    tamilEligibility: [
      'தமிழ்நாடு வருவாய் கிராமங்களில் நில உரிமையுள்ள மற்றும் பயிர் சாகுபடி செய்யும் அனைத்து விவசாயிகள்.'
    ],
    documentsRequired: [
      'Sale deed / Registered Document copy',
      'Old Patta number or Survey number with Sub-division',
      'Aadhaar Card and mobile number',
      'Encumbrance Certificate (EC / வில்லங்கச் சான்றிதழ்)'
    ],
    tamilDocumentsRequired: [
      'கிரயப் பத்திரம் / தானப் பத்திரம் / பாகப்பிரிவினை ஆவண நகல்',
      'பழைய பட்டா எண் அல்லது சர்வே எண் / உட்பிரிவு விவரம்',
      'ஆதார் அட்டை மற்றும் மொபைல் எண்',
      'வில்லங்கச் சான்றிதழ் (EC) மற்றும் சொத்து வரி ரசீது'
    ],
    howToApply: 'Apply online at any government e-Sevai Center (tnesevai.tn.gov.in) or Tamil Nilam portal (eservices.tn.gov.in). The VAO visits the field, verifies records, and forwards to the Zonal Deputy Tahsildar.',
    tamilHowToApply: 'அரசு இ-சேவை மையம் (e-Sevai) அல்லது eservices.tn.gov.in (தமிழ் நிலம்) மூலம் விண்ணப்பிக்கலாம். VAO கள ஆய்வு செய்து மண்டல துணை வட்டாட்சியருக்கு பரிந்துரைப்பார்.',
    subsidyRate: 'Government Nominal Fee (₹60 per e-Sevai application)'
  }
];

export function findMatchingSchemes(query: string): SchemeInfo[] {
  const q = query.toLowerCase();
  return AGRICULTURAL_SCHEMES.filter((scheme) => {
    return (
      scheme.name.toLowerCase().includes(q) ||
      scheme.tamilName.toLowerCase().includes(q) ||
      scheme.shortDesc.toLowerCase().includes(q) ||
      scheme.tamilShortDesc.toLowerCase().includes(q) ||
      (q.includes('loan') && scheme.id === 'kcc') ||
      (q.includes('கடன்') && scheme.id === 'kcc') ||
      (q.includes('insurance') && scheme.id === 'pmfby') ||
      (q.includes('காப்பீடு') && scheme.id === 'pmfby') ||
      (q.includes('kisan') && scheme.id === 'pm-kisan') ||
      (q.includes('கிசான்') && scheme.id === 'pm-kisan') ||
      (q.includes('solar') && scheme.id === 'pm-kusum') ||
      (q.includes('சூரிய') && scheme.id === 'pm-kusum') ||
      (q.includes('drip') && scheme.id === 'pmksy-drip') ||
      (q.includes('சொட்டு') && scheme.id === 'pmksy-drip') ||
      (q.includes('tractor') && scheme.id === 'smam') ||
      (q.includes('டிராக்டர்') && scheme.id === 'smam') ||
      (q.includes('soil') && scheme.id === 'soil-health-card') ||
      (q.includes('மண்') && scheme.id === 'soil-health-card') ||
      ((q.includes('pacs') || q.includes('கூட்டுறவு') || q.includes('section 21') || q.includes('பிரிவு 21') || q.includes('by-law') || q.includes('துணை விதி')) && scheme.id === 'pacs-laws') ||
      ((q.includes('patta') || q.includes('chitta') || q.includes('adangal') || q.includes('பட்டா') || q.includes('சிட்டா') || q.includes('அடங்கல்') || q.includes('fmb') || q.includes('e-sevai')) && scheme.id === 'vao-services')
    );
  });
}
