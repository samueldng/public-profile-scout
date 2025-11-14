import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { ArrowRight, Search, Database, Shield, FileText, Users } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: Search,
      title: '1. Coleta de Informações',
      description: 'Você fornece o nome completo da pessoa que deseja pesquisar. Opcionalmente, pode incluir username, cidade ou uma foto.',
      details: [
        'Nome completo (obrigatório)',
        'Username em redes sociais (opcional)',
        'Cidade de localização (opcional)',
        'Foto para busca reversa (opcional)'
      ]
    },
    {
      icon: Database,
      title: '2. Busca em Fontes Públicas',
      description: 'Nosso sistema realiza buscas automatizadas em múltiplas plataformas de redes sociais e sites públicos.',
      details: [
        'LinkedIn, GitHub, Instagram',
        'Google, DuckDuckGo',
        'Sites de portfólio pessoal',
        'Registros públicos disponíveis'
      ]
    },
    {
      icon: FileText,
      title: '3. Análise e Correlação',
      description: 'A inteligência artificial analisa e correlaciona todas as informações encontradas para criar um perfil coerente.',
      details: [
        'Identificação de perfis duplicados',
        'Verificação de consistência das informações',
        'Detecção de possíveis inconsistências',
        'Organização estruturada dos dados'
      ]
    },
    {
      icon: Users,
      title: '4. Relatório Detalhado',
      description: 'Você recebe um relatório completo com todas as informações encontradas, organizadas por categorias.',
      details: [
        'Perfis de redes sociais identificados',
        'Informações de contato públicas',
        'Localizações registradas',
        'Projetos e interesses identificados'
      ]
    }
  ];

  const benefits = [
    {
      icon: Shield,
      title: 'Totalmente Legal',
      description: 'Apenas dados públicos coletados de forma ética e conforme a LGPD.'
    },
    {
      icon: Search,
      title: 'Preciso e Rápido',
      description: 'Resultados em até 30 segundos com alta precisão nas informações.'
    },
    {
      icon: FileText,
      title: 'Relatórios Profissionais',
      description: 'Formatos HTML e PDF para fácil compartilhamento e arquivamento.'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <Badge className="mb-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
            Como Funciona
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-glow bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Nosso Processo OSINT
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Entenda como nossa tecnologia coleta, analisa e organiza informações públicas de forma ética e legal
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="grid gap-8 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <Card className="glass p-6 md:p-8 border-border">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                      <step.icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-2xl font-bold text-foreground mb-3">{step.title}</h3>
                    <p className="text-muted-foreground mb-4">{step.description}</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start">
                          <ArrowRight className="w-4 h-4 text-primary mt-1 mr-2 flex-shrink-0" />
                          <span className="text-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Benefícios da Nossa Abordagem
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="glass p-6 text-center border-border">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto mb-4">
                  <benefit.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Card className="glass p-8 md:p-12 max-w-3xl mx-auto border-border">
            <h2 className="text-3xl font-bold mb-4 text-foreground">
              Pronto para experimentar?
            </h2>
            <p className="text-muted-foreground mb-6 text-lg">
              Faça sua primeira pesquisa agora e veja como é fácil obter informações públicas de forma ética
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/search">
                <Button size="lg" className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground px-8 py-6">
                  Fazer Pesquisa Agora
                </Button>
              </Link>
              <Link to="/">
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 px-8 py-6">
                  Voltar para Home
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default HowItWorks;