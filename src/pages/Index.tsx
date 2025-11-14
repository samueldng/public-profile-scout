import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Hero3D } from '@/components/Hero3D';
import { PricingCard } from '@/components/PricingCard';
import { Shield, Zap, Eye, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const pricingPlans = [
    {
      title: 'Pesquisa Básica',
      price: 'R$ 4,90',
      description: 'Ideal para verificações rápidas',
      features: [
        'Busca em redes sociais públicas',
        'LinkedIn e GitHub',
        'Top 10 resultados de busca',
        'Relatório HTML',
        'Entrega em 30 segundos',
      ],
    },
    {
      title: 'Pesquisa Completa',
      price: 'R$ 14,90',
      description: 'Análise profunda e detalhada',
      features: [
        'Tudo da Pesquisa Básica',
        'Busca reversa de imagem',
        'Análise de múltiplas plataformas',
        'Indicadores de alerta',
        'Relatório PDF detalhado',
        'Verificação de consistência',
        'Histórico de menções',
      ],
      popular: true,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <Hero3D />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
        
        <div className="container mx-auto px-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1
              className="text-6xl md:text-8xl font-bold mb-6 text-glow"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                OSINT Light
              </span>
            </motion.h1>
            
            <p className="text-xl md:text-2xl text-foreground mb-8 max-w-2xl mx-auto">
              Descubra a presença pública online de qualquer pessoa em segundos.
              Evite golpes. Verifique informações. 100% legal.
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/search">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-bold px-8 py-6 text-lg animate-glow-pulse"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Fazer Pesquisa Agora
                </Button>
              </Link>
              
              <Button
                size="lg"
                variant="outline"
                className="border-primary text-primary hover:bg-primary/10 px-8 py-6 text-lg"
              >
                Ver Como Funciona
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative">
        <div className="absolute inset-0 cyber-grid opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Por que usar <span className="text-primary text-glow">OSINT Light</span>?
            </h2>
            <p className="text-xl text-muted-foreground">
              Tecnologia de ponta para pesquisas éticas e legais
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Zap,
                title: 'Rápido',
                description: 'Resultados em 30 segundos. Nossa IA processa múltiplas fontes simultaneamente.',
              },
              {
                icon: Shield,
                title: 'Seguro & Legal',
                description: 'Apenas dados públicos. Conforme LGPD. Sem acesso a informações privadas.',
              },
              {
                icon: Eye,
                title: 'Transparente',
                description: 'Todas as fontes são mostradas. Você sabe exatamente de onde vêm as informações.',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="glass p-8 rounded-xl text-center group"
              >
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center group-hover:animate-glow-pulse">
                  <feature.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Escolha seu <span className="text-primary text-glow">Plano</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Pague apenas pelo que precisa. Sem assinaturas.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <PricingCard key={index} {...plan} onClick={() => window.location.href = '/search'} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Pronto para começar?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Faça sua primeira pesquisa agora e descubra informações públicas em segundos
            </p>
            <Link to="/search">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-bold px-12 py-7 text-xl animate-glow-pulse"
              >
                Iniciar Pesquisa - R$ 4,90
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-muted-foreground">
              © 2025 OSINT Light. Todos os direitos reservados.
            </p>
            <div className="flex gap-6">
              <Link to="/termos" className="text-muted-foreground hover:text-primary transition-colors">
                Termos de Uso
              </Link>
              <Link to="/privacidade" className="text-muted-foreground hover:text-primary transition-colors">
                Privacidade
              </Link>
              <a href="mailto:contato@osintlight.com" className="text-muted-foreground hover:text-primary transition-colors">
                Contato
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
