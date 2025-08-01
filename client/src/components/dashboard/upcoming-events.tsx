
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, User, MapPin, ArrowRight } from "lucide-react";
import { format, isToday, isTomorrow, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface UpcomingEvent {
  id: string;
  title: string;
  client: string;
  time: string;
  date: Date;
  location?: string;
  priority: 'baixa' | 'media' | 'alta' | 'urgente';
  type: 'audiencia' | 'reuniao' | 'prazo' | 'outros';
}

export default function UpcomingEvents() {
  const { data: events = [], isLoading } = useQuery<UpcomingEvent[]>({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      // Mock data - substituir pela chamada real da API
      const today = new Date();
      return [
        {
          id: "1",
          title: "Audiência - Processo Civil",
          client: "Empresa XYZ Ltda",
          time: "09:00",
          date: addDays(today, 1),
          location: "Tribunal de Justiça - Sala 101",
          priority: "urgente",
          type: "audiencia"
        },
        {
          id: "2",
          title: "Reunião com Cliente",
          client: "João da Silva",
          time: "14:30",
          date: addDays(today, 2),
          location: "Escritório",
          priority: "media",
          type: "reuniao"
        },
        {
          id: "3",
          title: "Prazo de Entrega",
          client: "Maria Santos",
          time: "17:00",
          date: addDays(today, 3),
          priority: "alta",
          type: "prazo"
        },
        {
          id: "4",
          title: "Consulta Jurídica",
          client: "Pedro Oliveira",
          time: "10:00",
          date: addDays(today, 5),
          location: "Escritório",
          priority: "media",
          type: "reuniao"
        }
      ];
    }
  });

  const getPriorityColor = (priority: string) => {
    const colors = {
      baixa: "bg-green-100 text-green-800 border-green-200",
      media: "bg-blue-100 text-blue-800 border-blue-200",
      alta: "bg-orange-100 text-orange-800 border-orange-200",
      urgente: "bg-red-100 text-red-800 border-red-200"
    };
    return colors[priority as keyof typeof colors] || colors.media;
  };

  const getEventTypeIcon = (type: string) => {
    const icons = {
      audiencia: "⚖️",
      reuniao: "👥",
      prazo: "⏰",
      outros: "📋"
    };
    return icons[type as keyof typeof icons] || icons.outros;
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return "Hoje";
    if (isTomorrow(date)) return "Amanhã";
    return format(date, 'dd/MM', { locale: ptBR });
  };

  if (isLoading) {
    return (
      <Card className="legal-card">
        <CardHeader>
          <CardTitle>Próximos Compromissos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-4 p-4 bg-gray-100 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="legal-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span>Próximos Compromissos</span>
          </CardTitle>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            Ver calendário
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum compromisso agendado</p>
              <Button variant="outline" size="sm" className="mt-2">
                Agendar compromisso
              </Button>
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="group hover:bg-blue-50 rounded-lg transition-colors">
                <div className="flex items-center space-x-4 p-4">
                  <div className="flex-shrink-0">
                    <div className={`
                      w-12 h-12 rounded-lg flex flex-col items-center justify-center text-white font-bold
                      ${event.priority === 'urgente' ? 'bg-red-500' : 
                        event.priority === 'alta' ? 'bg-orange-500' :
                        event.priority === 'media' ? 'bg-blue-500' : 'bg-green-500'}
                    `}>
                      <span className="text-xs">{format(event.date, 'MMM', { locale: ptBR }).toUpperCase()}</span>
                      <span className="text-lg">{format(event.date, 'd')}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-lg">{getEventTypeIcon(event.type)}</span>
                      <h4 className="font-semibold text-gray-900 truncate">{event.title}</h4>
                      <Badge className={getPriorityColor(event.priority)}>
                        {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-4 text-xs text-gray-600">
                        <div className="flex items-center space-x-1">
                          <User className="w-3 h-3" />
                          <span>{event.client}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{event.time}</span>
                        </div>
                      </div>
                      
                      {event.location && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {events.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>Próximos {events.length} compromissos</span>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                Ver todos
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
