import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface PricingCardProps {
  title: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  onClick?: () => void;
}

export const PricingCard = ({
  title,
  price,
  description,
  features,
  popular,
  onClick,
}: PricingCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05, rotateY: 5 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card
        className={`relative overflow-hidden p-8 glass ${
          popular ? 'neon-border' : ''
        }`}
      >
        {popular && (
          <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
            POPULAR
          </div>
        )}
        
        <h3 className="text-2xl font-bold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
        
        <div className="mb-6">
          <span className="text-5xl font-bold text-primary text-glow">{price}</span>
          <span className="text-muted-foreground ml-2">/ pesquisa</span>
        </div>

        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <motion.li
              key={index}
              className="flex items-start gap-3"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <span className="text-foreground">{feature}</span>
            </motion.li>
          ))}
        </ul>

        <Button
          className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-bold"
          size="lg"
          onClick={onClick}
        >
          Começar Pesquisa
        </Button>
      </Card>
    </motion.div>
  );
};
