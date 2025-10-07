import { useState, useEffect } from 'react';
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

  const fetchChecklists = async () => {
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
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar checklists',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar material',
        description: error.message,
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
    } catch (error: any) {
      toast({
        title: 'Erro ao atualizar processo',
        description: error.message,
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
      supabase.removeChannel(channel);
    };
  }, [osId]);

  return {
    materials,
    processes,
    loading,
    toggleMaterial,
    toggleProcess,
    refetch: fetchChecklists,
  };
};
