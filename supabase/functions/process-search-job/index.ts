// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
  username?: string;
  confidence: number;
  profiles: SearchResult[];
  education?: string[];
  experiences?: string[];
  location?: string;
  summary?: string;
  recentActivities?: string[];
  sourceLinks?: string[];
}

interface OSINTResult {
  summary: string;
  totalProfilesFound: number;
  persons: PersonProfile[];
  rawLinks: string[];
  alerts: string[];
  searchQuery: string;
  timestamp: string;
}

// Function to fetch and extract content from URLs
async function fetchPageContent(url: string): Promise<string> {
  try {
    console.log(`Fetching content from: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });
    
    if (!response.ok) {
      console.log(`Failed to fetch ${url}: ${response.status}`);
      return '';
    }
    
    const text = await response.text();
    // Extract only first 5000 chars to avoid token limits
    return text.substring(0, 5000);
  } catch (error) {
    console.log(`Error fetching ${url}:`, error);
    return '';
  }
}

// Real OSINT search function with actual data extraction
async function performOSINTSearch(
  query: string,
  city?: string,
  username?: string,
  plan?: string
): Promise<OSINTResult> {
  if (!query) {
    throw new Error('Query is required');
  }
  
  const rawLinks: string[] = [];
  const alerts: string[] = [];
  const extractedData: { url: string; content: string; platform: string }[] = [];

  try {
    console.log(`Starting OSINT search for: ${query}`);
    
    // Build URLs to search
    const urlsToFetch: { url: string; platform: string }[] = [];

    // LinkedIn
    const linkedinUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}${city ? `&location=${encodeURIComponent(city)}` : ''}`;
    urlsToFetch.push({ url: linkedinUrl, platform: 'LinkedIn' });
    rawLinks.push(linkedinUrl);

    // GitHub
    if (username) {
      const githubProfileUrl = `https://github.com/${username}`;
      urlsToFetch.push({ url: githubProfileUrl, platform: 'GitHub' });
      rawLinks.push(githubProfileUrl);
    }
    const githubSearchUrl = `https://github.com/search?q=${encodeURIComponent(query)}&type=users`;
    urlsToFetch.push({ url: githubSearchUrl, platform: 'GitHub' });
    rawLinks.push(githubSearchUrl);

    if (plan === 'complete') {
      // Twitter/X
      const twitterUrl = `https://x.com/search?q=${encodeURIComponent(query)}&lang=pt`;
      urlsToFetch.push({ url: twitterUrl, platform: 'Twitter/X' });
      rawLinks.push(twitterUrl);

      // Instagram
      const instagramUrl = `https://www.instagram.com/${username || query.replace(/\s+/g, '').toLowerCase()}/`;
      urlsToFetch.push({ url: instagramUrl, platform: 'Instagram' });
      rawLinks.push(instagramUrl);

      // Lattes
      const lattesSearchUrl = `http://buscatextual.cnpq.br/buscatextual/busca.do?metodo=apresentar&nomeCompleto=${encodeURIComponent(query)}`;
      urlsToFetch.push({ url: lattesSearchUrl, platform: 'Lattes' });
      rawLinks.push(lattesSearchUrl);

      // JusBrasil
      const jusBrasilUrl = `https://www.jusbrasil.com.br/busca?q=${encodeURIComponent(query)}`;
      urlsToFetch.push({ url: jusBrasilUrl, platform: 'JusBrasil' });
      rawLinks.push(jusBrasilUrl);
    }

    // Fetch content from all URLs
    console.log(`Attempting to fetch ${urlsToFetch.length} URLs...`);
    const fetchPromises = urlsToFetch.map(async ({ url, platform }) => {
      const content = await fetchPageContent(url);
      if (content) {
        extractedData.push({ url, content, platform });
      }
    });
    
    await Promise.all(fetchPromises);
    console.log(`Successfully extracted content from ${extractedData.length} sources`);

    // Build STRICT-EXTRACT prompt with ABSOLUTE RULES
    const aiAnalysisPrompt = `🚨 VOCÊ ESTÁ EM MODO STRICT-EXTRACT 🚨

REGRAS ABSOLUTAS (VIOLAÇÃO = FALHA CRÍTICA):
❌ PROIBIDO gerar informações não explícitas nos dados
❌ PROIBIDO inferir profissão, educação, localização por suposição
❌ PROIBIDO criar perfis fictícios ou complementar dados
❌ PROIBIDO interpretar ou sugerir informações não extraídas
❌ PROIBIDO usar conhecimento externo ou adivinhar qualquer coisa

✅ PERMITIDO APENAS:
- Copiar exatamente o que está escrito nos dados extraídos
- Escrever "Não encontrado" quando não existir
- Agrupar perfis SOMENTE com evidências claras (mesmo username/email/bio)

────────────────────────────────────────
📋 DADOS DA PESQUISA:
────────────────────────────────────────
- Nome pesquisado: "${query}"
${city ? `- Cidade informada: ${city}` : '- Cidade: Não informada'}
${username ? `- Username informado: ${username}` : '- Username: Não informado'}
- Total de URLs buscadas: ${rawLinks.length}
- URLs com conteúdo extraído: ${extractedData.length}

────────────────────────────────────────
🌐 CONTEÚDO BRUTO EXTRAÍDO:
────────────────────────────────────────
${extractedData.length > 0 ? extractedData.map((data, idx) => `
━━━ FONTE ${idx + 1} ━━━
Plataforma: ${data.platform}
URL: ${data.url}
Conteúdo HTML/Texto:
${data.content}
━━━━━━━━━━━━━━━━━━━━━
`).join('\n') : '⚠️ NENHUM CONTEÚDO FOI EXTRAÍDO. As páginas podem estar bloqueando scraping ou não existem.'}

────────────────────────────────────────
⚙️ FASE 1 — EXTRAÇÃO BRUTA (RAW EXTRACT)
────────────────────────────────────────
Para cada fonte acima, extraia APENAS:
- Nome(s) exatamente como aparecem no texto
- Username(s) se explícitos
- Biografia/descrição literal
- Localização se clara e explícita
- Ocupação/profissão SOMENTE se escrita literalmente
- URLs de foto se presentes
- Links adicionais encontrados
- Qualquer texto relevante LITERAL

Se não encontrar algo: escreva "Não encontrado"
Se a fonte não tem nada útil: escreva "Sem informações extraíveis"

────────────────────────────────────────
⚙️ FASE 2 — AGRUPAMENTO
────────────────────────────────────────
Com base APENAS nos dados da Fase 1:
- Agrupe perfis que tenham EVIDÊNCIAS CLARAS de serem a mesma pessoa
  (ex: mesmo username, mesma bio, mesmo email)
- NUNCA agrupe apenas por nome igual
- Crie identificadores: "Perfil A", "Perfil B", etc.
- Se dois perfis têm nome igual mas SEM evidências: marque como "Possível homônimo - não confirmado"

────────────────────────────────────────
⚙️ FASE 3 — RELATÓRIO FINAL (JSON)
────────────────────────────────────────
Retorne JSON estruturado assim:

{
  "rawExtractions": [
    {
      "sourceUrl": "URL da fonte",
      "platform": "Plataforma",
      "extractedData": {
        "name": "nome literal ou 'Não encontrado'",
        "username": "username literal ou null",
        "bio": "bio literal ou 'Não encontrado'",
        "location": "localização literal ou 'Não encontrado'",
        "occupation": "ocupação literal ou 'Não encontrado'",
        "photoUrl": "URL ou null",
        "additionalLinks": [],
        "rawText": "qualquer texto relevante encontrado"
      }
    }
  ],
  "persons": [
    {
      "profileId": "A",
      "name": "nome exato extraído (sem modificações)",
      "username": "username ou null",
      "confidence": "Alta: dados coincidem | Média: alguns dados coincidem | Baixa: apenas nome igual",
      "location": "localização literal extraída ou 'Não encontrado'",
      "occupation": "ocupação literal extraída ou 'Não encontrado'",
      "bio": "bio literal ou 'Não encontrado'",
      "photoUrl": "URL ou null",
      "education": [],
      "experiences": [],
      "socialProfiles": ["URLs dos perfis que pertencem a este indivíduo"],
      "sourceLinks": ["URLs de onde este perfil foi montado"],
      "groupingEvidence": "Explicação das evidências que justificam o agrupamento ou 'Apenas nome igual - não confirmado'"
    }
  ],
  "alerts": [
    "Total de fontes analisadas: X",
    "Fontes sem dados úteis: Y",
    "Perfis agrupados com alta confiança: Z",
    "Possíveis homônimos não confirmados: W"
  ],
  "generalSummary": "Resumo HONESTO: X perfis identificados, Y fontes úteis de Z totais. [Descrever limitações encontradas]"
}

────────────────────────────────────────
🔒 VALIDAÇÃO FINAL
────────────────────────────────────────
Antes de retornar, verifique:
✓ Todos os dados vêm LITERALMENTE das extrações?
✓ Não há inferências ou suposições?
✓ Campos vazios estão como "Não encontrado" ou null?
✓ Confiança reflete APENAS evidências reais?

Se violou alguma regra: PARE e recomece.

Agora processe os dados em MODO STRICT-EXTRACT.`;

    console.log('Requesting AI analysis in STRICT-EXTRACT mode...');
    
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: '🚨 MODO STRICT-EXTRACT ATIVADO. Você é um extrator OSINT que NUNCA inventa dados. PROIBIDO inferir, sugerir ou complementar informações. APENAS copie literalmente o que existir nos dados fornecidos.'
          },
          {
            role: 'user',
            content: aiAnalysisPrompt
          }
        ],
        temperature: 0.1, // Very low temperature for strict extraction
        max_tokens: 6000
      })
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      throw new Error(`Failed to analyze data with AI: ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    console.log('AI Analysis received');

    // Parse AI response
    let analysisResult;
    try {
      const jsonMatch = aiContent.match(/```json\s*([\s\S]*?)\s*```/) || aiContent.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiContent;
      analysisResult = JSON.parse(jsonStr);
      
      console.log('Successfully parsed AI analysis in STRICT-EXTRACT mode');
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Fallback: create minimal STRICT structure
      const extractionSummary = extractedData.length > 0 
        ? `${extractedData.length} fonte(s) acessada(s): ${extractedData.map(d => d.platform).join(', ')}`
        : 'Nenhum conteúdo foi extraído (possível bloqueio de scraping)';
      
      analysisResult = {
        rawExtractions: extractedData.map(d => ({
          sourceUrl: d.url,
          platform: d.platform,
          extractedData: {
            name: 'Não encontrado',
            username: null,
            bio: 'Não encontrado',
            location: 'Não encontrado',
            occupation: 'Não encontrado',
            photoUrl: null,
            additionalLinks: [],
            rawText: d.content.substring(0, 500)
          }
        })),
        persons: [{
          profileId: 'A',
          name: query,
          username: username || null,
          confidence: 'Baixa: apenas nome da busca',
          location: city || 'Não encontrado',
          occupation: 'Não encontrado',
          bio: 'Não encontrado',
          photoUrl: null,
          education: [],
          experiences: [],
          socialProfiles: extractedData.map(d => d.url),
          sourceLinks: extractedData.map(d => d.url),
          groupingEvidence: 'Nenhuma evidência - apenas nome da busca'
        }],
        alerts: [
          `Total de fontes buscadas: ${rawLinks.length}`,
          `Fontes com conteúdo extraído: ${extractedData.length}`,
          extractedData.length === 0 ? '⚠️ Nenhum conteúdo extraído - possível bloqueio' : '',
          'Análise automática com limitações de parsing'
        ].filter(Boolean),
        generalSummary: `Busca por "${query}". ${extractionSummary}. Dados limitados devido a restrições de scraping.`
      };
    }

    // Map AI analysis to PersonProfile structure
    const persons: PersonProfile[] = (analysisResult.persons || []).map((person: any) => {
      // Convert confidence string to number for internal use
      let confidenceNum = 50;
      if (person.confidence) {
        const confStr = person.confidence.toLowerCase();
        if (confStr.includes('alta')) confidenceNum = 85;
        else if (confStr.includes('média')) confidenceNum = 60;
        else if (confStr.includes('baixa')) confidenceNum = 30;
      }
      
      return {
        name: person.name || query,
        username: person.username || undefined,
        confidence: confidenceNum,
        location: person.location === 'Não encontrado' ? undefined : (person.location || city),
        summary: person.bio || person.groupingEvidence || 'Informações insuficientes',
        education: person.education || [],
        experiences: person.experiences || [],
        recentActivities: person.recentActivities || [],
        sourceLinks: person.sourceLinks || [],
        profiles: (person.socialProfiles || []).map((url: string) => ({
          platform: extractedData.find(d => d.url === url)?.platform || 'Referência',
          url,
          name: person.name || query,
          description: person.occupation !== 'Não encontrado' ? person.occupation : 'Perfil identificado'
        }))
      };
    });

    // If no persons identified, create default STRICT one
    if (persons.length === 0) {
      persons.push({
        name: query,
        username: username,
        confidence: 20,
        location: city || 'Não encontrado',
        summary: extractedData.length > 0 
          ? `${extractedData.length} referência(s) acessada(s) mas nenhuma informação útil extraída`
          : 'Nenhum dado público encontrado - possível bloqueio de scraping nas plataformas',
        profiles: rawLinks.slice(0, 5).map(url => ({
          platform: 'Referência',
          url,
          name: query,
          description: 'Link de busca'
        })),
        education: [],
        experiences: [],
        recentActivities: [],
        sourceLinks: []
      });
    }

    // Process alerts from AI
    alerts.push(...(analysisResult.alerts || []).filter(Boolean));
    
    // Add strict extraction metrics
    alerts.push(`🔍 Modo STRICT-EXTRACT: ${extractedData.length}/${rawLinks.length} fontes com conteúdo`);
    
    if (extractedData.length === 0) {
      alerts.push('⚠️ CRÍTICO: Nenhum conteúdo extraído. Plataformas bloquearam scraping.');
    }
    
    // Add raw extractions info if available
    if (analysisResult.rawExtractions && analysisResult.rawExtractions.length > 0) {
      alerts.push(`📝 ${analysisResult.rawExtractions.length} extração(ões) bruta(s) processada(s)`);
    }

    const summary = analysisResult.generalSummary || 
      `Busca OSINT STRICT para "${query}". ${persons.length} perfil(is) identificado(s). ${extractedData.length} de ${rawLinks.length} fontes analisadas com sucesso.`;

    console.log(`OSINT search completed: ${persons.length} profile(s), ${extractedData.length} sources extracted`);

    return {
      summary,
      totalProfilesFound: extractedData.length,
      persons,
      rawLinks: [...new Set(rawLinks)],
      alerts: [...new Set(alerts)], // Remove duplicate alerts
      searchQuery: query,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('OSINT search error:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { jobId } = await req.json();

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: 'Job ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get job details
    const { data: job, error: jobError } = await supabaseClient
      .from('search_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error('Job not found:', jobError);
      return new Response(
        JSON.stringify({ error: 'Job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update status to processing
    await supabaseClient
      .from('search_jobs')
      .update({ status: 'processing' })
      .eq('id', jobId);

    console.log('Processing job:', jobId);

    try {
      // Perform OSINT search
      const results = await performOSINTSearch(
        job.query,
        job.city,
        job.username,
        job.plan
      );

      // Update job with results
      const { error: updateError } = await supabaseClient
        .from('search_jobs')
        .update({
          status: 'completed',
          result_data: results,
          completed_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      if (updateError) {
        throw updateError;
      }

      console.log('Job completed:', jobId);

      return new Response(
        JSON.stringify({ success: true, jobId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (searchError) {
      console.error('Search error:', searchError);
      
      // Update job with error
      await supabaseClient
        .from('search_jobs')
        .update({
          status: 'failed',
          error_message: searchError instanceof Error ? searchError.message : 'Search failed',
        })
        .eq('id', jobId);

      return new Response(
        JSON.stringify({ error: 'Search processing failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in process-search-job:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});