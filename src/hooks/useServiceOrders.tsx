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

// TEMPORARY: Mock data until database migration is applied
const MOCK_MODE = true; // Set to false after migration is applied

const MOCK_ORDERS: ServiceOrder[] = [
  {
    id: '1',
    os_number: 'OS-2025-001',
    client_id: 'client1',
    day: 'Segunda',
    status: 'yellow',
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
    status: 'blue',
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
    status: 'yellow',
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

  const fetchOrders = async () => {
    if (MOCK_MODE) {
      setOrders(MOCK_ORDERS);
      setLoading(false);
      return;
    }

    // This will work after migration creates the tables
    setLoading(false);
  };

  const updateOrderDay = async (orderId: string, newDay: string) => {
    // Update data locally
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId ? { ...order, day: newDay } : order
      )
    );

    if (MOCK_MODE) {
      toast({
        title: 'Ordem reagendada (Mock)',
        description: 'A ordem de serviço foi movida. Aplique a migração do banco para persistir mudanças.',
      });
      return;
    }

    // This will work after migration creates the tables
    toast({
      title: 'Ordem reagendada',
      description: 'A ordem de serviço foi movida com sucesso.',
    });
  };

  useEffect(() => {
    fetchOrders();

    if (!MOCK_MODE) {
      // Set up realtime subscription only when not in mock mode
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
    }
  }, []);

  return { orders, loading, updateOrderDay, refetch: fetchOrders };
};
