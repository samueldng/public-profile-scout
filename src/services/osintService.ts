// OSINT Service for public profile scouting
interface OSINTInput {
  nome: string;
  foto?: File;
  username?: string;
  cidade?: string;
  email?: string;
  phone?: string;
}

interface NormalizedData {
  nome: string;
  cidade: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
}

interface SearchResult {
  platform: string;
  name?: string;
  url: string;
  description?: string;
  relevanceScore?: number;
  location?: string;
  title?: string;
}

interface PersonProfile {
  name: string;
  confidence: number;
  profiles: SearchResult[];
  education?: string[];
  experiences?: string[];
  location?: string;
  summary?: string;
}

interface RawData {
  governmentData?: {
    serasaScore: string;
    judicialRecords: string;
    fiscalDebts: string;
    electoralData: string;
  };
  socialMedia: {
    totalProfiles: number;
    platforms: string[];
  };
  positiveData: string[];
  negativeData: string[];
  riskIndicators: string[];
}

interface OSINTResult {
  summary: string;
  totalProfilesFound: number;
  persons: PersonProfile[];
  rawData: RawData;
  rawLinks: string[];
  alerts: string[];
  searchQuery: string;
  timestamp: string;
}

// 1. Normalize data
export function normalizeData(input: OSINTInput): NormalizedData {
  return {
    nome: input.nome.trim().toLowerCase(),
    cidade: input.cidade?.trim().toLowerCase() || null,
    username: input.username?.toLowerCase() || null,
    email: input.email?.trim().toLowerCase() || null,
    phone: input.phone?.trim() || null
  };
}

// 2. Search strategies

// 2.1 Search by name in search engines
export async function searchGoogle(nome: string, cidade?: string | null): Promise<any> {
  // In a real implementation, this would connect to a search engine API
  // For now, we'll simulate the results
  const query = `${nome} ${cidade || ""} site:linkedin.com OR site:lattes.cnpq.br OR site:facebook.com`;
  
  // Simulated results
  return [
    {
      title: `${nome} - LinkedIn`,
      url: `https://linkedin.com/search/results/people/?keywords=${encodeURIComponent(nome)}`,
      snippet: `Professional profile for ${nome}`
    },
    {
      title: `${nome} - Lattes`,
      url: `https://lattes.cnpq.br/buscacv?q=${encodeURIComponent(nome)}`,
      snippet: `Lattes CV for ${nome}`
    }
  ];
}

// 2.2 Direct LinkedIn search (public)
export async function fetchLinkedinPublic(nome: string): Promise<any> {
  // In a real implementation, this would scrape public LinkedIn profiles
  // For now, we'll simulate the results
  const query = `${nome} linkedin`;
  
  // ⚠️ DADOS FICTÍCIOS REMOVIDOS - LinkedIn bloqueia scraping automatizado
  // Retorna null para indicar que não foi possível extrair dados reais
  return null;
}

// 2.2b 🎯 EXTRAÇÃO REAL: Fetch GitHub profile via API pública
export async function fetchGitHubProfile(username: string): Promise<any> {
  try {
    console.log(`Buscando dados REAIS do GitHub para: ${username}`);
    const response = await fetch(`https://api.github.com/users/${username}`);
    if (!response.ok) {
      console.log('GitHub: Perfil não encontrado ou acesso bloqueado');
      return null;
    }
    
    const data = await response.json();
    console.log('GitHub: Dados reais extraídos com sucesso!');
    
    return {
      name: data.name || username,
      username: data.login,
      bio: data.bio,
      location: data.location,
      company: data.company,
      blog: data.blog,
      followers: data.followers,
      following: data.following,
      public_repos: data.public_repos,
      avatar_url: data.avatar_url,
      profile_url: data.html_url,
      created_at: data.created_at
    };
  } catch (error) {
    console.error('Erro ao buscar GitHub:', error);
    return null;
  }
}

// 2.3 Direct Lattes search (public filter)
export async function searchLattes(nome: string): Promise<any> {
  // ⚠️ DADOS FICTÍCIOS REMOVIDOS - Lattes requer autenticação/CAPTCHA
  // Retorna null para indicar que não foi possível extrair dados reais
  const url = `https://lattes.cnpq.br/buscacv?q=${encodeURIComponent(nome)}`;
  return null;
}

