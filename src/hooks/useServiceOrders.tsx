import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ServiceOrder = {
  id: string;
  os_number: string;
  client_id: string;
  day: string;
  status: string;
  type: string;
  assignee?: string;
  clients?: {
    name: string;
    phone?: string;
    address?: string;
  };
};

export const useServiceOrders = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    try {
      // @ts-expect-error - Tables will be available after migration is applied
      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          *,
          clients (
            name,
            phone,
            address
          )
        `)
        .order('day', { ascending: true });

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar ordens de serviço',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderDay = async (orderId: string, newDay: string) => {
    try {
      // @ts-expect-error - Tables will be available after migration is applied
      const { error } = await supabase
        .from('service_orders')
        // @ts-expect-error - Tables will be available after migration is applied
        .update({ day: newDay })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, day: newDay } : order
        )
      );

      toast({
        title: 'Ordem reagendada',
        description: 'A ordem de serviço foi movida com sucesso.',
      });
    } catch (error: any) {
      toast({
        title: 'Erro ao reagendar',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchOrders();

    // Set up realtime subscription
    const channel = supabase
      .channel('service_orders_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_orders',
        },
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { orders, loading, updateOrderDay, refetch: fetchOrders };
};
