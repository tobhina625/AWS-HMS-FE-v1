export interface IDisease {
  id: number;
  name: string;
  status: string;
  category: string;
  severity: string;
  description: string;
  isContagious: boolean;
  symptoms: string;
  treatment: string;
  preventionMeasures: string;
  affectedBodyPart: string;
}

export interface IAddDisease {
  name: string;
  status: string;
  category: string;
  severity: string;
  description: string;
  isContagious: boolean;
  symptoms: string;
  treatment: string;
  preventionMeasures: string;
  affectedBodyPart: string;
}

export interface IUpdateDisease {
  id: number;
  name: string;
  status: string;
  category: string;
  severity: string;
  description: string;
  isContagious: boolean;
  symptoms: string;
  treatment: string;
  preventionMeasures: string;
  affectedBodyPart: string;
}

export interface IDiseaseStatistics {
  totalDiseases: number;
  contagiousCount: number;
  nonContagiousCount: number;
  diseasesByStatus: { status: string; count: number }[];
  diseasesByCategory: { category: string; count: number }[];
  diseasesBySeverity: { severity: string; count: number }[];
}
