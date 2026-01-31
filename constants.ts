import { BiomagneticPair } from './types';

export const BIOMAGNETIC_PAIRS: BiomagneticPair[] = [
  { 
    name: 'Subdiafragma (D) - Subdiafragma (E)', 
    point1: 'Subdiafragma (D)', 
    point2: 'Subdiafragma (E)', 
    order: 1, 
    level: 1, 
    isDefinitive: true, 
    imageUrl: 'https://lh3.googleusercontent.com/d/1aPDOyhSvL6uzz3oaHf1TJULF0PpwiVw7',
    details: [
      {
        specification: "Ecuador",
        disease: "Cisticercosis",
        symptoms: "Dores de cabeça frequentes, convulsões, transtornos de visão, alterações psiquiátricas, vômitos, infecções na coluna, demência e perda da consciência."
      }
    ]
  },
  { 
    name: 'Cardias - Temporal (D)', 
    point1: 'Cardias', 
    point2: 'Temporal (D)', 
    order: 2, 
    level: 1, 
    isDefinitive: true, 
    imageUrl: 'https://lh3.googleusercontent.com/d/147WZieP4KLRqB3WDCeEYh0BWWEbwikBu',
    details: [
      {
        specification: "Wong",
        disease: "Priones",
        symptoms: "Por vacinações massivas. Memória de enfermidades. Às vezes, Pericárdio temporo direito. Ataca o SNC. Doenças degenerativas, afeta a pele e o cabelo. Falso sarampo, afeta a produção de CD3, CD4, CD8."
      }
    ]
  },
  { 
    name: 'Borda Calloso (D/E) - Borda Calloso', 
    point1: 'Borda Calloso (D/E)', 
    point2: 'Borda Calloso', 
    order: 3, 
    level: 1, 
    isDefinitive: true, 
    imageUrl: 'https://lh3.googleusercontent.com/d/1lIYJObBd_sxKUcnGeo0BjsD8n0RAshsp',
    details: [
      {
        specification: "Monterrey",
        disease: "Tuberculosis",
        symptoms: "Problemas respiratórios, garganta, pulmão, secreção nasal, alterações psicológicas, vaginite, úlceras retais e pele, tuberculose, Bacilo de Koch, TBC. Produz cálculos renais e vesiculares. Ao impactar cessa suas produções. Pode ocasionar fenômeno tumoral malígno. Abscessos no corpo. Ceratocono (córnea fina e projetada para frente). Esterilidade."
      }
    ]
  }
];