import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Wrench, Zap, Phone, MapPin } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

type ServiceType = 'hvac' | 'electrical';
type ServiceStatus = 'pending' | 'in_progress' | 'completed';

interface ServiceOrder {
  id: string;
  osNumber: string;
  client: string;
  phone: string;
  address: string;
  serviceType: ServiceType;
  status: ServiceStatus;
  assignee?: string;
  day: string;
}

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const DUMMY_ORDERS: ServiceOrder[] = [
  {
    id: '1',
    osNumber: 'OS-2025-001',
    client: 'Empresa ABC Ltda',
    phone: '(11) 98765-4321',
    address: 'Av. Paulista, 1000',
    serviceType: 'hvac',
    status: 'pending',
    assignee: 'João Silva',
    day: 'Segunda'
  },
  {
    id: '2',
    osNumber: 'OS-2025-002',
    client: 'Comércio XYZ',
    phone: '(11) 91234-5678',
    address: 'Rua Augusta, 500',
    serviceType: 'electrical',
    status: 'in_progress',
    assignee: 'Maria Santos',
    day: 'Terça'
  },
  {
    id: '3',
    osNumber: 'OS-2025-003',
    client: 'Indústria DEF',
    phone: '(11) 99999-8888',
    address: 'Rod. Anhanguera, km 20',
    serviceType: 'hvac',
    status: 'pending',
    assignee: 'Pedro Costa',
    day: 'Quarta'
  },
];

const KanbanBoard = ({ role }: { role: 'admin' | 'secretary' | 'collaborator' }) => {
  const [orders, setOrders] = useState(DUMMY_ORDERS);
  const canDragDrop = role === 'admin' || role === 'secretary';

  const handleDragEnd = (result: DropResult) => {
    if (!canDragDrop) return;
    if (!result.destination) return;

    const sourceDay = result.source.droppableId;
    const destDay = result.destination.droppableId;
    
    if (sourceDay === destDay) return;

    const newOrders = [...orders];
    const movedOrder = newOrders.find(o => o.id === result.draggableId);
    if (movedOrder) {
      movedOrder.day = destDay;
      setOrders(newOrders);
    }
  };

  const getOrdersByDay = (day: string) => {
    return orders.filter(o => o.day === day);
  };

  const getStatusColor = (status: ServiceStatus) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'in_progress': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'completed': return 'bg-green-500/20 text-green-500 border-green-500/30';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            Agenda da Semana
          </h1>
          <p className="text-muted-foreground">Semana de 06/01/2025 - 11/01/2025</p>
        </div>
        <Button className="shadow-orange">
          <Calendar className="w-4 h-4 mr-2" />
          Reagendar
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {DAYS.map((day) => (
            <Droppable key={day} droppableId={day} isDropDisabled={!canDragDrop}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`space-y-3 ${snapshot.isDraggingOver ? 'bg-accent/10 rounded-lg p-2' : ''}`}
                >
                  <div className="bg-secondary p-3 rounded-lg">
                    <h3 className="font-semibold text-foreground">{day}</h3>
                    <p className="text-xs text-muted-foreground">
                      {getOrdersByDay(day).length} OS(s)
                    </p>
                  </div>

                  <div className="space-y-3 min-h-[400px]">
                    {getOrdersByDay(day).map((order, index) => (
                      <Draggable 
                        key={order.id} 
                        draggableId={order.id} 
                        index={index}
                        isDragDisabled={!canDragDrop}
                      >
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-4 space-y-3 transition-all ${
                              snapshot.isDragging ? 'shadow-cyan-glow rotate-2' : 'hover:shadow-orange'
                            } ${canDragDrop ? 'cursor-move' : ''}`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <p className="font-semibold text-sm">{order.osNumber}</p>
                                <p className="text-xs text-muted-foreground">{order.client}</p>
                              </div>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status === 'pending' && 'Pendente'}
                                {order.status === 'in_progress' && 'Em Andamento'}
                                {order.status === 'completed' && 'Concluído'}
                              </Badge>
                            </div>

                            <div className="space-y-2 text-xs">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {order.phone}
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {order.address}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border">
                              <div className="flex items-center gap-1">
                                {order.serviceType === 'hvac' ? (
                                  <Wrench className="w-4 h-4 text-primary" />
                                ) : (
                                  <Zap className="w-4 h-4 text-accent" />
                                )}
                                <span className="text-xs font-medium">
                                  {order.serviceType === 'hvac' ? 'HVAC-R' : 'Elétrico'}
                                </span>
                              </div>
                              {order.assignee && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <User className="w-3 h-3" />
                                  {order.assignee}
                                </div>
                              )}
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
