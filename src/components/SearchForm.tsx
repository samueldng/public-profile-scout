import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Upload, Search } from 'lucide-react';
import { useState } from 'react';

export const SearchForm = () => {
  const [agreed, setAgreed] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="p-8 glass max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Nome Completo *</Label>
            <Input
              id="name"
              placeholder="Ex: João Silva"
              className="bg-muted/50 border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-foreground">Username / Handle (Opcional)</Label>
            <Input
              id="username"
              placeholder="Ex: @joaosilva"
              className="bg-muted/50 border-border text-foreground"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-foreground">Cidade (Opcional)</Label>
            <Input
              id="city"
              placeholder="Ex: São Paulo"
              className="bg-muted/50 border-border text-foreground"
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
            disabled={!agreed}
          >
            <Search className="w-5 h-5 mr-2" />
            Iniciar Pesquisa
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
