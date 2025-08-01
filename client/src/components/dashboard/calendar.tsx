import { useState, useEffect } from "react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plus, Clock, MapPin, Users, AlertTriangle, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  type: 'audiencia' | 'reuniao' | 'prazo' | 'consulta' | 'outro';
  priority: 'alta' | 'media' | 'baixa';
  location?: string;
  participants?: string[];
  clientId?: string;
}

export default function Calendar() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    type: 'reuniao',
    priority: 'media',
    date: new Date(),
    time: '09:00'
  });
  const { toast } = useToast();

  useEffect(() => {
    // Simular dados de eventos
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Audiência - Processo Civil',
        description: 'Audiência de conciliação',
        date: new Date(),
        time: '10:00',
        type: 'audiencia',
        priority: 'alta',
        location: 'Fórum Central - Sala 205',
        participants: ['João Silva', 'Maria Santos']
      },
      {
        id: '2',
        title: 'Reunião com Cliente',
        description: 'Discussão sobre contrato comercial',
        date: new Date(),
        time: '14:30',
        type: 'reuniao',
        priority: 'media',
        location: 'Escritório',
        participants: ['Pedro Costa']
      },
      {
        id: '3',
        title: 'Prazo - Recurso',
        description: 'Prazo para protocolar recurso',
        date: new Date(Date.now() + 86400000), // amanhã
        time: '17:00',
        type: 'prazo',
        priority: 'alta'
      }
    ];
    setEvents(mockEvents);
  }, []);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'audiencia': return FileText;
      case 'reuniao': return Users;
      case 'prazo': return AlertTriangle;
      case 'consulta': return Clock;
      default: return CalendarIcon;
    }
  };

  const getEventColor = (type: string, priority: string) => {
    const colors = {
      audiencia: priority === 'alta' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-red-50 text-red-700 border-red-100',
      reuniao: priority === 'alta' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-blue-50 text-blue-700 border-blue-100',
      prazo: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      consulta: 'bg-green-100 text-green-800 border-green-200',
      outro: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type as keyof typeof colors] || colors.outro;
  };

  const getTodayEvents = () => {
    const today = new Date();
    return events.filter(event => 
      event.date.toDateString() === today.toDateString()
    );
  };

  const getWeekEvents = () => {
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    return events.filter(event => 
      event.date >= weekStart && event.date <= weekEnd
    );
  };

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.date) {
      toast({
        title: "Erro",
        description: "Título e data são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const event: CalendarEvent = {
      id: Date.now().toString(),
      title: newEvent.title!,
      description: newEvent.description || '',
      date: newEvent.date!,
      time: newEvent.time || '09:00',
      type: newEvent.type as CalendarEvent['type'] || 'outro',
      priority: newEvent.priority as CalendarEvent['priority'] || 'media',
      location: newEvent.location,
      participants: newEvent.participants
    };

    setEvents([...events, event]);
    setNewEvent({
      type: 'reuniao',
      priority: 'media',
      date: new Date(),
      time: '09:00'
    });
    setIsEventDialogOpen(false);

    toast({
      title: "Sucesso",
      description: "Evento criado com sucesso"
    });
  };

  const selectedDateEvents = date ? events.filter(event => 
    event.date.toDateString() === date.toDateString()
  ) : [];

  return (
    <Card className="legal-card">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          <span>Calendário Jurídico</span>
        </CardTitle>
        <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Evento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newEvent.title || ''}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Título do evento"
                />
              </div>

              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newEvent.description || ''}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Descrição do evento"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Tipo</Label>
                  <Select value={newEvent.type} onValueChange={(value) => setNewEvent({...newEvent, type: value as CalendarEvent['type']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="audiencia">Audiência</SelectItem>
                      <SelectItem value="reuniao">Reunião</SelectItem>
                      <SelectItem value="prazo">Prazo</SelectItem>
                      <SelectItem value="consulta">Consulta</SelectItem>
                      <SelectItem value="outro">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={newEvent.priority} onValueChange={(value) => setNewEvent({...newEvent, priority: value as CalendarEvent['priority']})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="time">Horário</Label>
                <Input
                  id="time"
                  type="time"
                  value={newEvent.time || ''}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="location">Local</Label>
                <Input
                  id="location"
                  value={newEvent.location || ''}
                  onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                  placeholder="Local do evento"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateEvent}>
                  Criar Evento
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border"
        />

        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span>Compromissos hoje</span>
            <Badge variant="outline">{getTodayEvents().length}</Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span>Esta semana</span>
            <Badge variant="outline">{getWeekEvents().length}</Badge>
          </div>

          {selectedDateEvents.length > 0 && (
            <div className="space-y-2 mt-4">
              <h4 className="font-medium text-sm">
                Eventos para {date?.toLocaleDateString('pt-BR')}:
              </h4>
              {selectedDateEvents.map((event) => {
                const EventIcon = getEventIcon(event.type);
                return (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border ${getEventColor(event.type, event.priority)}`}
                  >
                    <div className="flex items-start space-x-2">
                      <EventIcon className="w-4 h-4 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm">{event.title}</h5>
                          <span className="text-xs">{event.time}</span>
                        </div>
                        {event.description && (
                          <p className="text-xs opacity-80 mt-1">{event.description}</p>
                        )}
                        {event.location && (
                          <div className="flex items-center space-x-1 text-xs opacity-70 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}