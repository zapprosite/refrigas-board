import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useServiceOrders } from "@/hooks/useServiceOrders";
import { ServiceOrderCard } from "@/components/ServiceOrderCard";

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
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <ServiceOrderCard
                              order={order}
                              isDragging={snapshot.isDragging}
                              canDrag={canDragDrop}
                              dragHandleProps={provided.dragHandleProps}
                            />
                          </div>
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
