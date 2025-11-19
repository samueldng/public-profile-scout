import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { Search, Shield } from 'lucide-react';

export const Header = () => {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-xl">
              <Shield className="w-8 h-8 text-primary" />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                OSINT Light
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-foreground hover:text-primary transition-colors">
                Início
              </Link>
              <Link to="/search" className="text-foreground hover:text-primary transition-colors">
                Pesquisar
              </Link>
              <Link to="/como-funciona" className="text-foreground hover:text-primary transition-colors">
                Como Funciona
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <NotificationCenter />
          </div>
        </div>
      </div>
    </header>
  );
};