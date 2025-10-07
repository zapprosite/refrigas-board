import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Photo = {
  id: string;
  os_id: string;
  storage_path: string;
  created_at: string;
};

export const usePhotos = (osId: string | null) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const fetchPhotos = async () => {
    if (!osId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .eq('os_id', osId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPhotos(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar fotos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadPhoto = async (file: File) => {
    if (!osId) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${osId}/${Date.now()}.${fileExt}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Insert record
      const { error: insertError } = await supabase
        .from('photos')
        .insert({ os_id: osId, storage_path: fileName });

      if (insertError) throw insertError;

      toast({
        title: 'Foto enviada',
        description: 'A foto foi adicionada com sucesso.',
      });

      await fetchPhotos();
    } catch (error: any) {
      toast({
        title: 'Erro ao enviar foto',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const getPhotoUrl = async (path: string) => {
    try {
      const { data } = await supabase.storage
        .from('photos')
        .createSignedUrl(path, 3600); // 1 hour expiry

      return data?.signedUrl || null;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    fetchPhotos();

    if (!osId) return;

    // Realtime subscription
    const channel = supabase
      .channel('photos_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'photos',
          filter: `os_id=eq.${osId}`,
        },
        () => fetchPhotos()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [osId]);

  return {
    photos,
    loading,
    uploading,
    uploadPhoto,
    getPhotoUrl,
    refetch: fetchPhotos,
  };
};
