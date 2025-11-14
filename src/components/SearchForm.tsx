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
  const navigate = useNavigate();
  const { toast } = useToast();

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
      // Create search job
      const { data, error } = await supabase.functions.invoke('create-search-job', {
        body: {
          query: formData.name,
          city: formData.city || null,
          username: formData.username || null,
          plan: selectedPlan,
        },
      });

      if (error) throw error;

      toast({
        title: 'Pesquisa Iniciada',
        description: 'Processando informações públicas...',
      });

      // Navigate to results page
      navigate(`/results?jobId=${data.jobId}`);
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
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Clique ou arraste uma foto para busca reversa
              </p>
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
