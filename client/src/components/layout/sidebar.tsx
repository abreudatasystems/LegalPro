
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  FileText,
  FolderOpen,
  Users,
  DollarSign,
  Briefcase,
  Settings,
  Scale,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  Building2,
  UserCheck,
  Truck,
} from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [crmExpanded, setCrmExpanded] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Contratos e Minutas", href: "/contracts", icon: FileText },
    { name: "Gestão Documental", href: "/documents", icon: FolderOpen },
    { 
      name: "CRM", 
      href: "/clients", 
      icon: Users,
      submenu: [
        { name: "Clientes", href: "/clients", icon: Users },
        { name: "Fornecedores", href: "/suppliers", icon: Truck },
        { name: "Funcionários", href: "/employees", icon: UserCheck },
      ]
    },
    { name: "Financeiro", href: "/financial", icon: DollarSign },
    { name: "Projetos", href: "/projects", icon: Briefcase },
    { name: "Configurações", href: "/settings", icon: Settings },
  ];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'lawyer': return 'Advogado';
      case 'assistant': return 'Assistente';
      default: return 'Usuário';
    }
  };

  const isCrmActive = location.includes('/clients') || location.includes('/suppliers') || location.includes('/employees');

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-xl">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-slate-700">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg mr-3">
            <Scale className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            LegalPro
          </h1>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = item.submenu ? isCrmActive : location === item.href;
            const hasSubmenu = item.submenu && item.submenu.length > 0;
            
            return (
              <div key={item.name}>
                {hasSubmenu ? (
                  <button
                    onClick={() => setCrmExpanded(!crmExpanded)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    <div className="flex items-center">
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </div>
                    {crmExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                ) : (
                  <Link href={item.href}>
                    <div className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 cursor-pointer",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                        : "text-slate-300 hover:bg-slate-700 hover:text-white"
                    )}>
                      <item.icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </div>
                  </Link>
                )}
                
                {/* Submenu */}
                {hasSubmenu && crmExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-slate-600 pl-4">
                    {item.submenu.map((subItem) => {
                      const isSubActive = location === subItem.href;
                      return (
                        <Link key={subItem.name} href={subItem.href}>
                          <div className={cn(
                            "flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer",
                            isSubActive
                              ? "bg-blue-500 text-white shadow-md"
                              : "text-slate-400 hover:bg-slate-600 hover:text-white"
                          )}>
                            <subItem.icon className="w-4 h-4 mr-3" />
                            {subItem.name}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-slate-700 p-4">
          <Link href="/profile">
            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-700 transition-all duration-200 cursor-pointer group">
              <Avatar className="w-10 h-10 ring-2 ring-slate-600 group-hover:ring-blue-400 transition-all">
                <AvatarImage 
                  src={user?.profileImageUrl} 
                  alt={`${user?.firstName} ${user?.lastName}`}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <div className="flex items-center mt-1">
                  <Badge variant="secondary" className="text-xs bg-slate-600 text-slate-300">
                    {getRoleLabel(user?.role || '')}
                  </Badge>
                </div>
              </div>
              <MoreVertical className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
