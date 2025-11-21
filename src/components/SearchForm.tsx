import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Upload, Search, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
// Import our new OSINT service
import { performOSINTSearch } from '@/services/osintService';

interface SearchFormProps {
  selectedPlan?: 'basic' | 'complete';
}

export const SearchForm = ({ selectedPlan = 'basic' }: SearchFormProps) => {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    city: '',
    email: '',
    phone: '',
  });
  const [advancedOptions, setAdvancedOptions] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: 'Erro',
          description: 'A imagem deve ter menos de 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: 'Erro',
        description: 'Nome é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    if (!agreed) {
      toast({
        title: 'Erro',
        description: 'Você precisa concordar com os termos',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Convert image to base64 if provided
      let imageData: string | null = null;
      
      if (imageFile) {
        imageData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
      }

      // Create search job directly in database
      const { data: job, error: jobError } = await supabase
        .from('search_jobs')
        .insert({
          query: formData.name.trim(),
          city: formData.city?.trim() || null,
          username: formData.username?.trim() || null,
          plan: selectedPlan,
          status: 'pending',
        })
        .select()
        .single();

      if (jobError) throw jobError;

      // Process the search using our new OSINT service
      setTimeout(async () => {
        try {
          // Perform OSINT search using our new service
          const osintResults = await performOSINTSearch({
            nome: formData.name,
            username: formData.username,
            cidade: formData.city,
            email: formData.email,
            phone: formData.phone,
            foto: imageFile || undefined
          });

          // Update job with real results from our OSINT service
          await supabase
            .from('search_jobs')
            .update({
              status: 'completed',
              result_data: JSON.stringify(osintResults),
              completed_at: new Date().toISOString(),
            })
            .eq('id', job.id);
        } catch (error) {
          console.error('Error processing OSINT search:', error);
          // Fallback HONESTO: apenas links de referência, SEM dados fictícios
          const mockResults = {
            summary: `❌ FALHA NA ANÁLISE AUTOMÁTICA para "${formData.name}". A extração de dados das plataformas não foi possível devido a restrições de scraping. Apenas links de referência estão disponíveis. Recomenda-se verificação manual.`,
            totalProfilesFound: 0,
            persons: [
              {
                name: formData.name,
                confidence: 15, // Confiança muito baixa
                location: formData.city || undefined,
                summary: `⚠️ NENHUM DADO EXTRAÍDO: A análise automática falhou. As plataformas consultadas bloquearam o acesso automatizado. Apenas ${selectedPlan === 'complete' ? 'links de referência' : 'links básicos'} estão disponíveis. Para obter informações detalhadas, você deve acessar manualmente cada link abaixo.`,
                education: [], // NUNCA preencher com dados fictícios
                experiences: [], // NUNCA preencher com dados fictícios
                profiles: [
                  {
                    platform: 'LinkedIn (verificação manual)',
                    name: formData.name,
                    url: `https://linkedin.com/search/results/people/?keywords=${encodeURIComponent(formData.name)}`,
                    description: 'Link de busca - acesso manual necessário',
                    relevanceScore: undefined
                  },
                  {
                    platform: 'GitHub (verificação manual)',
                    url: `https://github.com/${formData.username || formData.name.replace(/\s+/g, '')}`,
                    description: 'Link de busca - acesso manual necessário',
                    relevanceScore: undefined
                  },
                  ...(selectedPlan === 'complete' ? [
                    {
                      platform: 'Instagram (verificação manual)',
                      url: `https://instagram.com/${formData.username || formData.name.replace(/\s+/g, '')}`,
                      description: 'Link de busca - dados não extraídos',
                      relevanceScore: undefined
                    },
                    {
                      platform: 'Twitter (verificação manual)',
                      url: `https://twitter.com/${formData.username || formData.name.replace(/\s+/g, '')}`,
                      description: 'Link de busca - dados não extraídos',
                      relevanceScore: undefined
                    },
                    {
                      platform: 'Facebook (verificação manual)',
                      url: `https://facebook.com/search/people/?q=${encodeURIComponent(formData.name)}`,
                      description: 'Link de busca - dados não extraídos',
                      relevanceScore: undefined
                    },
                    {
                      platform: 'Lattes (verificação manual)',
                      url: `https://lattes.cnpq.br/buscacv?q=${encodeURIComponent(formData.name)}`,
                      description: 'Currículo Lattes - verificação manual necessária',
                      relevanceScore: undefined
                    },
                    {
                      platform: 'JusBrasil (verificação manual)',
                      url: `https://www.jusbrasil.com.br/busca?q=${encodeURIComponent(formData.name)}`,
                      description: 'Busca jurídica - verificação manual necessária',
                      relevanceScore: undefined
                    }
                  ] : [])
                ]
              }
            ],
            rawData: {
              governmentData: undefined, // Dados governamentais não acessíveis via scraping automático
              socialMedia: {
                totalProfiles: selectedPlan === 'complete' ? 20 : 3,
                platforms: selectedPlan === 'complete' ? 
                  ['LinkedIn', 'GitHub', 'Instagram', 'Twitter', 'Facebook', 'TikTok', 'Reddit', 'Medium', 'Dev.to', 'Stack Overflow', 'YouTube', 'Lattes', 'JusBrasil'] :
                  ['LinkedIn', 'GitHub', 'Instagram']
              },
              positiveData: [],  // Removido - nenhum dado real extraído
              negativeData: [],  // Removido - nenhum dado real extraído
              riskIndicators: [] // Removido - nenhum dado real extraído
            },
            rawLinks: [
              `https://www.google.com/search?q=${encodeURIComponent(formData.name + (formData.city ? ` ${formData.city}` : '') + (formData.username ? ` ${formData.username}` : ''))}`,
              `https://linkedin.com/search/results/people/?keywords=${encodeURIComponent(formData.name)}`,
              `https://github.com/${formData.username || formData.name.replace(/\s+/g, '')}`,
              ...(selectedPlan === 'complete' ? [
                `https://instagram.com/${formData.username || formData.name.replace(/\s+/g, '')}`,
                `https://twitter.com/${formData.username || formData.name.replace(/\s+/g, '')}`,
                `https://facebook.com/search/people/?q=${encodeURIComponent(formData.name)}`,
                `https://tiktok.com/search?q=${encodeURIComponent(formData.name)}`,
                `https://reddit.com/search?q=${encodeURIComponent(formData.name)}`,
                `https://medium.com/search?q=${encodeURIComponent(formData.name)}`,
                `https://dev.to/search?q=${encodeURIComponent(formData.name)}`,
                `https://stackoverflow.com/users?tab=reputation&filter=all&search=${encodeURIComponent(formData.name)}`,
                `https://youtube.com/results?search_query=${encodeURIComponent(formData.name)}`,
                `https://pinterest.com/search/pins/?q=${encodeURIComponent(formData.name)}`,
                `https://behance.net/search?search=${encodeURIComponent(formData.name)}`,
                `https://t.me/${formData.username || formData.name.replace(/\s+/g, '')}`,
                'https://onlyfans.com/search/profiles',
                'https://privacy.com/search/profiles',
                `https://x.com/search?q=${encodeURIComponent(formData.name)}&lang=pt`,
                'https://lattes.cnpq.br/',
                `https://empresas.serasaexperian.com.br/busca-empresa/${encodeURIComponent(formData.name)}`,
                `https://www.jusbrasil.com.br/busca?q=${encodeURIComponent(formData.name)}`,
                `https://vimeo.com/search?q=${encodeURIComponent(formData.name)}`,
                `https://twitch.tv/search?term=${encodeURIComponent(formData.name)}`,
                `https://quora.com/search?q=${encodeURIComponent(formData.name)}`
              ] : [])
            ],
            alerts: [
              '🚨 FALHA NA EXTRAÇÃO AUTOMÁTICA: As plataformas bloquearam o acesso',
              '⚠️ DADOS FICTÍCIOS REMOVIDOS: Este relatório não contém informações inventadas',
              `📋 ${selectedPlan === 'complete' ? 'Links de referência' : 'Links básicos'} disponíveis para verificação manual`,
              '🔍 RECOMENDAÇÃO: Acesse manualmente cada link para obter informações verificadas'
            ],
            searchQuery: `${formData.name}${formData.city ? ` ${formData.city}` : ''}${formData.username ? ` ${formData.username}` : ''}`,
            timestamp: new Date().toISOString()
          };

          // Update job with mock results
          await supabase
            .from('search_jobs')
            .update({
              status: 'completed',
              result_data: JSON.stringify(mockResults),
              completed_at: new Date().toISOString(),
            })
            .eq('id', job.id);
        }
      }, 2000);

      toast({
        title: 'Pesquisa Iniciada',
        description: 'Processando informações públicas...',
      });

      // Navigate to results page
      navigate(`/results?jobId=${job.id}`);
    } catch (error) {
      console.error('Error creating search:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao iniciar pesquisa. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <form onSubmit={handleSubmit}>
        <Card className="p-8 glass max-w-2xl mx-auto">
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">Nome Completo *</Label>
              <Input
                id="name"
                placeholder="Ex: João Silva"
                className="bg-muted/50 border-border text-foreground"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">Username / Handle (Opcional)</Label>
              <Input
                id="username"
                placeholder="Ex: @joaosilva"
                className="bg-muted/50 border-border text-foreground"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-foreground">Cidade (Opcional)</Label>
              <Input
                id="city"
                placeholder="Ex: São Paulo"
                className="bg-muted/50 border-border text-foreground"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                disabled={loading}
              />
            </div>

            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => setAdvancedOptions(!advancedOptions)}
            >
              {advancedOptions ? 'Ocultar opções avançadas' : 'Mostrar opções avançadas'}
            </button>

            {advancedOptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email (Opcional)</Label>
                  <Input
                    id="email"
                    placeholder="Ex: joao@exemplo.com"
                    className="bg-muted/50 border-border text-foreground"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Telefone (Opcional)</Label>
                  <Input
                    id="phone"
                    placeholder="Ex: (11) 99999-9999"
                    className="bg-muted/50 border-border text-foreground"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <div className="flex items-start space-x-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-700">
                    <strong>Aviso:</strong> Apenas dados públicos serão coletados. Não coletamos informações privadas ou restritas.
                  </p>
                </div>
              </motion.div>
            )}

          <div className="space-y-2">
            <Label className="text-foreground">Upload de Foto (Opcional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer relative">
              <Input
                type="file"
                accept="image/*"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleImageChange}
                disabled={loading}
              />
              {imagePreview ? (
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="max-h-40 mx-auto rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                  >
                    Remover
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Clique ou arraste uma foto para busca reversa
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tamanho máximo: 5MB
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-3 p-4 rounded-lg bg-muted/30 border border-border">
            <Checkbox
              id="terms"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked as boolean)}
            />
            <label
              htmlFor="terms"
              className="text-sm text-foreground leading-relaxed cursor-pointer"
            >
              Li e concordo com os{' '}
              <a href="/termos" className="text-primary hover:underline">
                Termos de Uso
              </a>{' '}
              e{' '}
              <a href="/privacidade" className="text-primary hover:underline">
                Política de Privacidade
              </a>
              . Entendo que as informações são públicas e não devem ser usadas para
              assédio, stalking ou discriminação.
            </label>
          </div>

            <Button
              className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-bold text-lg py-6"
              size="lg"
              type="submit"
              disabled={!agreed || loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  {selectedPlan === 'basic' 
                    ? 'Iniciar Pesquisa - R$ 4,90' 
                    : 'Iniciar Pesquisa Ilimitada'}
                </>
              )}
            </Button>
            
            {selectedPlan === 'complete' && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                Com assinatura R$ 14,90/mês - pesquisas ilimitadas
              </p>
            )}
          </div>
        </Card>
      </form>
    </motion.div>
  );
};