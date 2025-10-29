import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ChecklistItem = {
  id: string;
  os_id: string;
  item?: string;
  step?: string;
  done: boolean;
};

export const useChecklists = (osId: string | null) => {
  const [materials, setMaterials] = useState<ChecklistItem[]>([]);
  const [processes, setProcesses] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchChecklists = useCallback(async () => {
    if (!osId) {
      setLoading(false);
      return;
    }

    try {
      const [materialsRes, processesRes] = await Promise.all([
        supabase
          .from('materials_checklist')
          .select('*')
          .eq('os_id', osId)
          .order('created_at', { ascending: true }),
        supabase
          .from('processes_checklist')
          .select('*')
          .eq('os_id', osId)
          .order('created_at', { ascending: true }),
      ]);

      if (materialsRes.error) throw materialsRes.error;
      if (processesRes.error) throw processesRes.error;

      setMaterials(materialsRes.data || []);
      setProcesses(processesRes.data || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Erro ao carregar checklists',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [osId, toast]);

  const toggleMaterial = async (id: string, currentDone: boolean) => {
    try {
      const { error } = await supabase
        .from('materials_checklist')
        .update({ done: !currentDone })
        .eq('id', id);

      if (error) throw error;

      setMaterials(prev =>
        prev.map(item =>
          item.id === id ? { ...item, done: !currentDone } : item
        )
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Erro ao atualizar material',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const toggleProcess = async (id: string, currentDone: boolean) => {
    try {
      const { error } = await supabase
        .from('processes_checklist')
        .update({ done: !currentDone })
        .eq('id', id);

      if (error) throw error;

      setProcesses(prev =>
        prev.map(item =>
          item.id === id ? { ...item, done: !currentDone } : item
        )
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Erro ao atualizar processo',
        description: message,
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
  fetchChecklists();

    if (!osId) return;

    // Realtime subscription
    const channel = supabase
      .channel('checklists_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'materials_checklist',
          filter: `os_id=eq.${osId}`,
        },
        () => fetchChecklists()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'processes_checklist',
          filter: `os_id=eq.${osId}`,
        },
        () => fetchChecklists()
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
        try { supabase.removeChannel(channel); } catch (e2) { console.debug('removeChannel failed', e2); }
      }
    };
  }, [fetchChecklists, osId]);

  return {
    materials,
    processes,
    loading,
    toggleMaterial,
    toggleProcess,
    refetch: fetchChecklists,
  };
};