// 2.4 Public legal records search
export async function searchPublicLegalRecords(nome: string, estado?: string): Promise<any> {
  // In a real implementation, this would search public legal records
  // For now, we'll simulate the results
  const url = estado 
    ? `https://consulta.tj${estado}.jus.br/pesquisa?nome=${encodeURIComponent(nome)}`
    : `https://www.jusbrasil.com.br/busca?q=${encodeURIComponent(nome)}`;
  
  // Simulated results
  return {
    records: [
      {
        title: "Processo Civil #12345",
        url: `https:// tj${estado || 'br'}.jus.br/processo/12345`,
        summary: "Processo relacionado a disputa civil"
      }
    ]
  };
}

// 2.5 Reverse image search
export async function reverseImageSearch(foto: File): Promise<any> {
  // In a real implementation, this would use APIs like TinEye or Google Vision
  // For now, we'll simulate the results
  return {
    matches: [
      {
        url: "https://example.com/match1",
        similarity: 95,
        platform: "Stock Photo Site"
      }
    ],
    isStockPhoto: false
  };
}

// 3. Extract information functions
export function extractEducation(results: any): string[] {
  // ⚠️ DADOS FICTÍCIOS REMOVIDOS - Retorna array vazio
  // Educação só deve ser extraída de fontes reais verificadas
  return [];
}

export function extractJobs(results: any): string[] {
  // ⚠️ DADOS FICTÍCIOS REMOVIDOS - Retorna array vazio
  // Experiências só devem ser extraídas de fontes reais verificadas
  return [];
}

export function extractLegalRecords(results: any): any[] {
  // ⚠️ DADOS FICTÍCIOS REMOVIDOS - Retorna array vazio
  // Processos legais só devem ser extraídos de fontes oficiais verificadas
  return [];
}

// 4. Consolidate results
export function consolidateResults(results: any): any {
  return {
    perfis_sociais: {
      linkedin: results.linkedin || null,
      lattes: results.lattes || null,
      facebook: results.facebook || null,
    },
    educacao: extractEducation(results),
    empregos: extractJobs(results),
    processos_publicos: extractLegalRecords(results)
  };
}

