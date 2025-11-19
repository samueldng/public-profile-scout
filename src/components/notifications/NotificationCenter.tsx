import { useState, useEffect } from 'react';
import { Bell, X, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'search' | 'subscription' | 'completion' | 'realtime';
}

// Real user names for authentic notifications
const userNames = [
  "João Silva", "Maria Santos", "Ana Oliveira", "Pedro Costa", 
  "Carla Souza", "Roberto Lima", "Fernanda Almeida", "Carlos Pereira",
  "Patricia Rocha", "Marcos Fernandes", "Juliana Cardoso", "Ricardo Gomes",
  "Amanda Ribeiro", "Felipe Martins", "Camila Santos", "Bruno Alves",
  "Iara Mendes", "Lucas Barbosa", "Beatriz Costa", "Gabriel Nunes",
  "Renata Alves", "Thiago Rocha", "Larissa Mendes", "Daniel Costa"
];

// Action descriptions for different notification types
const actionDescriptions = [
  { type: 'search', text: 'iniciou uma nova pesquisa', icon: '🔍', color: 'text-blue-500' },
  { type: 'subscription', text: 'assina a pesquisa mensal', icon: '✅', color: 'text-green-500' },
  { type: 'completion', text: 'concluiu uma pesquisa avançada', icon: '🚀', color: 'text-purple-500' },
  { type: 'realtime', text: 'está usando o serviço agora', icon: '🕒', color: 'text-orange-500' }
];

// Time intervals for realistic timing
const timeIntervals = [
  'agora mesmo', 'há 30 segundos', 'há 1 minuto', 'há 2 minutos', 
  'há 5 minutos', 'há 10 minutos', 'há 15 minutos'
];

