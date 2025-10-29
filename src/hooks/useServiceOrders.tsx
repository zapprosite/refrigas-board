import { useState, useEffect, useCallback } from 'react';
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

// TODO: Set to false after migration and seed data are applied
const MOCK_MODE = false;

const MOCK_ORDERS: ServiceOrder[] = [
  {
    id: '1',
    os_number: 'OS-2025-001',
    client_id: 'client1',
    day: 'Segunda',
    status: 'todo',
    type: 'HVAC-R',
    assignee: 'João Silva',
    clients: {
      name: 'Empresa ABC Ltda',
      phone: '(11) 98765-4321',
      address: 'Av. Paulista, 1000'
    }
  },
  {
    id: '2',
    os_number: 'OS-2025-002',
    client_id: 'client2',
    day: 'Terça',
    status: 'doing',
    type: 'Electrical',
    assignee: 'Maria Santos',
    clients: {
      name: 'Comércio XYZ',
      phone: '(11) 91234-5678',
      address: 'Rua Augusta, 500'
    }
  },
  {
    id: '3',
    os_number: 'OS-2025-003',
    client_id: 'client3',
    day: 'Quarta',
    status: 'todo',
    type: 'HVAC-R',
    assignee: 'Pedro Costa',
    clients: {
      name: 'Indústria DEF',
      phone: '(11) 99999-8888',
      address: 'Rod. Anhanguera, km 20'
    }
  },
];

export const useServiceOrders = () => {
  const [orders, setOrders] = useState<ServiceOrder[]>(MOCK_MODE ? MOCK_ORDERS : []);
  const [loading, setLoading] = useState(!MOCK_MODE);
  const { toast } = useToast();

  const fetchOrders = useCallback(async () => {
    if (MOCK_MODE) {
      setOrders(MOCK_ORDERS);
      setLoading(false);
      return;
    }

    try {
      // Fetch service orders with client details
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Erro ao carregar ordens de serviço',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const updateOrderDay = async (orderId: string, newDay: string) => {
    // Optimistic update
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, day: newDay } : order
      )
    );

    if (MOCK_MODE) {
      toast({
        title: 'Ordem reagendada (Mock)',
        description: 'Aplique a migração e defina MOCK_MODE=false para persistir.',
      });
      return;
    }

    try {
      // Update day in database
      const { error } = await supabase
        .from('service_orders')
        .update({ day: newDay })
        .eq('id', orderId);

      if (error) throw error;

      toast({
        title: 'Ordem reagendada',
        description: 'A ordem de serviço foi movida com sucesso.',
      });
    } catch (err: unknown) {
      // Revert optimistic update on error
      const message = err instanceof Error ? err.message : String(err);
      await fetchOrders();
      toast({
        title: 'Erro ao reagendar',
        description: message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
  fetchOrders();

    if (!MOCK_MODE) {
      // Set up realtime subscription for live updates
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
        try {
          const possible = channel as unknown as { unsubscribe?: () => void };
          if (channel && typeof possible.unsubscribe === 'function') {
            possible.unsubscribe();
          } else {
            supabase.removeChannel(channel);
          }
        } catch (e) {
          // best-effort cleanup
          try { supabase.removeChannel(channel); } catch (e2) { console.debug('removeChannel failed', e2); }
        }
      };
    }
  }, [fetchOrders]);

  return { orders, loading, updateOrderDay, refetch: fetchOrders };
};
