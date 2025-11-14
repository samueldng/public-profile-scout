import { motion } from 'framer-motion';
import { SearchForm } from '@/components/SearchForm';
import { Shield, Lock, Eye, Search as SearchIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const Search = () => {
  const [selectedPlan, setSelectedPlan] = useState<'basic' | 'complete'>('basic');
  const [dbTest, setDbTest] = useState<string>('');

  // Test database connection
  useEffect(() => {
    const testDbConnection = async () => {
      try {
        const { data, error } = await supabase
          .from('search_jobs')
          .select('count()', { count: 'exact' });
        
        if (error) {
          setDbTest(`DB Error: ${error.message}`);
        } else {
          setDbTest(`DB Connected. Jobs count: ${data?.[0]?.count || 0}`);
        }
      } catch (err) {
        setDbTest(`DB Test Failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };
    
    testDbConnection();
  }, []);

  return (
    <div className="min-h-screen bg-background cyber-grid">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.h1 
            className="text-5xl font-bold mb-4 text-glow bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            Nova Pesquisa OSINT
          </motion.h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pesquise informações públicas de forma rápida, ética e legal
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Status: {dbTest}
          </p>
        </motion.div>

        {/* Plan Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-2xl mx-auto mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4 text-center">
            Escolha seu Plano
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={selectedPlan === 'basic' ? 'default' : 'outline'}
                className={`h-auto py-6 flex flex-col items-start relative overflow-hidden ${
                  selectedPlan === 'basic'
                    ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'border-border text-foreground'
                }`}
                onClick={() => setSelectedPlan('basic')}
              >
                {selectedPlan === 'basic' && (
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <span className="text-lg font-bold">Pesquisa Básica</span>
                <span className="text-2xl font-bold mt-2">R$ 4,90</span>
                <span className="text-sm mt-1 opacity-80">Redes sociais + busca</span>
              </Button>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                variant={selectedPlan === 'complete' ? 'default' : 'outline'}
                className={`h-auto py-6 flex flex-col items-start relative overflow-hidden ${
                  selectedPlan === 'complete'
                    ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg shadow-primary/30'
                    : 'border-border text-foreground'
                }`}
                onClick={() => setSelectedPlan('complete')}
              >
                {selectedPlan === 'complete' && (
                  <motion.div
                    className="absolute inset-0 bg-white/20"
                    initial={{ x: '-100%' }}
                    animate={{ x: '100%' }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
                <span className="text-lg font-bold">Pesquisa Completa</span>
                <span className="text-2xl font-bold mt-2">R$ 14,90</span>
                <span className="text-sm mt-1 opacity-80">Busca reversa + alertas</span>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {[
            {
              icon: Shield,
              title: 'Apenas Dados Públicos',
              description: 'Sem acesso a CPF, telefone ou endereço',
            },
            {
              icon: Lock,
              title: '100% Legal',
              description: 'Conforme LGPD e políticas de privacidade',
            },
            {
              icon: Eye,
              title: 'Transparente',
              description: 'Todas as fontes são mostradas no relatório',
            },
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ y: -10 }}
              className="glass p-6 rounded-lg text-center relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5"
                initial={{ scale: 0 }}
                whileHover={{ scale: 1 }}
                transition={{ duration: 0.3 }}
              />
              <div className="relative z-10">
                <item.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <SearchForm selectedPlan={selectedPlan} />
        </motion.div>
      </div>
    </div>
  );
};

export default Search;