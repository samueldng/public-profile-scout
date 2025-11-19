import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Upload, Search, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  });
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
      let imageData: string | null = null;
      
      // Convert image to base64 if provided
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

      // Simulate processing by updating status directly
      // In a real implementation, this would be done by the backend functions
      setTimeout(async () => {
        // Create mock results
        const mockResults = {
          summary: `Encontrados 3 perfis públicos para "${formData.name}". Nenhum alerta detectado.`,
          profiles: [
            {
              platform: 'LinkedIn',
              name: formData.name,
              url: `https://linkedin.com/search/results/people/?keywords=${encodeURIComponent(formData.name)}`,
              description: 'Perfil profissional'
            },
            {
              platform: 'GitHub',
              url: `https://github.com/${formData.username || formData.name.replace(/\s+/g, '')}`,
              description: 'Perfil de desenvolvedor'
            },
            ...(selectedPlan === 'complete' ? [{
              platform: 'Instagram',
              url: `https://instagram.com/${formData.username || formData.name.replace(/\s+/g, '')}`,
              description: 'Perfil social'
            }] : [])
          ],
          rawLinks: [
            `https://www.google.com/search?q=${encodeURIComponent(formData.name + (formData.city ? ` ${formData.city}` : '') + (formData.username ? ` ${formData.username}` : ''))}`,
            `https://linkedin.com/search/results/people/?keywords=${encodeURIComponent(formData.name)}`,
            `https://github.com/${formData.username || formData.name.replace(/\s+/g, '')}`
          ],
          alerts: [],
          searchQuery: `${formData.name}${formData.city ? ` ${formData.city}` : ''}${formData.username ? ` ${formData.username}` : ''}`,
          timestamp: new Date().toISOString(),
          education: ['Bacharelado em Ciência da Computação - Universidade XYZ'],
          experiences: ['Desenvolvedor Sênior - Empresa ABC (2020-Presente)'],
          photos: imageData ? [{
            url: 'https://example.com/uploaded-photo.jpg',
            reverseSearchResults: {
              matches: [
                {
                  url: 'https://example.com/match1',
                  similarity: 95,
                  platform: 'Stock Photo Site'
                }
              ],
              isStockPhoto: false
            }
          }] : []
        };

        // Update job with mock results
        await supabase
          .from('search_jobs')
          .update({
            status: 'completed',
            result_data: mockResults,
            completed_at: new Date().toISOString(),
          })
          .eq('id', job.id);
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
                  Iniciar Pesquisa - R$ {selectedPlan === 'basic' ? '4,90' : '14,90'}
                </>
              )}
            </Button>
          </div>
        </Card>
      </form>
    </motion.div>
  );
};