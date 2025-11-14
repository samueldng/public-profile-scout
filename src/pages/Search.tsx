import { motion } from 'framer-motion';
import { SearchForm } from '@/components/SearchForm';
import { Shield, Lock, Eye } from 'lucide-react';

const Search = () => {
  return (
    <div className="min-h-screen bg-background cyber-grid">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 text-glow bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Nova Pesquisa OSINT
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Pesquise informações públicas de forma rápida, ética e legal
          </p>
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
              transition={{ delay: index * 0.1 }}
              className="glass p-6 rounded-lg text-center"
            >
              <item.icon className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>

        <SearchForm />
      </div>
    </div>
  );
};

export default Search;
