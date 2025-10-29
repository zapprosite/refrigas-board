import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  CheckCircle2, 
  Circle, 
  Upload, 
  Camera, 
  FileText,
  Loader2
} from "lucide-react";
import { useServiceOrders } from "@/hooks/useServiceOrders";
import { useChecklists } from "@/hooks/useChecklists";
import { usePhotos } from "@/hooks/usePhotos";
import { ServiceOrderCard } from "@/components/ServiceOrderCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CollaboratorView = () => {
  const { orders, loading: ordersLoading } = useServiceOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [report, setReport] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const { materials, processes, loading: checklistsLoading, toggleMaterial, toggleProcess } = useChecklists(selectedOrderId);
  const { photos, uploading, uploadPhoto, getPhotoUrl } = usePhotos(selectedOrderId);

  // Select first order by default
  useEffect(() => {
    if (orders.length > 0 && !selectedOrderId) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders, selectedOrderId]);

  // Load existing report
  useEffect(() => {
    const loadReport = async () => {
      if (!selectedOrderId) return;

      try {
        const { data, error } = await supabase
          .from('reports')
          .select('content')
          .eq('os_id', selectedOrderId)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;
        setReport(data?.content || '');
      } catch (err: unknown) {
          // Narrow unknown to Error when possible
          const msg = err instanceof Error ? err.message : String(err);
          console.error('Error loading report:', msg);
        }
    };

    loadReport();
  }, [selectedOrderId]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await uploadPhoto(file);
    e.target.value = ''; // Reset input
  };

  const handleSaveReport = async () => {
    if (!selectedOrderId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('reports')
        .upsert({
          os_id: selectedOrderId,
          content: report,
        });

      if (error) throw error;

      toast({
        title: 'Laudo salvo',
        description: 'O laudo técnico foi salvo com sucesso.',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: 'Erro ao salvar laudo',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const selectedOrder = orders.find(o => o.id === selectedOrderId);
  const allMaterialsComplete = materials.length > 0 && materials.every(m => m.done);
  const allProcessesComplete = processes.length > 0 && processes.every(p => p.done);

  if (ordersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Carregando ordens de serviço...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Nenhuma ordem de serviço disponível.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 space-y-4 max-w-2xl mx-auto">
      {/* Order Selection */}
      {orders.length > 1 && (
        <Card className="p-4">
          <label className="text-sm font-medium mb-2 block">Selecione a OS:</label>
          <select
            value={selectedOrderId || ''}
            onChange={(e) => setSelectedOrderId(e.target.value)}
            className="w-full p-2 rounded-md bg-background border border-input text-foreground"
          >
            {orders.map(order => (
              <option key={order.id} value={order.id}>
                {order.os_number} - {order.clients?.name}
              </option>
            ))}
          </select>
        </Card>
      )}

      {/* Selected Order Info */}
      {selectedOrder && (
        <ServiceOrderCard order={selectedOrder} />
      )}

      {/* Materials Checklist */}
      <Card className={`p-4 space-y-4 transition-all ${
        allMaterialsComplete ? 'shadow-cyan-glow border-accent' : 'shadow-orange'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            {allMaterialsComplete ? (
              <CheckCircle2 className="w-5 h-5 text-accent" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
            Materiais
          </h3>
          <span className="text-xs text-muted-foreground">
            {materials.filter(m => m.done).length} / {materials.length}
          </span>
        </div>

        {checklistsLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : materials.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum material registrado.</p>
        ) : (
          <div className="space-y-3">
            {materials.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <Checkbox 
                  checked={item.done}
                  onCheckedChange={() => toggleMaterial(item.id, item.done)}
                  className="border-border"
                />
                <label className={`flex-1 text-sm cursor-pointer ${
                  item.done ? 'line-through text-muted-foreground' : 'text-card-foreground'
                }`}>
                  {item.item}
                </label>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Processes Checklist */}
      <Card className={`p-4 space-y-4 transition-all ${
        allProcessesComplete ? 'shadow-cyan-glow border-accent' : 'shadow-orange'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            {allProcessesComplete ? (
              <CheckCircle2 className="w-5 h-5 text-accent" />
            ) : (
              <Circle className="w-5 h-5 text-muted-foreground" />
            )}
            Processos
          </h3>
          <span className="text-xs text-muted-foreground">
            {processes.filter(p => p.done).length} / {processes.length}
          </span>
        </div>

        {checklistsLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : processes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum processo registrado.</p>
        ) : (
          <div className="space-y-3">
            {processes.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <Checkbox 
                  checked={item.done}
                  onCheckedChange={() => toggleProcess(item.id, item.done)}
                  className="border-border"
                />
                <label className={`flex-1 text-sm cursor-pointer ${
                  item.done ? 'line-through text-muted-foreground' : 'text-card-foreground'
                }`}>
                  {item.step}
                </label>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Photo Upload */}
      <Card className="p-4 space-y-4 shadow-orange">
        <h3 className="font-semibold flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Fotos do Serviço
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo) => (
            <div key={photo.id} className="aspect-square bg-muted rounded-lg overflow-hidden">
              <PhotoPreview path={photo.storage_path} getPhotoUrl={getPhotoUrl} />
            </div>
          ))}
          <label className="aspect-square flex flex-col gap-2 items-center justify-center border-2 border-dashed border-input rounded-lg cursor-pointer hover:border-primary transition-colors">
            <Input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploading}
              className="hidden"
            />
            {uploading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
              <>
                <Upload className="w-6 h-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Adicionar</span>
              </>
            )}
          </label>
        </div>

        <p className="text-xs text-muted-foreground">
          {photos.length} foto(s) adicionada(s)
        </p>
      </Card>

      {/* Technical Report */}
      <Card className="p-4 space-y-4 shadow-orange">
        <h3 className="font-semibold flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Laudo Técnico
        </h3>

        <Textarea
          placeholder="Descreva os serviços realizados, condições encontradas e recomendações..."
          value={report}
          onChange={(e) => setReport(e.target.value)}
          className="min-h-[200px] resize-none"
        />

        <Button 
          className="w-full shadow-orange"
          onClick={handleSaveReport}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar Laudo'
          )}
        </Button>
      </Card>
    </div>
  );
};

// Helper component for photo preview
const PhotoPreview = ({ 
  path, 
  getPhotoUrl 
}: { 
  path: string; 
  getPhotoUrl: (path: string) => Promise<string | null> 
}) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    // include getPhotoUrl in deps to avoid stale closure if function changes
    getPhotoUrl(path).then(setUrl);
  }, [path, getPhotoUrl]);

  if (!url) {
    return <div className="w-full h-full bg-muted animate-pulse" />;
  }

  return (
    <img 
      src={url} 
      alt="Service photo" 
      className="w-full h-full object-cover"
    />
  );
};

export default CollaboratorView;
