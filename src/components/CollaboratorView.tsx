import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle2, 
  Circle, 
  Upload, 
  Camera, 
  FileText,
  Wrench,
  Phone,
  MapPin
} from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
}

interface ServiceOrder {
  id: string;
  osNumber: string;
  client: string;
  phone: string;
  address: string;
  serviceType: 'hvac' | 'electrical';
}

const DUMMY_ORDER: ServiceOrder = {
  id: '1',
  osNumber: 'OS-2025-001',
  client: 'Empresa ABC Ltda',
  phone: '(11) 98765-4321',
  address: 'Av. Paulista, 1000',
  serviceType: 'hvac'
};

const MATERIALS_CHECKLIST: ChecklistItem[] = [
  { id: 'm1', label: 'Gás refrigerante R-410A', completed: false },
  { id: 'm2', label: 'Filtros de ar', completed: false },
  { id: 'm3', label: 'Tubulação de cobre', completed: false },
  { id: 'm4', label: 'Isolamento térmico', completed: false },
  { id: 'm5', label: 'Válvulas de expansão', completed: false },
];

const PROCESSES_CHECKLIST: ChecklistItem[] = [
  { id: 'p1', label: 'Inspeção inicial do sistema', completed: false },
  { id: 'p2', label: 'Verificação de pressão', completed: false },
  { id: 'p3', label: 'Limpeza dos componentes', completed: false },
  { id: 'p4', label: 'Teste de funcionamento', completed: false },
  { id: 'p5', label: 'Verificação final de segurança', completed: false },
];

const CollaboratorView = () => {
  const [materials, setMaterials] = useState(MATERIALS_CHECKLIST);
  const [processes, setProcesses] = useState(PROCESSES_CHECKLIST);
  const [photos, setPhotos] = useState<string[]>([]);
  const [report, setReport] = useState('');

  const toggleMaterial = (id: string) => {
    setMaterials(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const toggleProcess = (id: string) => {
    setProcesses(prev => 
      prev.map(item => 
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const allMaterialsComplete = materials.every(m => m.completed);
  const allProcessesComplete = processes.every(p => p.completed);

  return (
    <div className="min-h-screen p-4 space-y-4 max-w-2xl mx-auto">
      {/* Order Info Card */}
      <Card className="p-4 space-y-3 shadow-orange">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold">{DUMMY_ORDER.osNumber}</h2>
            <p className="text-sm text-muted-foreground">{DUMMY_ORDER.client}</p>
          </div>
          <Badge className="bg-primary text-primary-foreground">
            <Wrench className="w-3 h-3 mr-1" />
            HVAC-R
          </Badge>
        </div>
        
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4" />
            {DUMMY_ORDER.phone}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            {DUMMY_ORDER.address}
          </div>
        </div>
      </Card>

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
            {materials.filter(m => m.completed).length} / {materials.length}
          </span>
        </div>

        <div className="space-y-3">
          {materials.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <Checkbox 
                checked={item.completed}
                onCheckedChange={() => toggleMaterial(item.id)}
                className="border-border"
              />
              <label className={`flex-1 text-sm cursor-pointer ${
                item.completed ? 'line-through text-muted-foreground' : ''
              }`}>
                {item.label}
              </label>
            </div>
          ))}
        </div>
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
            {processes.filter(p => p.completed).length} / {processes.length}
          </span>
        </div>

        <div className="space-y-3">
          {processes.map(item => (
            <div key={item.id} className="flex items-center gap-3">
              <Checkbox 
                checked={item.completed}
                onCheckedChange={() => toggleProcess(item.id)}
                className="border-border"
              />
              <label className={`flex-1 text-sm cursor-pointer ${
                item.completed ? 'line-through text-muted-foreground' : ''
              }`}>
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </Card>

      {/* Photo Upload */}
      <Card className="p-4 space-y-4 shadow-orange">
        <h3 className="font-semibold flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Fotos do Serviço
        </h3>

        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="aspect-square bg-muted rounded-lg" />
          ))}
          <Button 
            variant="outline" 
            className="aspect-square flex flex-col gap-2"
            onClick={() => setPhotos([...photos, 'photo'])}
          >
            <Upload className="w-6 h-6" />
            <span className="text-xs">Adicionar</span>
          </Button>
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

        <Button className="w-full shadow-orange">
          Salvar Laudo
        </Button>
      </Card>
    </div>
  );
};

export default CollaboratorView;
