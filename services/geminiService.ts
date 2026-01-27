
import { GoogleGenAI } from "@google/genai";
import { BiomagneticPair } from "../types";

// Always use process.env.API_KEY directly when initializing the @google/genai client instance.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getPairInformation(pair: BiomagneticPair): Promise<string> {
  // Use process.env.API_KEY directly if checking availability.
  if (!process.env.API_KEY) {
    return Promise.resolve("A funcionalidade de IA está desativada porque a chave da API não está configurada.");
  }
  
  const prompt = `
    Forneça um resumo conciso e informativo para o par biomagnético "${pair.name}" para um terapeuta de biomagnetismo. 
    O resumo deve incluir:
    1.  Micro-organismos comumente associados (vírus, bactérias, fungos, parasitas).
    2.  Sintomas e condições típicas relacionadas a este par.
    3.  Uma breve descrição da localização anatômica dos pontos: "${pair.point1}" e "${pair.point2}".
    4.  Qualquer observação clínica relevante.
    
    Formate a resposta de forma clara e organizada usando markdown. Use títulos para cada seção.
    Não inclua avisos sobre a necessidade de consultar um profissional, pois o público-alvo já são profissionais.
    Responda em português do Brasil.
  `;

  try {
    // Correct usage of generateContent with model and contents as direct properties.
    // Selecting 'gemini-3-pro-preview' for advanced reasoning/medical data tasks.
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
    });
    
    // Correct Method: The GenerateContentResponse features a text property (not a method).
    const resultText = response.text;
    if (resultText) {
        return resultText;
    } else {
        throw new Error("Resposta inesperada da API Gemini.");
    }
  } catch (error) {
    console.error("Erro ao buscar informações do par biomagnético:", error);
    return "Não foi possível obter informações sobre este par no momento. Por favor, tente novamente mais tarde.";
  }
}
