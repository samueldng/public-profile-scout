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
}

async function simulateOSINTSearch(
  query: string,
  city?: string,
  username?: string,
  plan?: string
): Promise<any> {
  // Simulated OSINT results for MVP
  // In production, this would call real APIs and scraping services
  
  const profiles: SearchResult[] = [];
  const rawLinks: string[] = [];
  const alerts: string[] = [];

  // Simulate LinkedIn search
  if (query) {
    profiles.push({
      platform: 'LinkedIn',
      name: query,
      url: `https://linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`,
      description: 'Perfil profissional'
    });
    rawLinks.push(`https://linkedin.com/search/results/people/?keywords=${encodeURIComponent(query)}`);
  }

  // Simulate GitHub search
  if (username) {
    profiles.push({
      platform: 'GitHub',
      url: `https://github.com/${username}`,
      description: 'Perfil de desenvolvedor'
    });
    rawLinks.push(`https://github.com/${username}`);
  }

  // Simulate Google search
  const searchQuery = `${query}${city ? ` ${city}` : ''}${username ? ` ${username}` : ''}`;
  rawLinks.push(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`);

  // Add more sources for complete plan
  if (plan === 'complete') {
    profiles.push({
      platform: 'Instagram',
      url: `https://instagram.com/${username || query.replace(/\s+/g, '')}`,
      description: 'Perfil social'
    });
    profiles.push({
      platform: 'Twitter/X',
      url: `https://twitter.com/search?q=${encodeURIComponent(query)}`,
      description: 'Perfil social'
    });
    
    // Add sample alerts
    if (Math.random() > 0.7) {
      alerts.push('perfil_recente_criado');
    }
  }

  const summary = `Encontrados ${profiles.length} perfis públicos para "${query}". ${alerts.length > 0 ? 'Alguns alertas detectados.' : 'Nenhum alerta detectado.'}`;

  return {
    summary,
    profiles,
    rawLinks,
    alerts,
    searchQuery,
    timestamp: new Date().toISOString(),
  };
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
      const results = await simulateOSINTSearch(
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
