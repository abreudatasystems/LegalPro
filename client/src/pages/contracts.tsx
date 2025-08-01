
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import ContractBuilder from "@/components/contracts/contract-builder";
import TemplateManager from "@/components/contracts/template-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Edit,
  Trash2,
  Copy,
  Send,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  User,
  Building,
  Gavel,
  BarChart3,
  TrendingUp
} from "lucide-react";
import type { Contract, ContractTemplate } from "@/db/schema";

export default function Contracts() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isTemplateManagerOpen, setIsTemplateManagerOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Acesso Negado",
        description: "Você não está autenticado. Redirecionando...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: contracts = [], isLoading: contractsLoading } = useQuery<Contract[]>({
    queryKey: ["/api/contracts"],
  });

  const { data: templates = [] } = useQuery<ContractTemplate[]>({
    queryKey: ["/api/contract-templates"],
  });

  const deleteContractMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/contracts/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Falha ao excluir contrato");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      toast({
        title: "Sucesso",
        description: "Contrato excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir contrato. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.clientName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || contract.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const contractStats = {
    total: contracts.length,
    active: contracts.filter(c => c.status === 'active').length,
    draft: contracts.filter(c => c.status === 'draft').length,
    expired: contracts.filter(c => c.status === 'expired').length,
    pending: contracts.filter(c => c.status === 'pending').length
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'draft': return Edit;
      case 'pending': return Clock;
      case 'expired': return AlertTriangle;
      default: return FileText;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'expired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'draft': return 'Rascunho';
      case 'pending': return 'Pendente';
      case 'expired': return 'Expirado';
      default: return 'Desconhecido';
    }
  };

  if (isLoading) {
    return (
      <div className="legal-container min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-shimmer w-16 h-16 rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando sistema de contratos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen legal-container">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Contratos & Minutas" 
          subtitle="Gerencie contratos jurídicos com templates inteligentes e cláusulas personalizadas"
          action={
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline" 
                className="legal-button-secondary"
                onClick={() => setIsTemplateManagerOpen(true)}
              >
                <Building className="w-4 h-4 mr-2" />
                Templates
              </Button>
              <Button variant="outline" className="legal-button-secondary">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
                <DialogTrigger asChild>
                  <Button className="legal-button-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Contrato
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-6xl max-h-[90vh]">
                  <DialogHeader>
                    <DialogTitle className="legal-gradient-text flex items-center">
                      <Gavel className="w-6 h-6 mr-2" />
                      Criar Novo Contrato
                    </DialogTitle>
                  </DialogHeader>
                  <ContractBuilder onClose={() => setIsBuilderOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          }
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Cards de estatísticas */}
            <div className="grid gap-6 md:grid-cols-5">
              <Card className="legal-card legal-hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Total</p>
                      <p className="text-2xl font-bold legal-gradient-text">{contractStats.total}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="legal-card legal-hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Ativos</p>
                      <p className="text-2xl font-bold text-green-600">{contractStats.active}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="legal-card legal-hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Rascunhos</p>
                      <p className="text-2xl font-bold text-gray-600">{contractStats.draft}</p>
                    </div>
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Edit className="w-5 h-5 text-gray-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="legal-card legal-hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Pendentes</p>
                      <p className="text-2xl font-bold text-yellow-600">{contractStats.pending}</p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="legal-card legal-hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Templates</p>
                      <p className="text-2xl font-bold text-purple-600">{templates.length}</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Building className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros e busca */}
            <Card className="legal-card">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar contratos por título ou cliente..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="legal-input pl-10"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 legal-input">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Ativos</SelectItem>
                        <SelectItem value="draft">Rascunhos</SelectItem>
                        <SelectItem value="pending">Pendentes</SelectItem>
                        <SelectItem value="expired">Expirados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de contratos */}
            <div className="space-y-6">
              <h2 className="legal-section-title">
                <FileText className="w-6 h-6 text-blue-600" />
                Contratos Recentes
              </h2>

              {contractsLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="legal-card">
                      <CardContent className="p-6">
                        <div className="loading-shimmer h-48 rounded-lg"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredContracts.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredContracts.map((contract) => {
                    const StatusIcon = getStatusIcon(contract.status);
                    return (
                      <Card key={contract.id} className="legal-card legal-hover-lift group">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-3">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                                <FileText className="w-6 h-6" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                  {contract.title}
                                </h3>
                                <Badge className={`${getStatusColor(contract.status)} border`}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {getStatusLabel(contract.status)}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                              <Button size="sm" variant="ghost" title="Visualizar">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" title="Editar">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" title="Duplicar">
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-3 text-sm text-gray-600">
                            {contract.clientName && (
                              <div className="flex items-center">
                                <User className="w-4 h-4 mr-2" />
                                <span className="truncate">{contract.clientName}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>Criado em {new Date(contract.createdAt).toLocaleDateString('pt-BR')}</span>
                            </div>
                            
                            {contract.value && (
                              <div className="flex items-center">
                                <BarChart3 className="w-4 h-4 mr-2" />
                                <span>R$ {contract.value.toLocaleString('pt-BR')}</span>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                              <div className="flex space-x-2">
                                <Button size="sm" className="legal-button-primary">
                                  <Eye className="w-3 h-3 mr-1" />
                                  Abrir
                                </Button>
                                <Button size="sm" variant="outline">
                                  <Send className="w-3 h-3 mr-1" />
                                  Enviar
                                </Button>
                              </div>
                              
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => deleteContractMutation.mutate(contract.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="legal-card">
                  <CardContent className="p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum contrato encontrado</h3>
                    <p className="text-gray-600 mb-6">
                      {searchTerm ? 'Nenhum contrato corresponde aos filtros aplicados.' : 'Comece criando seu primeiro contrato.'}
                    </p>
                    <Button 
                      className="legal-button-primary"
                      onClick={() => setIsBuilderOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Contrato
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Template Manager Dialog */}
      <Dialog open={isTemplateManagerOpen} onOpenChange={setIsTemplateManagerOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="legal-gradient-text flex items-center">
              <Building className="w-6 h-6 mr-2" />
              Gerenciar Templates
            </DialogTitle>
          </DialogHeader>
          <TemplateManager />
        </DialogContent>
      </Dialog>
    </div>
  );
}
