import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SearchResult {
  summary: string;
  profiles: Array<{
    platform: string;
    name?: string;
    url: string;
    description?: string;
  }>;
  rawLinks: string[];
  alerts: string[];
  searchQuery: string;
  timestamp: string;
}

const Results = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState<any>(null);
  const [results, setResults] = useState<SearchResult | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!jobId) {
      toast({
        title: 'Erro',
        description: 'ID do job não encontrado',
        variant: 'destructive',
      });
      return;
    }

    fetchJobStatus();
  }, [jobId]);

  const fetchJobStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-search-job', {
        body: { jobId },
      });

      if (error) throw error;

      setJob(data);

      if (data.status === 'pending') {
        // Start processing if pending
        await supabase.functions.invoke('process-search-job', {
          body: { jobId },
        });
        // Poll for updates
        setTimeout(fetchJobStatus, 3000);
      } else if (data.status === 'processing') {
        // Continue polling
        setTimeout(fetchJobStatus, 3000);
      } else if (data.status === 'completed') {
        setResults(data.result_data);
        setLoading(false);
      } else if (data.status === 'failed') {
        toast({
          title: 'Erro',
          description: data.error_message || 'Falha ao processar pesquisa',
          variant: 'destructive',
        });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching job:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao buscar status da pesquisa',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Processando Pesquisa...
          </h2>
          <p className="text-muted-foreground">
            Analisando múltiplas fontes públicas
          </p>
        </motion.div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="glass p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Nenhum resultado encontrado
          </h2>
          <Link to="/search">
            <Button className="bg-gradient-to-r from-primary to-secondary">
              Nova Pesquisa
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-glow bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Resultados da Pesquisa OSINT
            </h1>
            <p className="text-muted-foreground">
              Pesquisa: {job?.query} {job?.city && `(${job.city})`}
            </p>
          </div>

          {/* Summary */}
          <Card className="glass p-6 mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-primary" />
              Resumo
            </h2>
            <p className="text-foreground">{results.summary}</p>
          </Card>

          {/* Alerts */}
          {results.alerts.length > 0 && (
            <Card className="glass p-6 mb-6 border-destructive/50">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                Alertas
              </h2>
              <ul className="space-y-2">
                {results.alerts.map((alert, index) => (
                  <li key={index} className="flex items-start gap-2 text-foreground">
                    <span className="text-destructive">•</span>
                    {alert.replace(/_/g, ' ')}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Profiles Found */}
          <Card className="glass p-6 mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Perfis Encontrados ({results.profiles.length})
            </h2>
            <div className="grid gap-4">
              {results.profiles.map((profile, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-muted/30 border border-border hover:border-primary transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-foreground text-lg">
                        {profile.platform}
                      </h3>
                      {profile.name && (
                        <p className="text-muted-foreground">{profile.name}</p>
                      )}
                      {profile.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {profile.description}
                        </p>
                      )}
                    </div>
                    <a
                      href={profile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary-glow transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* All Links */}
          <Card className="glass p-6 mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Fontes Consultadas
            </h2>
            <ul className="space-y-2">
              {results.rawLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline break-all"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </Card>

          {/* Legal Notice */}
          <Card className="glass p-6 mb-6 bg-muted/20">
            <p className="text-sm text-muted-foreground">
              <strong>Aviso Legal:</strong> Todas as informações apresentadas são de
              fontes públicas. Verifique sempre antes de tomar decisões. Não utilize
              para assédio, discriminação ou fins ilegais.
            </p>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 flex-wrap">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90"
              onClick={() => window.print()}
            >
              <Download className="w-5 h-5 mr-2" />
              Baixar Relatório (PDF)
            </Button>
            <Link to="/search">
              <Button size="lg" variant="outline" className="border-primary text-primary">
                Nova Pesquisa
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Results;
