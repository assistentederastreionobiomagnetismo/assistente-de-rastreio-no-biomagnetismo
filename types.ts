
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
}

export interface ProtocolData {
  legResponse: 'Estendido' | 'Encurtado' | 'Normal' | '';
  antennaResponse: 'Estendido' | 'Encurtado' | 'Normal' | '';
  sessionType: 'presencial' | 'distancia' | '';
}

export interface Session {
    id: string;
    patient: Patient;
    protocolData?: ProtocolData;
    pairs: BiomagneticPair[];
    phenomena?: PhenomenaData;
    emotions?: string[];
    sensations?: string[];
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
}
