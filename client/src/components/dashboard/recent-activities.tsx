import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle, AlertTriangle, UserPlus } from "lucide-react";

export default function RecentActivities() {
  const activities = [
    {
      id: 1,
      type: "contract",
      title: "Novo contrato criado",
      description: "Cliente: Tech Solutions Ltda",
      time: "há 2 horas",
      icon: FileText,
      iconBg: "bg-blue-100",
      iconColor: "text-primary",
    },
    {
      id: 2,
      type: "payment",
      title: "Pagamento recebido",
      description: "R$ 5.500,00 - Silva & Associados",
      time: "há 4 horas",
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-accent",
    },
    {
      id: 3,
      type: "deadline",
      title: "Prazo próximo do vencimento",
      description: "Processo 2024/001 - vence em 3 dias",
      time: "há 6 horas",
      icon: AlertTriangle,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      id: 4,
      type: "client",
      title: "Novo cliente cadastrado",
      description: "Construtora ABC Ltda",
      time: "ontem",
      icon: UserPlus,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <Card className="legal-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Atividades Recentes</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            Ver todas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${activity.iconBg}`}>
                <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.description}</p>
                <p className="text-xs text-gray-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
