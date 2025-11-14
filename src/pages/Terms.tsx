import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-8 text-primary text-glow">
            Termos de Uso
          </h1>
          
          <Card className="glass p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Aceitação dos Termos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao utilizar nossa plataforma de pesquisa OSINT (Open Source Intelligence), você
                concorda com estes termos de uso. Se não concordar, não utilize o serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Natureza do Serviço</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nosso serviço coleta APENAS informações públicas disponíveis na internet. Não
                temos acesso e NÃO utilizamos dados sensíveis como CPF, telefone, endereço
                residencial ou informações protegidas por lei.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Uso Proibido</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                É ESTRITAMENTE PROIBIDO utilizar as informações obtidas para:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Assédio, stalking ou perseguição</li>
                <li>Discriminação de qualquer tipo</li>
                <li>Decisões legais, financeiras ou de crédito</li>
                <li>Violação de privacidade ou direitos individuais</li>
                <li>Qualquer atividade ilegal</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Limitações</h2>
              <p className="text-muted-foreground leading-relaxed">
                As informações fornecidas são baseadas em fontes públicas e podem estar
                desatualizadas ou incorretas. Não garantimos 100% de precisão. O usuário deve
                sempre verificar as informações antes de tomar qualquer decisão.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Privacidade e LGPD</h2>
              <p className="text-muted-foreground leading-relaxed">
                Nosso serviço está em conformidade com a LGPD (Lei Geral de Proteção de Dados).
                Mantemos logs anonimizados por 30 dias para segurança. Você pode solicitar a
                exclusão do seu histórico de pesquisas a qualquer momento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Responsabilidade</h2>
              <p className="text-muted-foreground leading-relaxed">
                O usuário é o único responsável pelo uso das informações obtidas. Não nos
                responsabilizamos por danos resultantes do uso inadequado do serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Modificações</h2>
              <p className="text-muted-foreground leading-relaxed">
                Reservamos o direito de modificar estes termos a qualquer momento. O uso
                continuado após mudanças constitui aceitação dos novos termos.
              </p>
            </section>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;
