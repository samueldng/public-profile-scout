import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertTriangle, CheckCircle, User, Search, GraduationCap, Briefcase, FileText, Shield, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';

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
        // Parse the JSON data if it's a string
        const parsedData = typeof data.result_data === 'string' 
          ? JSON.parse(data.result_data) 
          : data.result_data;
        setResults(parsedData as unknown as OSINTResult);
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
        <Header />
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
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link to="/search">← Voltar para busca</Link>
          </Button>
        </div>

        {/* HEADER: METADATA DA PESQUISA */}
        <Card className="mb-6 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Search className="w-6 h-6 text-primary" />
              🔎 Relatório de Análise OSINT
            </CardTitle>
            <CardDescription className="text-base">
              <div className="space-y-1 mt-2">
                <div><strong>Pesquisa:</strong> {results.searchQuery}</div>
                <div><strong>Data/Hora:</strong> {new Date(results.timestamp).toLocaleString('pt-BR')}</div>
                <div><strong>Fontes Consultadas:</strong> {results.rawLinks.length} referências públicas</div>
                <div><strong>Fontes com Dados Extraídos:</strong> {results.totalProfilesFound}</div>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">📋 Resumo Executivo:</h4>
              <p className="text-sm text-muted-foreground">{results.summary}</p>
            </div>
          </CardContent>
        </Card>
            
            {/* ALERTAS E AVISOS */}
            {results.alerts && results.alerts.length > 0 && (
              <Card className="mb-6 border-yellow-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-600">
                    <AlertTriangle className="w-5 h-5" />
                    ⚠️ Alertas e Limitações da Análise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {results.alerts.map((alert: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{alert}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* NOTA: Removida seção de "Dados Positivos/Negativos/Risco" e "Dados Governamentais" 
                 pois esses são dados fictícios não extraídos de fontes reais */}

            {/* Social Media Section */}
            {results.rawData && results.rawData.socialMedia && results.rawData.socialMedia.platforms && results.rawData.socialMedia.platforms.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    🌐 Plataformas Consultadas
                  </CardTitle>
                  <CardDescription>
                    {results.rawData.socialMedia.totalProfiles || results.rawLinks.length} fontes públicas verificadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {results.rawData.socialMedia.platforms.map((platform, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* SEÇÃO PRINCIPAL: PERFIS IDENTIFICADOS */}
            {results.persons && results.persons.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <User className="w-6 h-6" />
                    👤 Perfis Identificados
                  </CardTitle>
                  <CardDescription>
                    {results.persons.length === 1 
                      ? 'Um perfil foi identificado com base nas fontes consultadas'
                      : `${results.persons.length} perfis diferentes foram identificados (possíveis homônimos ou pessoas distintas)`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {/* MENU DE NAVEGAÇÃO ENTRE PERFIS */}
                  {results.persons.length > 1 && (
                    <div className="mb-6 p-4 bg-muted/30 rounded-lg">
                      <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
                        Selecione um perfil para visualizar:
                      </h4>
                      <div className="flex gap-2 flex-wrap">
                        {results.persons.map((person: PersonProfile, index: number) => {
                          const confidenceColor = person.confidence >= 70 
                            ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                            : person.confidence >= 40 
                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20'
                            : 'border-red-500 bg-red-50 dark:bg-red-950/20';
                          
                          return (
                            <button
                              key={index}
                              onClick={() => setSelectedPerson(index)}
                              className={`px-4 py-3 rounded-lg transition-all border-2 ${
                                selectedPerson === index
                                  ? 'bg-primary text-primary-foreground border-primary scale-105'
                                  : `${confidenceColor} hover:scale-102`
                              }`}
                            >
                              <div className="text-left">
                                <div className="font-semibold">Perfil {index + 1}</div>
                                <div className="text-xs opacity-80">
                                  {person.name}
                                </div>
                                <div className="text-xs mt-1">
                                  Confiança: {person.confidence}%
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* EXIBIÇÃO DO PERFIL SELECIONADO */}
                  {results.persons[selectedPerson] && (
                    <div className="space-y-6">
                      {/* Informações Básicas */}
                      <div className="bg-gradient-to-r from-primary/5 to-secondary/5 p-6 rounded-lg border">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-2xl font-bold">{results.persons[selectedPerson].name}</h3>
                            {results.persons[selectedPerson].username && (
                              <p className="text-sm text-muted-foreground mt-1">
                                @{results.persons[selectedPerson].username}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                              results.persons[selectedPerson].confidence >= 70
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : results.persons[selectedPerson].confidence >= 40
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              Confiança: {results.persons[selectedPerson].confidence}%
                            </div>
                          </div>
                        </div>

                        {results.persons[selectedPerson].location && (
                          <p className="text-sm mb-2">
                            📍 <strong>Localização:</strong> {results.persons[selectedPerson].location}
                          </p>
                        )}

                        <div className="mt-4 p-4 bg-background/50 rounded border">
                          <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Resumo / Biografia:</h4>
                          <p className="text-sm">{results.persons[selectedPerson].summary || 'Informações insuficientes.'}</p>
                        </div>
                      </div>

                      {/* Educação */}
                      {results.persons[selectedPerson].education && results.persons[selectedPerson].education!.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                              <GraduationCap className="w-5 h-5" />
                              🎓 Formação Acadêmica
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {results.persons[selectedPerson].education!.map((edu: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{edu}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {/* Experiências */}
                      {results.persons[selectedPerson].experiences && results.persons[selectedPerson].experiences!.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                              <Briefcase className="w-5 h-5" />
                              💼 Experiência Profissional
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {results.persons[selectedPerson].experiences!.map((exp: string, idx: number) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                                  <span className="text-sm">{exp}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      {/* Perfis Online */}
                      {results.persons[selectedPerson].profiles && results.persons[selectedPerson].profiles.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-base">
                              <ExternalLink className="w-5 h-5" />
                              🔗 Perfis e Referências Online
                            </CardTitle>
                            <CardDescription>
                              {results.persons[selectedPerson].profiles.length} referência(s) associada(s) a este perfil
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                              {results.persons[selectedPerson].profiles.map((profile: SearchResult, idx: number) => (
                                <Card key={idx} className="border-primary/20">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-semibold">{profile.platform}</CardTitle>
                                    {profile.relevanceScore && (
                                      <CardDescription className="text-xs">
                                        Relevância: {profile.relevanceScore}%
                                      </CardDescription>
                                    )}
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    {profile.title && (
                                      <p className="text-sm font-medium">{profile.title}</p>
                                    )}
                                    {profile.description && (
                                      <p className="text-xs text-muted-foreground">{profile.description}</p>
                                    )}
                                    <a
                                      href={profile.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                                    >
                                      Acessar link
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* SEÇÃO DE REFERÊNCIAS COMPLETAS */}
            {results.rawLinks && results.rawLinks.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    📚 Todas as Referências Consultadas
                  </CardTitle>
                  <CardDescription>
                    {results.rawLinks.length} fonte(s) pública(s) verificada(s) nesta análise
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-96 overflow-y-auto bg-muted/30 p-4 rounded-lg border">
                    {results.rawLinks.map((link: string, index: number) => {
                      // Identificar plataforma pelo URL
                      let platform = 'Web';
                      let icon = '🌐';
                      if (link.includes('linkedin')) { platform = 'LinkedIn'; icon = '💼'; }
                      else if (link.includes('github')) { platform = 'GitHub'; icon = '💻'; }
                      else if (link.includes('instagram')) { platform = 'Instagram'; icon = '📷'; }
                      else if (link.includes('twitter') || link.includes('x.com')) { platform = 'Twitter/X'; icon = '🐦'; }
                      else if (link.includes('lattes') || link.includes('cnpq')) { platform = 'Lattes'; icon = '🎓'; }
                      else if (link.includes('jusbrasil')) { platform = 'JusBrasil'; icon = '⚖️'; }
                      
                      return (
                        <div key={index} className="flex items-center gap-3 p-2 hover:bg-background/50 rounded transition-colors">
                          <span className="text-xl">{icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-muted-foreground mb-1">{platform}</div>
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-1 truncate"
                            >
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{link}</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-300">
                      <strong>ℹ️ Nota:</strong> Todas as informações apresentadas neste relatório foram extraídas 
                      exclusivamente das fontes listadas acima. Dados não verificáveis foram marcados como 
                      "Não encontrado" ou omitidos.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
      </div>
    </div>
  );
};

export default Results;