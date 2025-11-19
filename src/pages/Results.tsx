import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertTriangle, CheckCircle, User, Search, GraduationCap, Briefcase, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

const Results = () => {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get('jobId');
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<OSINTResult | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<number>(0);
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
      const { data, error } = await supabase
        .from('search_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;

      if (data.status === 'pending' || data.status === 'processing') {
        setTimeout(fetchJobStatus, 2000);
      } else if (data.status === 'completed') {
        setResults(data.result_data as unknown as OSINTResult);
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
            Analisando múltiplas fontes públicas com IA
          </p>
          <div className="mt-4 w-48 h-2 bg-muted rounded-full overflow-hidden mx-auto">
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
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Nenhum resultado encontrado</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/search">Nova Busca</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/search">← Voltar para busca</Link>
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Resultados da Busca OSINT
            </CardTitle>
            <CardDescription>
              Pesquisa: {results.searchQuery} | {results.totalProfilesFound} referências encontradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">{results.summary}</p>
            
            {results.alerts && results.alerts.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                  Alertas
                </h3>
                <div className="space-y-2">
                  {results.alerts.map((alert: string, index: number) => (
                    <div key={index} className="bg-destructive/10 text-destructive p-3 rounded-lg">
                      {alert}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.persons && results.persons.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Perfis Identificados ({results.persons.length})
                </h3>
                
                {results.persons.length > 1 && (
                  <div className="mb-4 flex gap-2 flex-wrap">
                    {results.persons.map((person: PersonProfile, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedPerson(index)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          selectedPerson === index
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {person.name} ({person.confidence}% confiança)
                      </button>
                    ))}
                  </div>
                )}

                {results.persons[selectedPerson] && (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>{results.persons[selectedPerson].name}</CardTitle>
                        <CardDescription>
                          Confiança: {results.persons[selectedPerson].confidence}% | 
                          Localização: {results.persons[selectedPerson].location || 'Não especificado'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">
                          {results.persons[selectedPerson].summary}
                        </p>

                        {results.persons[selectedPerson].education && results.persons[selectedPerson].education!.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <GraduationCap className="w-4 h-4" />
                              Educação
                            </h4>
                            <ul className="list-disc list-inside space-y-1">
                              {results.persons[selectedPerson].education!.map((edu: string, idx: number) => (
                                <li key={idx} className="text-sm text-muted-foreground">{edu}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {results.persons[selectedPerson].experiences && results.persons[selectedPerson].experiences!.length > 0 && (
                          <div className="mb-4">
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Briefcase className="w-4 h-4" />
                              Experiências
                            </h4>
                            <ul className="list-disc list-inside space-y-1">
                              {results.persons[selectedPerson].experiences!.map((exp: string, idx: number) => (
                                <li key={idx} className="text-sm text-muted-foreground">{exp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {results.persons[selectedPerson].profiles && results.persons[selectedPerson].profiles.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-3">Perfis e Referências Online</h4>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          {results.persons[selectedPerson].profiles.map((profile: SearchResult, idx: number) => (
                            <Card key={idx}>
                              <CardHeader>
                                <CardTitle className="text-base">{profile.platform}</CardTitle>
                                {profile.relevanceScore && (
                                  <CardDescription>
                                    Relevância: {profile.relevanceScore}%
                                  </CardDescription>
                                )}
                              </CardHeader>
                              <CardContent>
                                {profile.title && (
                                  <p className="text-sm font-medium mb-1">{profile.title}</p>
                                )}
                                <p className="text-sm text-muted-foreground mb-2">
                                  {profile.description}
                                </p>
                                <a
                                  href={profile.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-1 text-sm"
                                >
                                  Acessar perfil
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {results.rawLinks && results.rawLinks.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Todas as Referências ({results.rawLinks.length})
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto bg-muted/50 p-4 rounded-lg">
                  {results.rawLinks.map((link: string, index: number) => (
                    <a
                      key={index}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Results;
