import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold mb-8 text-primary text-glow">
            Política de Privacidade
          </h1>
          
          <Card className="glass p-8 space-y-6">
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">1. Dados Coletados</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Coletamos apenas:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Nome fornecido para pesquisa</li>
                <li>Username/handle (opcional)</li>
                <li>Cidade (opcional)</li>
                <li>Foto enviada para busca reversa (opcional)</li>
                <li>Informações públicas encontradas na internet</li>
                <li>Dados de pagamento (processados pelo Stripe - não armazenamos)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">2. Como Usamos os Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Os dados são utilizados EXCLUSIVAMENTE para realizar a pesquisa solicitada e
                gerar o relatório. Não vendemos, compartilhamos ou utilizamos suas informações
                para outros fins.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">3. Armazenamento</h2>
              <p className="text-muted-foreground leading-relaxed">
                Mantemos logs anonimizados por 30 dias para fins de segurança e prevenção de
                abuso. O histórico de suas pesquisas pode ser acessado e excluído a qualquer
                momento através do seu painel.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">4. Seus Direitos (LGPD)</h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Você tem direito a:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>Acessar seus dados</li>
                <li>Corrigir dados incorretos</li>
                <li>Solicitar exclusão de dados</li>
                <li>Revogar consentimento</li>
                <li>Portabilidade dos dados</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">5. Segurança</h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos criptografia e práticas de segurança modernas para proteger seus
                dados. Todos os relatórios são criptografados e acessíveis apenas por você.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">6. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies essenciais para o funcionamento do serviço. Não utilizamos
                cookies de rastreamento ou publicidade.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">7. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em
                contato através de: privacidade@osintlight.com
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">8. Atualizações</h2>
              <p className="text-muted-foreground leading-relaxed">
                Esta política pode ser atualizada periodicamente. A versão mais recente estará
                sempre disponível nesta página.
              </p>
            </section>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
