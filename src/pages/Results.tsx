import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, MapPin, Mail, Phone, ExternalLink, AlertTriangle, CheckCircle, Info, Download } from 'lucide-react';
import { Header } from '@/components/Header';
import { generatePDFReport } from '@/utils/pdfGenerator';
import { toast } from 'sonner';

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
  username?: string;
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
  const navigate = useNavigate();
  const jobId = searchParams.get('jobId');
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<OSINTResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) {
      setError('ID da pesquisa não fornecido');
      setLoading(false);
      return;
    }

    const fetchResults = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('search_jobs')
          .select('*')
          .eq('id', jobId)
          .single();

        if (fetchError) throw fetchError;

        if (data.status === 'pending' || data.status === 'processing') {
          // Poll again after 2 seconds
          setTimeout(fetchResults, 2000);
          return;
        }

        if (data.status === 'completed' && data.result_data) {
          const parsedResults = typeof data.result_data === 'string' 
            ? JSON.parse(data.result_data)
            : data.result_data;
          setResults(parsedResults);
        } else if (data.status === 'failed') {
          setError(data.error_message || 'A pesquisa falhou');
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Erro ao carregar resultados');
        setLoading(false);
      }
    };

    fetchResults();
  }, [jobId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Processando análise OSINT...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <Card className="p-8 max-w-2xl mx-auto text-center">
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Erro na Pesquisa</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => navigate('/search')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar à Pesquisa
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <Card className="p-8 max-w-2xl mx-auto text-center">
            <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Nenhum Resultado</h2>
            <p className="text-muted-foreground mb-6">Nenhum dado encontrado para esta pesquisa.</p>
            <Button onClick={() => navigate('/search')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Nova Pesquisa
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleExportPDF = () => {
    if (!results) return;
    
    try {
      generatePDFReport(results);
      toast.success('Relatório PDF gerado com sucesso!', {
        description: 'O arquivo foi baixado para sua pasta de downloads'
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF', {
        description: 'Ocorreu um erro ao gerar o relatório. Tente novamente.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/search')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Nova Pesquisa
            </Button>
            
            <Button 
              onClick={handleExportPDF}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
          </div>

          {/* Header */}
          <Card className="p-8 mb-6 glass">
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Relatório de Análise OSINT
            </h1>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p><strong className="text-foreground">Pesquisa:</strong> {results.searchQuery}</p>
              <p><strong className="text-foreground">Data/Hora:</strong> {formatDate(results.timestamp)}</p>
              <p><strong className="text-foreground">Fontes Consultadas:</strong> {results.rawLinks.length} referências públicas</p>
              <p><strong className="text-foreground">Perfis Encontrados:</strong> {results.totalProfilesFound}</p>
            </div>
          </Card>

          {/* Executive Summary */}
          <Card className="p-6 mb-6 glass">
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-primary" />
              Resumo Executivo
            </h2>
            <p className="text-foreground leading-relaxed">{results.summary}</p>
          </Card>

          {/* Alerts */}
          {results.alerts && results.alerts.length > 0 && (
            <Card className="p-6 mb-6 glass border-yellow-500/30">
              <h2 className="text-xl font-semibold mb-3 flex items-center text-yellow-400">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Alertas e Limitações da Análise
              </h2>
              <ul className="space-y-2">
                {results.alerts.map((alert, idx) => (
                  <li key={idx} className="flex items-start text-yellow-300">
                    <span className="mr-2">•</span>
                    <span>{alert}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Platforms */}
          <Card className="p-6 mb-6 glass">
            <h2 className="text-xl font-semibold mb-3">🌐 Plataformas Consultadas</h2>
            <p className="text-muted-foreground mb-4">{results.rawLinks.length} fontes públicas verificadas</p>
            <div className="flex flex-wrap gap-2">
              {results.persons.flatMap(person => 
                person.profiles.map((profile, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {profile.platform}
                  </Badge>
                ))
              )}
            </div>
          </Card>

          {/* Person Profiles */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">👤 Perfis Identificados</h2>
            <p className="text-muted-foreground">
              {results.persons.length} perfil(is) identificado(s) com base nas fontes consultadas
            </p>

            {results.persons.map((person, personIdx) => (
              <Card key={personIdx} className="p-6 glass">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-primary mb-2">{person.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Confiança: {person.confidence}%</span>
                      {person.location && (
                        <span className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1" />
                          {person.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {person.summary && (
                  <div className="mb-6 p-4 rounded-lg bg-muted/30">
                    <h4 className="font-semibold mb-2 text-foreground">Resumo / Biografia:</h4>
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">{person.summary}</p>
                  </div>
                )}

                {person.education && person.education.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-foreground">🎓 Formação:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {person.education.map((edu, idx) => (
                        <li key={idx}>{edu}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {person.experiences && person.experiences.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold mb-2 text-foreground">💼 Experiências:</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {person.experiences.map((exp, idx) => (
                        <li key={idx}>{exp}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-3 text-foreground">🔗 Perfis e Referências Online</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    {person.profiles.length} referência(s) associada(s) a este perfil
                  </p>
                  <div className="space-y-3">
                    {person.profiles.map((profile, idx) => (
                      <div 
                        key={idx}
                        className="p-4 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors border border-border"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {profile.platform}
                              </Badge>
                              {profile.relevanceScore !== undefined && (
                                <span className="text-xs text-muted-foreground">
                                  Relevância: {profile.relevanceScore}%
                                </span>
                              )}
                            </div>
                            {profile.title && (
                              <p className="font-medium text-foreground mb-1">{profile.title}</p>
                            )}
                            {profile.description && (
                              <p className="text-sm text-muted-foreground mb-2">{profile.description}</p>
                            )}
                            {profile.location && (
                              <p className="text-xs text-muted-foreground flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {profile.location}
                              </p>
                            )}
                          </div>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="ml-4"
                            onClick={() => window.open(profile.url, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* All References */}
          <Card className="p-6 mt-6 glass">
            <h2 className="text-xl font-semibold mb-3">📚 Todas as Referências Consultadas</h2>
            <p className="text-muted-foreground mb-4">
              {results.rawLinks.length} fonte(s) pública(s) verificada(s) nesta análise
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.rawLinks.map((link, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="justify-start h-auto py-3 px-4"
                  onClick={() => window.open(link, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-left truncate text-xs">{link}</span>
                </Button>
              ))}
            </div>
          </Card>

          {/* Disclaimer */}
          <Card className="p-6 mt-6 glass border-muted">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">ℹ️ Nota:</strong> Todas as informações apresentadas neste relatório 
              foram extraídas exclusivamente das fontes listadas acima. Dados não verificáveis foram marcados como 
              "Não encontrado" ou omitidos.
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Results;
