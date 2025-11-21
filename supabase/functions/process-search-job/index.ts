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

    // Build comprehensive prompt with REAL extracted data
    const aiAnalysisPrompt = `Você é um analisador OSINT profissional.

IMPORTANTE: Você deve analisar SOMENTE os dados reais extraídos abaixo. NUNCA invente informações.

📋 DADOS DA PESQUISA:
- Nome pesquisado: "${query}"
${city ? `- Cidade: ${city}` : ''}
${username ? `- Username fornecido: ${username}` : ''}
- Total de referências: ${rawLinks.length}
- Fontes com conteúdo extraído: ${extractedData.length}

🌐 CONTEÚDO EXTRAÍDO DAS PÁGINAS:
${extractedData.map((data, idx) => `
[${idx + 1}] Plataforma: ${data.platform}
URL: ${data.url}
Conteúdo extraído:
${data.content}
---
`).join('\n')}

${extractedData.length === 0 ? '⚠️ ATENÇÃO: Nenhum conteúdo foi extraído das páginas. As plataformas podem estar bloqueando scraping ou as páginas não existem.' : ''}

🎯 SUA TAREFA:
1. ACESSAR cada conteúdo extraído acima
2. SEPARAR pessoas diferentes com o mesmo nome (se houver)
3. AGRUPAR dados da mesma pessoa de diferentes plataformas
4. ELIMINAR informações não verificadas
5. GERAR relatório SOMENTE com dados reais

📊 FORMATO DE RESPOSTA (JSON):
{
  "persons": [
    {
      "name": "Nome completo (use o nome pesquisado se não encontrar outro)",
      "username": "username encontrado ou null",
      "confidence": 0-100,
      "location": "localização real encontrada ou 'Não identificado'",
      "summary": "resumo baseado SOMENTE em informações extraídas ou 'Informações insuficientes'",
      "education": ["formação REAL encontrada"] ou [],
      "experiences": ["experiência REAL encontrada"] ou [],
      "socialProfiles": ["URLs dos perfis encontrados"],
      "recentActivities": ["atividades recentes encontradas"] ou [],
      "sourceLinks": ["URLs de onde os dados foram extraídos"]
    }
  ],
  "alerts": [
    "Alertas sobre qualidade dos dados, perfis duplicados, informações conflitantes, etc."
  ],
  "generalSummary": "Resumo do que foi encontrado e o que NÃO foi encontrado"
}

🚫 REGRAS CRÍTICAS:
- Se não encontrou dados em um link, escreva "Sem informações relevantes" no alert
- Se não conseguiu diferenciar perfis, indique baixa confiança
- NUNCA invente formação acadêmica, empregos, ou registros
- Se um campo não tem dados, use array vazio [] ou "Não identificado"
- Seja HONESTO sobre limitações da extração

Agora analise os dados extraídos e retorne o JSON estruturado.`;

    console.log('Requesting AI analysis with real extracted data...');
    
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
            content: 'Você é um especialista em OSINT. Analise SOMENTE dados reais extraídos. NUNCA invente informações. Seja honesto sobre limitações.'
          },
          {
            role: 'user',
            content: aiAnalysisPrompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000
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
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      
      // Fallback: create minimal structure with extracted data
      const extractionSummary = extractedData.length > 0 
        ? `Dados extraídos de ${extractedData.length} fonte(s): ${extractedData.map(d => d.platform).join(', ')}`
        : 'Nenhum conteúdo foi extraído das páginas (possível bloqueio de scraping)';
      
      analysisResult = {
        persons: [{
          name: query,
          username: username || null,
          confidence: extractedData.length > 0 ? 40 : 20,
          location: city || 'Não identificado',
          summary: 'Análise limitada - ' + extractionSummary,
          education: [],
          experiences: [],
          socialProfiles: rawLinks.slice(0, 5),
          recentActivities: [],
          sourceLinks: extractedData.map(d => d.url)
        }],
        alerts: [
          'Análise automática com dados limitados',
          extractedData.length === 0 ? 'Nenhum conteúdo extraído - plataformas podem estar bloqueando acesso' : `${extractedData.length} fonte(s) analisada(s)`
        ],
        generalSummary: extractionSummary
      };
    }

    // Map AI analysis to PersonProfile structure
    const persons: PersonProfile[] = analysisResult.persons.map((person: any) => ({
      name: person.name || query,
      username: person.username,
      confidence: person.confidence || 50,
      location: person.location || city || 'Não identificado',
      summary: person.summary || 'Informações insuficientes',
      education: person.education || [],
      experiences: person.experiences || [],
      profiles: (person.socialProfiles || []).map((url: string) => ({
        platform: extractedData.find(d => d.url === url)?.platform || 'Desconhecido',
        url,
        name: person.name || query,
        description: 'Perfil identificado'
      }))
    }));

    // If no persons identified, create default one
    if (persons.length === 0) {
      persons.push({
        name: query,
        username: username,
        confidence: 30,
        location: city || 'Não especificado',
        summary: extractedData.length > 0 
          ? `${extractedData.length} referência(s) encontrada(s) mas dados insuficientes para análise detalhada`
          : 'Nenhum dado público encontrado nas plataformas pesquisadas',
        profiles: rawLinks.slice(0, 5).map(url => ({
          platform: 'Referência',
          url,
          name: query
        })),
        education: [],
        experiences: []
      });
    }

    alerts.push(...(analysisResult.alerts || []));
    
    // Add alert about extraction success
    if (extractedData.length === 0) {
      alerts.push('⚠️ Nenhum conteúdo foi extraído das páginas. As plataformas podem estar bloqueando scraping automático.');
    } else {
      alerts.push(`✓ ${extractedData.length} fonte(s) analisada(s) com sucesso`);
    }

    const summary = analysisResult.generalSummary || 
      `Análise OSINT para "${query}". ${persons.length} perfil(is) identificado(s) com base em ${extractedData.length} fonte(s) acessada(s) de ${rawLinks.length} referências totais.`;

    return {
      summary,
      totalProfilesFound: extractedData.length,
      persons,
      rawLinks: [...new Set(rawLinks)],
      alerts,
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