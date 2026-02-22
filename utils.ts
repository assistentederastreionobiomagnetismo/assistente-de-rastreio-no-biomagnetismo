
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
