import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SearchJob {
  id: string;
  query: string;
  plan: string;
  status: string;
  created_at: string;
  completed_at?: string;
}

export const useSearchNotifications = () => {
  useEffect(() => {
    // Subscribe to search job completions
    const channel = supabase
      .channel('search_notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'search_jobs',
          filter: 'status=eq.completed'
        },
        (payload) => {
          const job = payload.new as SearchJob;
          
          // Show notification for completed search
          toast({
            title: 'Nova Pesquisa Concluída! 🔍',
            description: `"${job.query}" foi pesquisado usando o plano ${job.plan === 'complete' ? 'Completo' : 'Básico'}.`,
            duration: 5000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'search_jobs'
        },
        (payload) => {
          const job = payload.new as SearchJob;
          
          // Show notification for new search
          toast({
            title: 'Nova Pesquisa Iniciada! 🚀',
            description: `"${job.query}" está sendo pesquisado...`,
            duration: 3000,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};