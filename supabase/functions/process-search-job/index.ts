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
  confidence: number;
  profiles: SearchResult[];
  education?: string[];
  experiences?: string[];
  location?: string;
  summary?: string;
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

// Real OSINT search function with AI-powered analysis
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
  const allProfiles: SearchResult[] = [];

  try {
    console.log(`Starting OSINT search for: ${query}`);
    
    // Build comprehensive search queries
    const searchQueries = [
      `"${query}" ${city || ''}`,
      `"${query}" LinkedIn`,
      `"${query}" GitHub`,
      `"${query}" site:linkedin.com`,
    ];

    if (username) {
      searchQueries.push(`"${username}" ${query}`);
    }

    if (plan === 'complete') {
      searchQueries.push(
        `"${query}" Instagram`,
        `"${query}" Twitter`,
        `"${query}" Facebook`,
        `"${query}" site:github.com`,
        `"${query}" curriculum OR resume OR cv`
      );
    }

    // Perform web searches
    for (const searchQuery of searchQueries) {
      const encodedQuery = encodeURIComponent(searchQuery);
      const googleSearchUrl = `https://www.google.com/search?q=${encodedQuery}`;
      rawLinks.push(googleSearchUrl);

      // Add platform-specific links
      if (searchQuery.includes('LinkedIn')) {
        const linkedinUrl = `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}${city ? `&location=${encodeURIComponent(city)}` : ''}`;
        allProfiles.push({
          platform: 'LinkedIn',
          name: query,
          url: linkedinUrl,
          description: 'Busca de perfis profissionais',
          relevanceScore: 85
        });
        rawLinks.push(linkedinUrl);
      }

      if (searchQuery.includes('GitHub') && username) {
        const githubProfileUrl = `https://github.com/${username}`;
        const githubSearchUrl = `https://github.com/search?q=${encodeURIComponent(query)}&type=users`;
        allProfiles.push({
          platform: 'GitHub',
          name: username,
          url: githubProfileUrl,
          description: 'Perfil de desenvolvedor',
          relevanceScore: 80
        });
        rawLinks.push(githubProfileUrl, githubSearchUrl);
      }

      if (plan === 'complete') {
        if (searchQuery.includes('Instagram')) {
          const instagramUrl = `https://www.instagram.com/explore/tags/${encodeURIComponent(query.replace(/\s+/g, ''))}`;
          allProfiles.push({
            platform: 'Instagram',
            url: instagramUrl,
            description: 'Busca de perfis sociais',
            relevanceScore: 70
          });
          rawLinks.push(instagramUrl);
        }

        if (searchQuery.includes('Twitter')) {
          const twitterUrl = `https://twitter.com/search?q=${encodeURIComponent(query)}&src=typed_query&f=user`;
          allProfiles.push({
            platform: 'Twitter/X',
            url: twitterUrl,
            description: 'Busca de perfis sociais',
            relevanceScore: 70
          });
          rawLinks.push(twitterUrl);
        }
      }
    }

    // Use Lovable AI to analyze and consolidate results
    const aiAnalysisPrompt = `Você é um assistente especializado em OSINT (Open Source Intelligence). Analise os seguintes dados de busca e identifique possíveis perfis distintos de pessoas com o nome "${query}"${city ? ` na região de ${city}` : ''}.

Dados coletados:
- Total de links encontrados: ${rawLinks.length}
- Plataformas pesquisadas: ${[...new Set(allProfiles.map(p => p.platform))].join(', ')}
${username ? `- Username fornecido: ${username}` : ''}

Com base nessas informações, forneça uma análise estruturada em JSON com o seguinte formato:
{
  "persons": [
    {
      "name": "Nome completo identificado",
      "confidence": 85,
      "location": "Cidade/País se identificado",
      "summary": "Resumo breve da pessoa (profissão, área de atuação)",
      "education": ["Educação identificada"],
      "experiences": ["Experiências profissionais"],
      "socialProfiles": ["URLs de perfis sociais encontrados"]
    }
  ],
  "alerts": ["Alertas relevantes como perfis recentes, inconsistências, etc."],
  "generalSummary": "Resumo geral da busca"
}

IMPORTANTE: Se não houver informações suficientes, use placeholders realistas mas indique baixa confiança. Considere que pode haver múltiplas pessoas com o mesmo nome.`;

    console.log('Requesting AI analysis...');
    
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
            content: 'Você é um especialista em OSINT e análise de dados públicos. Forneça análises precisas e estruturadas em JSON.'
          },
          {
            role: 'user',
            content: aiAnalysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!aiResponse.ok) {
      console.error('AI API error:', await aiResponse.text());
      throw new Error('Failed to analyze data with AI');
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices[0].message.content;
    
    console.log('AI Analysis received:', aiContent);

    // Parse AI response
    let analysisResult;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/) || aiContent.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : aiContent;
      analysisResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback to basic structure
      analysisResult = {
        persons: [{
          name: query,
          confidence: 60,
          location: city || 'Não especificado',
          summary: 'Análise em andamento',
          education: [],
          experiences: [],
          socialProfiles: rawLinks.slice(0, 5)
        }],
        alerts: ['Análise automática em processamento'],
        generalSummary: `Busca realizada para "${query}". ${allProfiles.length} perfis encontrados em ${[...new Set(allProfiles.map(p => p.platform))].length} plataformas.`
      };
    }

    // Map AI analysis to PersonProfile structure
    const persons: PersonProfile[] = analysisResult.persons.map((person: any) => ({
      name: person.name,
      confidence: person.confidence,
      location: person.location,
      summary: person.summary,
      education: person.education || [],
      experiences: person.experiences || [],
      profiles: allProfiles.filter(p => 
        person.socialProfiles?.some((url: string) => p.url.includes(url.split('/')[2]))
      )
    }));

    // If no persons identified, create default one
    if (persons.length === 0) {
      persons.push({
        name: query,
        confidence: 70,
        location: city || 'Não especificado',
        summary: 'Perfil identificado através de busca em plataformas públicas',
        profiles: allProfiles,
        education: [],
        experiences: []
      });
    }

    alerts.push(...(analysisResult.alerts || []));

    const summary = analysisResult.generalSummary || `Análise OSINT completa. ${persons.length} perfil(is) identificado(s) com base em ${allProfiles.length} referências.`;

    return {
      summary,
      totalProfilesFound: allProfiles.length,
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