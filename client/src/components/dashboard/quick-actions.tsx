import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, UserPlus, Briefcase, Receipt } from "lucide-react";
import { Link } from "wouter";

export default function QuickActions() {
  const actions = [
    {
      title: "Novo Contrato",
      icon: FileText,
      iconColor: "text-primary",
      href: "/contracts",
    },
    {
      title: "Adicionar Cliente",
      icon: UserPlus,
      iconColor: "text-accent",
      href: "/clients",
    },
    {
      title: "Novo Projeto",
      icon: Briefcase,
      iconColor: "text-purple-600",
      href: "/projects",
    },
    {
      title: "Emitir Fatura",
      icon: Receipt,
      iconColor: "text-yellow-600",
      href: "/financial",
    },
  ];

  return (
    <Card className="legal-card">
      <CardHeader>
        <CardTitle>Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Button
                variant="outline"
                className="w-full justify-start p-3 h-auto border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <action.icon className={`w-5 h-5 mr-3 ${action.iconColor}`} />
                <span className="text-sm font-medium">{action.title}</span>
              </Button>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
