import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download, ExternalLink, AlertTriangle, CheckCircle, User, MapPin, LinkIcon, Search, GraduationCap, Briefcase, Image } from 'lucide-react';
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
  education?: string[];
  experiences?: string[];
  photos?: Array<{ url: string; reverseSearchResults?: any }>;
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
      // Fetch job directly from database instead of using function
      const { data, error } = await supabase
        .from('search_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;

      setJob(data);

      if (data.status === 'pending' || data.status === 'processing') {
        // Continue polling
        setTimeout(fetchJobStatus, 2000);
      } else if (data.status === 'completed') {
        setResults(data.result_data as unknown as SearchResult);
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
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 text-primary mx-auto mb-4"
          >
            <Search className="w-full h-full" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Processando Pesquisa...
          </h2>
          <p className="text-muted-foreground">
            Analisando múltiplas fontes públicas
          </p>
          <div className="mt-4 w-48 h-2 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
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
          <div className="mb-8 text-center">
            <motion.h1 
              className="text-4xl font-bold mb-2 text-glow bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Resultados da Pesquisa OSINT
            </motion.h1>
            <p className="text-muted-foreground">
              Pesquisa: {job?.query} {job?.city && `(${job.city})`}
            </p>
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="glass p-6 mb-6 border-primary/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 animate-pulse" />
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-primary" />
                  Resumo
                </h2>
                <p className="text-foreground">{results.summary}</p>
              </div>
            </Card>
          </motion.div>

          {/* Alerts */}
          {results.alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass p-6 mb-6 border-destructive/50 relative overflow-hidden">
                <div className="absolute inset-0 bg-destructive/10 animate-pulse" />
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-destructive" />
                    Alertas
                  </h2>
                  <ul className="space-y-2">
                    {results.alerts.map((alert, index) => (
                      <motion.li 
                        key={index} 
                        className="flex items-start gap-2 text-foreground"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                      >
                        <span className="text-destructive">•</span>
                        {alert.replace(/_/g, ' ')}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Education and Experiences */}
          {(results.education?.length || results.experiences?.length) > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass p-6 mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-primary" />
                  Formação e Experiências
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {results.education?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        Formação
                      </h3>
                      <ul className="space-y-2">
                        {results.education.map((edu, index) => (
                          <li key={index} className="text-foreground bg-muted/30 p-3 rounded-lg">
                            {edu}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {results.experiences?.length > 0 && (
                    <div>
                      <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                        <Briefcase className="w-5 h-5" />
                        Experiências
                      </h3>
                      <ul className="space-y-2">
                        {results.experiences.map((exp, index) => (
                          <li key={index} className="text-foreground bg-muted/30 p-3 rounded-lg">
                            {exp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Photos */}
          {results.photos?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass p-6 mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Image className="w-6 h-6 text-primary" />
                  Fotos Encontradas
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {results.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={photo.url} 
                        alt={`Foto ${index + 1}`} 
                        className="w-full h-40 object-cover rounded-lg border border-border"
                      />
                      {photo.reverseSearchResults && (
                        <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-white text-center p-2">
                            <p className="text-sm font-bold">
                              Similaridade: {photo.reverseSearchResults.matches[0]?.similarity || 'N/A'}%
                            </p>
                            <p className="text-xs">
                              {photo.reverseSearchResults.matches[0]?.platform || 'Desconhecido'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}

          {/* Profiles Found */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="glass p-6 mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <User className="w-6 h-6 text-primary" />
                Perfis Encontrados ({results.profiles.length})
              </h2>
              <div className="grid gap-4">
                {results.profiles.map((profile, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="p-4 rounded-lg bg-muted/30 border border-border hover:border-primary transition-all duration-300 hover:shadow-lg hover:shadow-primary/20"
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
          </motion.div>

          {/* All Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="glass p-6 mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                <LinkIcon className="w-6 h-6 text-primary" />
                Fontes Consultadas
              </h2>
              <ul className="space-y-2">
                {results.rawLinks.map((link, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.05 }}
                  >
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline break-all flex items-center gap-2"
                    >
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      {link}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </Card>
          </motion.div>

          {/* Legal Notice */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <Card className="glass p-6 mb-6 bg-muted/20">
              <p className="text-sm text-muted-foreground">
                <strong>Aviso Legal:</strong> Todas as informações apresentadas são de
                fontes públicas. Verifique sempre antes de tomar decisões. Não utilize
                para assédio, discriminação ou fins ilegais.
              </p>
            </Card>
          </motion.div>

          {/* Actions */}
          <motion.div
            className="flex gap-4 flex-wrap justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
          >
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 shadow-lg shadow-primary/30"
              onClick={() => window.print()}
            >
              <Download className="w-5 h-5 mr-2" />
              Baixar Relatório (PDF)
            </Button>
            <Link to="/search">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Nova Pesquisa
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Results;