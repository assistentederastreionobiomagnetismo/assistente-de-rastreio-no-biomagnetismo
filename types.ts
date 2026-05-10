export interface Patient {
  id?: string;
  name: string;
  birthDate?: string;
  age?: number;
  email?: string;
  phone?: string;
  mainComplaint: string;
}

export interface PairDetail {
  specification: string;
  disease: string;
  symptoms: string;
}

export interface BiomagneticPair {
  id?: string;
  name: string;
  point1: string;
  point2: string;
  description?: string;
  imageUrl?: string;
  isCustom?: boolean;
  isDefinitive?: boolean;
  level: 1 | 2 | 3 | 4; // 1: Reservatórios, 2: Nível I, 3: Nível II, 4: Nível III
  order?: number;
  details?: PairDetail[];
}

export interface PhenomenaData {
  vascularAccidents: string[];
  tumoralPhenomena: string[];
  tumoralGenesis: string[];
  traumas: string[];
  portalPairs: string[];
}

export type ApprovalPeriod = '5min' | '1month' | '3months' | '6months' | '1year' | 'permanent';
export type PlanType = 'trial' | 'annual' | 'hybrid' | 'expired';

export interface User {
  username: string;
  password: string;
  fullName?: string;
  email?: string;
  whatsapp?: string;
  isApproved?: boolean;
  approvalExpiry?: string; // ISO Date String
  approvalType?: ApprovalPeriod;
  passwordResetPending?: boolean;
  pendingPassword?: string;
  requiresPasswordChange?: boolean;
  planType?: PlanType;
  extraSessions?: number;
  createdAt?: string;
}

export interface ProtocolData {
  legResponse: 'Estendido' | 'Encurtado' | 'Normal' | '';
  antennaResponse: 'Estendido' | 'Encurtado' | 'Normal' | '';
  sessionType: 'presencial' | 'distancia' | '';
}

export interface SafetyCheck {
  hasMedicalFollowUp: 'Sim' | 'Não' | '';
  medicalSpecialty?: string;
  usesContinuousMedication: 'Sim' | 'Não' | '';
  medications?: string;
  hasPacemakerOrDevice: 'Sim' | 'Não' | '';
  deviceDetails?: string;
  isPregnantOrSuspected: 'Sim' | 'Não' | '';
  hasRelevantDiagnoses: 'Sim' | 'Não' | '';
  diagnosesDetails?: string;
}

export interface ConsentForm {
  status: 'pending' | 'signed_local' | 'signed_remote';
  dateSigned?: string; // ISO date
  signedName?: string;
  cpf?: string;
  signatureImage?: string; // base64 ou URL Supabase
  ipAddress?: string; // Para a assinatura remota
}

export interface SessionScales {
  pain: number | '';
  anxiety: number | '';
  tiredness: number | '';
}

export interface EmotionRelease {
  name: string;
  age?: string;
  context?: string;
  physicalSensation?: string;
  command?: string;
}

export interface SensationRelease {
  name: string;
  location?: string;
  intensity?: number;
  situation?: string;
  description?: string;
}


export interface Session {
  id: string;
  patient: Patient;
  safetyCheck?: SafetyCheck;
  consentForm?: ConsentForm;
  scalesBefore?: SessionScales;
  scalesAfter?: SessionScales;
  protocolData?: ProtocolData;
  pairs: BiomagneticPair[];
  phenomena?: PhenomenaData;
  emotions?: string[];
  sensations?: string[];
  emotionsData?: EmotionRelease[];
  sensationsData?: SensationRelease[];
  emotionsNotes?: string;
  sensationsNotes?: string;
  impactionTime?: string;
  notes: string;
  protocolNotes?: string;
  reservatoriosNotes?: string;
  levelINotes?: string;
  levelIINotes?: string;
  levelIIINotes?: string;
  phenomenaNotes?: string;
  startTime: Date | null;
  endTime: Date | null;
  editedAt?: string; // ISO date string — preenchido quando a sessão é editada
  therapistSignature?: string; // base64 da assinatura do terapeuta
}

export interface Product {
  id?: string;
  title: string;
  description: string;
  copyText: string;
  imageUrls: string[];
  videoUrls: string[];
  affiliateLink: string;
  ctaText: string;
  isFeatured: boolean;
  displayOrder: number;
  createdAt?: string;
}

export interface Tutorial {
  id?: string;
  title: string;
  category: string;
  videoUrl: string;
  description?: string;
  displayOrder: number;
  createdAt?: string;
}