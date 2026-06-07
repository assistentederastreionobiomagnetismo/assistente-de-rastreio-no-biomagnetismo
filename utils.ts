
/**
 * Converte links do Google Drive para links de imagem direta (lh3.googleusercontent.com).
 * Isso resolve problemas de carregamento de imagens de referência no app.
 */
export const getDirectImageUrl = (url: string | undefined): string => {
    if (!url) return '';

    // Se já for uma URL do Supabase ou outro link direto, retorna como está
    if (url.includes('supabase.co') || url.includes('lh3.googleusercontent.com')) {
        return url;
    }

    // Regex para capturar o ID do arquivo em diferentes formatos do Google Drive
    const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|docs\.google\.com\/uc\?id=)([a-zA-Z0-9_-]{25,})/;
    const match = url.match(driveRegex);

    if (match && match[1]) {
        return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }

    return url;
};

import { User } from './types';

export const SessionUtils = {
  getActiveCycleStart: (user: User): Date => {
    // Caso não tenha data de criação, assume agora.
    if (!user.createdAt) return new Date();
    
    const created = new Date(user.createdAt);
    const now = new Date();
    const msIn30Days = 30 * 24 * 60 * 60 * 1000;
    
    // Se a data de criação for no futuro (anomalia), o ciclo atual é a própria data
    if (now.getTime() < created.getTime()) {
      return created;
    }
    
    const diff = now.getTime() - created.getTime();
    const cycles = Math.floor(diff / msIn30Days);
    return new Date(created.getTime() + cycles * msIn30Days);
  },

  getAvailableSessions: (user: User, cycleUsage: number): number => {
    // Saldo do plano gratuito (renova a cada 30 dias)
    const freeRemaining = Math.max(0, 5 - cycleUsage);
    
    // Saldo de pacotes avulsos ativos e com saldo
    const standaloneRemaining = user.sessionPackages?.reduce((acc, pkg) => {
        if (new Date(pkg.expiresAt) > new Date()) {
            return acc + Math.max(0, pkg.amount - pkg.used);
        }
        return acc;
    }, 0) || 0;

    return freeRemaining + standaloneRemaining;
  }
};