// 5. Generate report
export function generateReport(data: any): string {
  return `
Nome encontrado: ${data.nome}

🎓 Formação:
${data.educacao?.join('\n') || 'Nenhuma formação encontrada'}

💼 Empregos:
${data.empregos?.join('\n') || 'Nenhum emprego encontrado'}

⚖️ Processos Públicos:
${data.processos_publicos?.map((p: any) => `- ${p.type} #${p.number}: ${p.status}`).join('\n') || 'Nenhum processo encontrado'}

Perfis verificados:
- LinkedIn: ${data.perfis_sociais.linkedin ? 'Encontrado' : 'Não encontrado'}
- Lattes: ${data.perfis_sociais.lattes ? 'Encontrado' : 'Não encontrado'}
- Outros: ${data.perfis_sociais.facebook ? 'Encontrado' : 'Não encontrado'}
  `;
}

// Main OSINT search function
export async function performOSINTSearch(input: OSINTInput): Promise<OSINTResult> {
  // Normalize input data
  const normalizedData = normalizeData(input);
  
  // Initialize results
  const results: any = {
    linkedin: null,
    lattes: null,
    facebook: null,
    legalRecords: null,
    imageResults: null
  };
  
  // Perform searches
  try {
    // Search Google
    const googleResults = await searchGoogle(normalizedData.nome, normalizedData.cidade);
    
    // Fetch LinkedIn public profile (geralmente bloqueado)
    results.linkedin = await fetchLinkedinPublic(normalizedData.nome);
    
    // 🎯 EXTRAÇÃO REAL: Buscar dados do GitHub se username fornecido
    if (normalizedData.username) {
      console.log('🎯 Tentando extrair dados REAIS do GitHub...');
      results.github = await fetchGitHubProfile(normalizedData.username);
      if (results.github) {
        console.log('✅ Dados reais do GitHub extraídos com sucesso!');
      }
    }
    
    // Search Lattes (requer CAPTCHA)
    results.lattes = await searchLattes(normalizedData.nome);
    
    // Search legal records if complete plan
    if (input.username) {
      results.legalRecords = await searchPublicLegalRecords(normalizedData.nome, normalizedData.cidade?.split(' ')[0]);
    }
    
    // Reverse image search if photo provided
    if (input.foto) {
      results.imageResults = await reverseImageSearch(input.foto);
    }
    
    // Consolidate all results
    const consolidated = consolidateResults(results);
    
    // Create profiles array
    // Como não conseguimos extrair dados reais, criamos apenas links de referência
    const profiles: SearchResult[] = [];
    
    // LinkedIn: scraping bloqueado, apenas link de busca
    profiles.push({
      platform: 'LinkedIn (verificação manual necessária)',
      name: normalizedData.nome,
      url: `https://linkedin.com/search/results/people/?keywords=${encodeURIComponent(normalizedData.nome)}`,
      description: 'Link de busca - plataforma bloqueia scraping automatizado',
      relevanceScore: undefined
    });
    
    // Lattes: CAPTCHA/autenticação requerida, apenas link de busca
    profiles.push({
      platform: 'Lattes (verificação manual necessária)',
      name: normalizedData.nome,
      url: `https://lattes.cnpq.br/buscacv?q=${encodeURIComponent(normalizedData.nome)}`,
      description: 'Link de busca - plataforma requer verificação manual',
      relevanceScore: undefined
    });
    
    // Add profile links
    const additionalProfiles: SearchResult[] = [];
    if (normalizedData.username) {
      // 🎯 GitHub: Usar dados REAIS se disponíveis
      if (results.github) {
        const ghData = results.github;
        additionalProfiles.push({
          platform: 'GitHub ✅ (dados reais extraídos)',
          url: ghData.profile_url,
          description: ghData.bio || 'Desenvolvedor no GitHub',
          title: ghData.name || normalizedData.username,
          location: ghData.location,
          relevanceScore: 100 // 100% porque são dados REAIS
        });
      } else {
        additionalProfiles.push({
          platform: 'GitHub (verificação manual necessária)',
          url: `https://github.com/${normalizedData.username}`,
          description: 'Perfil existe mas dados não puderam ser extraídos',
          relevanceScore: undefined
        });
      }
      
      additionalProfiles.push({
        platform: 'Instagram (verificação manual necessária)',
        url: `https://instagram.com/${normalizedData.username}`,
        description: 'Link de perfil - dados não extraídos automaticamente',
        relevanceScore: undefined // Sem score fictício
      });
      
      additionalProfiles.push({
        platform: 'Twitter (verificação manual necessária)',
        url: `https://twitter.com/${normalizedData.username}`,
        description: 'Link de perfil - dados não extraídos automaticamente',
        relevanceScore: undefined // Sem score fictício
      });
    }
    
    // Create raw links array
    const rawLinks: string[] = [
      `https://www.google.com/search?q=${encodeURIComponent(normalizedData.nome + (normalizedData.cidade ? ` ${normalizedData.cidade}` : ''))}`,
      `https://linkedin.com/search/results/people/?keywords=${encodeURIComponent(normalizedData.nome)}`,
      `https://lattes.cnpq.br/buscacv?q=${encodeURIComponent(normalizedData.nome)}`
    ];
    
    if (normalizedData.username) {
      rawLinks.push(`https://github.com/${normalizedData.username}`);
      rawLinks.push(`https://instagram.com/${normalizedData.username}`);
      rawLinks.push(`https://twitter.com/${normalizedData.username}`);
    }
    
    // Add legal search if applicable
    if (normalizedData.cidade) {
      const estado = normalizedData.cidade.split(' ')[0];
      rawLinks.push(`https://consulta.tj${estado}.jus.br/pesquisa?nome=${encodeURIComponent(normalizedData.nome)}`);
    }
    
    // Add image search if applicable
    const photos: Array<{ url: string; reverseSearchResults?: any }> = [];
    if (results.imageResults) {
      photos.push({
        url: 'https://example.com/uploaded-photo.jpg',
        reverseSearchResults: results.imageResults
      });
    }
    
    // Generate HONEST summary with REAL data info
    const hasRealGitHubData = results.github !== null;
    const hasRealData = profiles.length > 0 || hasRealGitHubData;
    
    const summary = hasRealGitHubData
      ? `✅ Análise para "${input.nome}". Dados REAIS extraídos do GitHub! ${profiles.length + additionalProfiles.length} perfil(is) encontrado(s).`
      : hasRealData
      ? `Análise para "${input.nome}". ${profiles.length} perfil(is) público(s) encontrado(s). ⚠️ Limitações: scraping bloqueado em várias plataformas.`
      : `❌ ANÁLISE LIMITADA para "${input.nome}". Apenas links de referência disponíveis. As plataformas bloquearam a extração automática de dados.`;
    
    // Build person summary from REAL data
    let personSummary = '';
    let personLocation = input.cidade || undefined;
    let personConfidence = 15;
    
    if (hasRealGitHubData && results.github) {
      const gh = results.github;
      personSummary = `✅ Dados reais extraídos do GitHub:\n`;
      if (gh.bio) personSummary += `Bio: ${gh.bio}\n`;
      if (gh.company) personSummary += `Empresa: ${gh.company}\n`;
      if (gh.location) {
        personSummary += `Localização: ${gh.location}\n`;
        personLocation = gh.location;
      }
      personSummary += `Repositórios públicos: ${gh.public_repos || 0}\n`;
      personSummary += `Seguidores: ${gh.followers || 0}`;
      personConfidence = 85; // Alta confiança com dados reais
    } else {
      personSummary = hasRealData
        ? `Perfis públicos encontrados para ${input.nome}. Dados detalhados não extraíveis devido a restrições de scraping.`
        : `⚠️ Nenhum dado detalhado extraído. As plataformas bloqueiam acesso automatizado. Verifique manualmente os links abaixo.`;
      personConfidence = hasRealData ? 60 : 15;
    }
    
    // Create person profiles with REAL or LIMITED data
    const persons: PersonProfile[] = [
      {
        name: results.github?.name || input.nome,
        confidence: personConfidence,
        location: personLocation,
        summary: personSummary,
        education: consolidated.educacao.length > 0 ? consolidated.educacao : [],
        experiences: consolidated.empregos.length > 0 ? consolidated.empregos : [],
        profiles: [
          ...profiles,
          ...additionalProfiles
        ]
      }
    ];
    
    // Create raw data WITHOUT fictional information
    const rawData: RawData = {
      socialMedia: {
        totalProfiles: profiles.length + additionalProfiles.length,
        platforms: [
          ...profiles.map(p => p.platform),
          ...additionalProfiles.map(p => p.platform)
        ]
      },
      positiveData: [], // ⚠️ REMOVIDO: Dados não verificáveis
      negativeData: [], // ⚠️ REMOVIDO: Dados não verificáveis
      riskIndicators: [] // ⚠️ REMOVIDO: Dados não verificáveis
    };
    
    // ⚠️ REMOVIDO: Dados governamentais fictícios
    // Dados como Serasa, processos judiciais, etc não são acessíveis via scraping público
    
    // Create HONEST alerts with REAL data indicators
    const alerts: string[] = [];
    
    if (hasRealGitHubData) {
      alerts.push('✅ SUCESSO: Dados reais extraídos do GitHub via API pública!');
      alerts.push(`📊 Informações verificadas: ${results.github.public_repos || 0} repositórios, ${results.github.followers || 0} seguidores`);
    } else {
      alerts.push('⚠️ LIMITAÇÃO: Plataformas bloqueiam scraping automatizado');
    }
    
    alerts.push('📋 Links de referência disponíveis para verificação manual');
    alerts.push(`🔍 ${rawData.socialMedia.totalProfiles} link(s) de busca gerado(s)`);
    
    if (rawData.socialMedia.totalProfiles === 0) {
      alerts.push('❌ Nenhum perfil público acessível via automação');
    }
    
    // Return structured results
    return {
      summary,
      totalProfilesFound: rawData.socialMedia.totalProfiles,
      persons,
      rawData,
      rawLinks,
      alerts,
      searchQuery: `${normalizedData.nome}${normalizedData.cidade ? ` ${normalizedData.cidade}` : ''}${normalizedData.username ? ` ${normalizedData.username}` : ''}`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('OSINT search error:', error);
    throw new Error(`Failed to perform OSINT search: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}