export const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [floatingNotifications, setFloatingNotifications] = useState<Notification[]>([]);

  // Function to generate a realistic user activity notification
  const generateUserActivityNotification = () => {
    const randomName = userNames[Math.floor(Math.random() * userNames.length)];
    const randomAction = actionDescriptions[Math.floor(Math.random() * actionDescriptions.length)];
    const randomTime = timeIntervals[Math.floor(Math.random() * timeIntervals.length)];
    
    // Weighted distribution for more realistic social proof
    // 40% completion, 30% subscription, 20% search, 10% realtime
    const actionTypes = ['completion', 'completion', 'subscription', 'subscription', 'search', 'search', 'realtime'];
    const selectedType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
    const action = actionDescriptions.find(a => a.type === selectedType) || randomAction;
    
    const notification: Notification = {
      id: `activity-${Date.now()}-${Math.random()}`,
      title: `${randomName} ${action.text}`,
      description: randomTime,
      timestamp: new Date().toISOString(),
      read: false,
      type: action.type as 'search' | 'subscription' | 'completion' | 'realtime'
    };
    
    return notification;
  };

  // Function to generate trust-building notifications
  const generateTrustNotification = () => {
    const trustMessages = [
      { title: "Mais de 1.000 pesquisas realizadas esta semana!", description: "Nossa comunidade cresce a cada dia", icon: "📈" },
      { title: "98% de satisfação dos usuários", description: "Veja o que nossos clientes dizem", icon: "⭐" },
      { title: "Resultados em até 30 segundos", description: "Tecnologia de ponta para pesquisas rápidas", icon: "⚡" },
      { title: "Dados 100% públicos e legais", description: "Conforme a LGPD", icon: "🛡️" }
    ];
    
    const randomMessage = trustMessages[Math.floor(Math.random() * trustMessages.length)];
    
    const notification: Notification = {
      id: `trust-${Date.now()}-${Math.random()}`,
      title: randomMessage.title,
      description: randomMessage.description,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'completion' // Use completion type for trust notifications
    };
    
    return notification;
  };

  useEffect(() => {
    // Fetch recent search jobs to create initial notifications
    const fetchRecentSearches = async () => {
      const { data, error } = await supabase
        .from('search_jobs')
        .select('id, query, plan, status, created_at, completed_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data) {
        const newNotifications: Notification[] = data.map((job: any) => ({
          id: job.id,
          title: job.status === 'completed' ? 'Pesquisa Concluída' : 'Pesquisa Iniciada',
          description: `"${job.query}" ${job.status === 'completed' ? 'foi concluída' : 'está em andamento'}`,
          timestamp: job.completed_at || job.created_at,
          read: false,
          type: job.status === 'completed' ? 'completion' : 'search'
        }));
        setNotifications(newNotifications);
      }
    };

    fetchRecentSearches();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'search_jobs'
        },
        (payload) => {
          const job = payload.new;
          const newNotification: Notification = {
            id: job.id,
            title: 'Nova Pesquisa Iniciada',
            description: `"${job.query}" está sendo pesquisado...`,
            timestamp: job.created_at,
            read: false,
            type: 'search'
          };
          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
          
          // Add to floating notifications for real-time activity
          const floatingNotification: Notification = {
            ...newNotification,
            title: `${userNames[Math.floor(Math.random() * 5)]} iniciou uma nova pesquisa`,
            description: 'agora mesmo'
          };
          setFloatingNotifications(prev => [floatingNotification, ...prev.slice(0, 2)]);
          
          // Auto-remove floating notification after 5 seconds
          setTimeout(() => {
            setFloatingNotifications(prev => prev.filter(n => n.id !== floatingNotification.id));
          }, 5000);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'search_jobs',
          filter: 'status=eq.completed'
        },
        (payload) => {
          const job = payload.new;
          const newNotification: Notification = {
            id: job.id,
            title: 'Pesquisa Concluída',
            description: `"${job.query}" foi pesquisado usando o plano ${job.plan === 'complete' ? 'Completo' : 'Básico'}.`,
            timestamp: job.completed_at,
            read: false,
            type: 'completion'
          };
          setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
          
          // Add to floating notifications for real-time activity
          const floatingNotification: Notification = {
            ...newNotification,
            title: `${userNames[Math.floor(Math.random() * 5)]} concluiu uma pesquisa`,
            description: 'agora mesmo'
          };
          setFloatingNotifications(prev => [floatingNotification, ...prev.slice(0, 2)]);
          
          // Auto-remove floating notification after 5 seconds
          setTimeout(() => {
            setFloatingNotifications(prev => prev.filter(n => n.id !== floatingNotification.id));
          }, 5000);
        }
      )
      .subscribe();

    // Immediately show initial notifications to establish presence
    const initialNotificationsTimer = setTimeout(() => {
      // Show 2 initial notifications to establish presence
      const notification1 = generateUserActivityNotification();
      setFloatingNotifications(prev => [notification1, ...prev.slice(0, 2)]);
      
      setTimeout(() => {
        setFloatingNotifications(prev => prev.filter(n => n.id !== notification1.id));
      }, 5000);
      
      // Show second notification after 1 second
      setTimeout(() => {
        const notification2 = generateUserActivityNotification();
        setFloatingNotifications(prev => [notification2, ...prev.slice(0, 2)]);
        
        setTimeout(() => {
          setFloatingNotifications(prev => prev.filter(n => n.id !== notification2.id));
        }, 5000);
      }, 1000);
    }, 1500);

    // Generate user activity notifications frequently for social proof
    const userActivityInterval = setInterval(() => {
      // 80% chance to show user activity notification
      if (Math.random() > 0.2) {
        const notification = generateUserActivityNotification();
        setFloatingNotifications(prev => [notification, ...prev.slice(0, 2)]);
        
        setTimeout(() => {
          setFloatingNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
      }
    }, 4000);

    // Generate trust-building notifications less frequently
    const trustNotificationInterval = setInterval(() => {
      // 30% chance to show trust notification
      if (Math.random() > 0.7) {
        const notification = generateTrustNotification();
        setFloatingNotifications(prev => [notification, ...prev.slice(0, 2)]);
        
        setTimeout(() => {
          setFloatingNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
      }
    }, 12000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(userActivityInterval);
      clearInterval(trustNotificationInterval);
      clearTimeout(initialNotificationsTimer);
    };
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
  };

  const removeFloatingNotification = (id: string) => {
    setFloatingNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-xs text-white flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </Button>

      {/* Floating Notifications - Strategic positioning for maximum visibility */}
      <div className="fixed bottom-24 right-6 z-50 space-y-3">
        <AnimatePresence>
          {floatingNotifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative"
            >
              <Card className="shadow-xl glass max-w-sm w-80 border-primary/30 bg-gradient-to-br from-background/90 to-primary/10 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground flex items-center gap-2">
                        <span className="text-lg">
                          {actionDescriptions.find(a => a.type === notification.type)?.icon || '🔔'}
                        </span>
                        <span className="leading-tight">{notification.title}</span>
                      </h4>
                      {notification.description && (
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {notification.description}
                        </p>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 ml-2 flex-shrink-0"
                      onClick={() => removeFloatingNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute right-0 mt-2 w-80 z-50"
          >
            <Card className="shadow-xl glass border-primary/30 bg-gradient-to-br from-background/90 to-primary/10 backdrop-blur-sm max-h-[80vh]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-border/50">
                <CardTitle className="text-sm font-medium">Atividade Recente</CardTitle>
                <div className="flex gap-1">
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
                      Marcar todas como lidas
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-80">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      Nenhuma atividade recente
                    </div>
                  ) : (
                    <div className="space-y-1 p-2">
                      {notifications.map((notification) => (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          whileHover={{ x: 5 }}
                          transition={{ duration: 0.2 }}
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                            notification.read 
                              ? 'bg-muted/30 border-border hover:bg-muted/50' 
                              : 'bg-background/50 border-primary/30 shadow-sm hover:shadow-md'
                          }`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm text-foreground flex items-center gap-2">
                              <span>
                                {actionDescriptions.find(a => a.type === notification.type)?.icon || '🔔'}
                              </span>
                              {notification.title}
                            </h4>
                            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {new Date(notification.timestamp).toLocaleString('pt-BR')}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};