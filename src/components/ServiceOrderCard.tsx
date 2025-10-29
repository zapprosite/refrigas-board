import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, User, Wrench, Zap } from "lucide-react";
import type { ServiceOrder } from "@/hooks/useServiceOrders";
import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';

interface ServiceOrderCardProps {
  order: ServiceOrder;
  isDragging?: boolean;
  canDrag?: boolean;
  dragHandleProps?: DraggableProvidedDragHandleProps;
}

const getStatusConfig = (status: string) => {
  // Map DB status values to user-facing labels + styles.
  // Database uses: 'todo', 'doing', 'done', 'green'
  switch (status) {
    case 'todo':
      return {
        label: 'Pendente',
        className: 'bg-status-pending/20 text-status-pending-foreground border-status-pending/30'
      };
    case 'doing':
      return {
        label: 'Em Andamento',
        className: 'bg-status-in-progress/20 text-status-in-progress-foreground border-status-in-progress/30'
      };
    case 'done':
      return {
        label: 'Concluído',
        className: 'bg-status-completed/20 text-status-completed-foreground border-status-completed/30'
      };
    case 'green':
      return {
        label: 'Finalizado',
        className: 'bg-status-final/20 text-status-final-foreground border-status-final/30'
      };
    default:
      return {
        label: status,
        className: 'bg-muted text-muted-foreground border-border'
      };
  }
};

export const ServiceOrderCard = ({
  order,
  isDragging = false,
  canDrag = false,
  dragHandleProps,
}: ServiceOrderCardProps) => {
  const statusConfig = getStatusConfig(order.status);

  return (
    <Card
      {...dragHandleProps}
      className={`p-4 space-y-3 transition-all ${
        isDragging ? 'shadow-cyan-glow rotate-2' : 'hover:shadow-orange'
      } ${canDrag ? 'cursor-move' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="font-semibold text-sm text-card-foreground">{order.os_number}</p>
          <p className="text-xs text-muted-foreground">{order.clients?.name}</p>
        </div>
        <Badge className={statusConfig.className}>
          {statusConfig.label}
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
          <span className="text-xs font-medium text-card-foreground">
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
  );
};
