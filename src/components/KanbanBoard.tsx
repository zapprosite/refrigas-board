import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, Wrench, Zap, Phone, MapPin } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useServiceOrders } from "@/hooks/useServiceOrders";

const DAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const KanbanBoard = ({ role }: { role: 'Admin' | 'Secretary' | 'Collaborator' }) => {
  const { orders, loading, updateOrderDay } = useServiceOrders();
  const canDragDrop = role === 'Admin' || role === 'Secretary';

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-muted-foreground">Carregando ordens de serviço...</p>
      </div>
    );
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!canDragDrop) return;
    if (!result.destination) return;

    const destDay = result.destination.droppableId;
    const orderId = result.draggableId;

    await updateOrderDay(orderId, destDay);
  };

  const getOrdersByDay = (day: string) => {
    return orders.filter(o => o.day === day);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'yellow': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'blue': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'green': return 'bg-green-500/20 text-green-500 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'yellow': return 'Pendente';
      case 'blue': return 'Em Andamento';
      case 'green': return 'Concluído';
      default: return status;
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
                                <p className="font-semibold text-sm">{order.os_number}</p>
                                <p className="text-xs text-muted-foreground">{order.clients?.name}</p>
                              </div>
                              <Badge className={getStatusColor(order.status)}>
                                {getStatusLabel(order.status)}
                              </Badge>
                            </div>

                            <div className="space-y-2 text-xs">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                {order.clients?.phone || 'N/A'}
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                {order.clients?.address || 'N/A'}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-border">
                              <div className="flex items-center gap-1">
                                {order.type === 'HVAC-R' ? (
                                  <Wrench className="w-4 h-4 text-primary" />
                                ) : (
                                  <Zap className="w-4 h-4 text-accent" />
                                )}
                                <span className="text-xs font-medium">
                                  {order.type}
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
