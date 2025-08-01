
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "@/components/layout/sidebar";
import TopBar from "@/components/layout/topbar";
import ProjectForm from "@/components/projects/project-form";
import ProjectList from "@/components/projects/project-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { 
  Plus, 
  Briefcase, 
  Search, 
  Filter, 
  Download, 
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  DollarSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Pause,
  Play,
  Target,
  BarChart3,
  TrendingUp,
  Users,
  Activity
} from "lucide-react";
import type { Project } from "@/db/schema";

export default function Projects() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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

  const { data: projects = [], isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Falha ao excluir projeto");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Sucesso",
        description: "Projeto excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir projeto. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    on_hold: projects.filter(p => p.status === 'on_hold').length,
    planning: projects.filter(p => p.status === 'planning').length
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return Play;
      case 'completed': return CheckCircle;
      case 'on_hold': return Pause;
      case 'planning': return Target;
      default: return Briefcase;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'on_hold': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'planning': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'completed': return 'Concluído';
      case 'on_hold': return 'Pausado';
      case 'planning': return 'Planejamento';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  const calculateProgress = (project: Project) => {
    // Simulação de progresso baseado no status e data
    switch (project.status) {
      case 'completed': return 100;
      case 'active': return Math.floor(Math.random() * 60) + 30; // 30-90%
      case 'planning': return Math.floor(Math.random() * 30) + 5; // 5-35%
      case 'on_hold': return Math.floor(Math.random() * 50) + 20; // 20-70%
      default: return 0;
    }
  };

  if (isLoading) {
    return (
      <div className="legal-container min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-shimmer w-16 h-16 rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Carregando gerenciador de projetos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen legal-container">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Gestão de Projetos" 
          subtitle="Organize e acompanhe o progresso dos seus projetos jurídicos"
          action={
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="legal-button-secondary">
                <Download className="w-4 h-4 mr-2" />
                Relatório
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="legal-button-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Projeto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="legal-gradient-text flex items-center">
                      <Briefcase className="w-5 h-5 mr-2" />
                      {selectedProject ? 'Editar Projeto' : 'Novo Projeto'}
                    </DialogTitle>
                  </DialogHeader>
                  <ProjectForm 
                    project={selectedProject} 
                    onSuccess={() => {
                      setIsDialogOpen(false);
                      setSelectedProject(null);
                    }} 
                  />
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
                      <p className="text-2xl font-bold legal-gradient-text">{projectStats.total}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-xs text-green-600">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    <span>+8% este mês</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="legal-card legal-hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Ativos</p>
                      <p className="text-2xl font-bold text-blue-600">{projectStats.active}</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Play className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      Em andamento
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="legal-card legal-hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Concluídos</p>
                      <p className="text-2xl font-bold text-green-600">{projectStats.completed}</p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      Finalizados
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="legal-card legal-hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Pausados</p>
                      <p className="text-2xl font-bold text-yellow-600">{projectStats.on_hold}</p>
                    </div>
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Pause className="w-5 h-5 text-yellow-600" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                      Em espera
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card className="legal-card legal-hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600">Planejamento</p>
                      <p className="text-2xl font-bold text-purple-600">{projectStats.planning}</p>
                    </div>
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Badge className="bg-purple-100 text-purple-800 text-xs">
                      Iniciando
                    </Badge>
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
                      placeholder="Buscar projetos por nome ou descrição..."
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
                        <SelectItem value="completed">Concluídos</SelectItem>
                        <SelectItem value="on_hold">Pausados</SelectItem>
                        <SelectItem value="planning">Planejamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de projetos */}
            <Tabs defaultValue="cards" className="w-full">
              <TabsList className="legal-card">
                <TabsTrigger value="cards">Cards</TabsTrigger>
                <TabsTrigger value="table">Tabela</TabsTrigger>
                <TabsTrigger value="kanban">Kanban</TabsTrigger>
              </TabsList>

              <TabsContent value="cards" className="mt-6">
                {projectsLoading ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <Card key={i} className="legal-card">
                        <CardContent className="p-6">
                          <div className="loading-shimmer h-48 rounded-lg"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredProjects.length > 0 ? (
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredProjects.map((project) => {
                      const StatusIcon = getStatusIcon(project.status);
                      const progress = calculateProgress(project);
                      
                      return (
                        <Card key={project.id} className="legal-card legal-hover-lift group">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-start space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white">
                                  <Briefcase className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                                    {project.name}
                                  </h3>
                                  <Badge className={`${getStatusColor(project.status)} border`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {getStatusLabel(project.status)}
                                  </Badge>
                                </div>
                              </div>
                              
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                <Button size="sm" variant="ghost" title="Visualizar">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  title="Editar"
                                  onClick={() => {
                                    setSelectedProject(project);
                                    setIsDialogOpen(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {project.description && (
                              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {project.description}
                              </p>
                            )}

                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-600">Progresso</span>
                                <span className="font-medium">{progress}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>

                            <div className="mt-4 space-y-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>Criado em {new Date(project.createdAt).toLocaleDateString('pt-BR')}</span>
                              </div>
                              
                              {project.clientId && (
                                <div className="flex items-center">
                                  <User className="w-4 h-4 mr-2" />
                                  <span>Cliente vinculado</span>
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
                                    <Activity className="w-3 h-3 mr-1" />
                                    Atividade
                                  </Button>
                                </div>
                                
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => deleteProjectMutation.mutate(project.id)}
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
                      <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum projeto encontrado</h3>
                      <p className="text-gray-600 mb-6">
                        {searchTerm ? 'Nenhum projeto corresponde aos filtros aplicados.' : 'Comece criando seu primeiro projeto.'}
                      </p>
                      <Button 
                        className="legal-button-primary"
                        onClick={() => setIsDialogOpen(true)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Criar Projeto
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="table" className="mt-6">
                <ProjectList />
              </TabsContent>

              <TabsContent value="kanban" className="mt-6">
                <div className="grid gap-6 md:grid-cols-4">
                  {['planning', 'active', 'on_hold', 'completed'].map((status) => (
                    <Card key={status} className="legal-card">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium">
                          {getStatusLabel(status)}
                          <Badge variant="outline" className="ml-2">
                            {filteredProjects.filter(p => p.status === status).length}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {filteredProjects
                          .filter(p => p.status === status)
                          .map((project) => (
                            <Card key={project.id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                              <CardContent className="p-3">
                                <h4 className="font-medium text-sm mb-2 line-clamp-2">
                                  {project.name}
                                </h4>
                                {project.description && (
                                  <p className="text-xs text-gray-600 line-clamp-3 mb-2">
                                    {project.description}
                                  </p>
                                )}
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <span>{new Date(project.createdAt).toLocaleDateString('pt-BR')}</span>
                                  <div className="flex space-x-1">
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                      <Eye className="w-3 h-3" />
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                      <Edit className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
