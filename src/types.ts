export type FlagType = 'red' | 'orange' | 'green' | null;

export interface Message {
  id: string;
  sender: 'farmer' | 'ai' | 'vao';
  text: string;
  audioBase64?: string;
  language: string;
  timestamp: string;
  flag?: FlagType;
  vaoOfficerName?: string;
  vaoVillage?: string;
  audioSpoken?: boolean; // whether input came via mic
}

export interface FarmerProfile {
  id: string;
  name: string;
  district: string;
  taluk: string;
  village: string;
  villageId?: number;
  phone: string;
  createdAt: string;
  isOutsidePilot?: boolean;
}

export interface FarmerConversation {
  id: string;
  farmer: FarmerProfile;
  initialQuery: string;
  registrationStep: 'initial_query' | 'disclaimer_ack' | 'ask_name' | 'ask_district' | 'ask_taluk' | 'ask_village' | 'ask_phone' | 'completed';
  messages: Message[];
  hasRedFlagLoanComplaint: boolean;
  hasOrangeTagAgriQuery: boolean;
  lastUpdated: string;
}

export interface VillageInfo {
  id: number;
  code: string;
  name: string;
  nameTa: string;
  normalizedName: string;
  aliases?: string[];
  taluk: 'Coimbatore south' | 'Coimbatore north';
  talukTa?: string;
  district: 'Coimbatore';
  districtTa?: string;
  vaoUsername: string;
  defaultPassword: string;
  vaoOfficerName: string;
  vaoPhone: string;
}

export interface SchemeInfo {
  id: string;
  name: string;
  tamilName: string;
  hindiName?: string;
  category: 'direct_benefit' | 'insurance' | 'credit' | 'irrigation' | 'infrastructure' | 'solar' | 'machinery' | 'soil_health';
  shortDesc: string;
  tamilShortDesc: string;
  benefits: string[];
  tamilBenefits: string[];
  eligibility: string[];
  tamilEligibility: string[];
  documentsRequired: string[];
  tamilDocumentsRequired: string[];
  howToApply: string;
  tamilHowToApply: string;
  subsidyRate?: string;
}
