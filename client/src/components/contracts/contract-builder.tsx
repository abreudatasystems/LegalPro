
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Plus, Eye, FileText, Layers, Code, Download, ArrowRight, ArrowLeft, Save, Edit3, CheckCircle, Scale, Gavel, FileCheck, Printer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type ContractTemplate, type ContractClause, type Client } from "@shared/schema";

interface ContractBuilderProps {
  onContractGenerated: (content: string) => void;
}

interface ContractData {
  title: string;
  clientId: string;
  value: string;
  startDate: string;
  endDate: string;
  description: string;
  variables: Record<string, string>;
  contractType: string;
  jurisdiction: string;
  witnessRequired: boolean;
}

export default function ContractBuilder({ onContractGenerated }: ContractBuilderProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [selectedClauses, setSelectedClauses] = useState<string[]>([]);
  const [contractData, setContractData] = useState<ContractData>({
    title: "",
    clientId: "",
    value: "",
    startDate: "",
    endDate: "",
    description: "",
    variables: {},
    contractType: "",
    jurisdiction: "São Paulo",
    witnessRequired: false,
  });
  const [generatedContent, setGeneratedContent] = useState<string>("");
  const [finalContract, setFinalContract] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  const { data: templates, isLoading: templatesLoading } = useQuery<ContractTemplate[]>({
    queryKey: ["/api/contract-templates"],
  });

  const { data: clauses, isLoading: clausesLoading } = useQuery<ContractClause[]>({
    queryKey: ["/api/contract-clauses"],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const generateContractMutation = useMutation({
    mutationFn: async () => {
      const template = templates?.find(t => t.id === selectedTemplate);
      const selectedClauseData = clauses?.filter(c => selectedClauses.includes(c.id));
      const client = clients?.find(c => c.id === contractData.clientId);
      
      if (!template) throw new Error("Template não encontrado");
      
      const today = new Date();
      const formattedDate = today.toLocaleDateString('pt-BR', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      });
      
      // Header do contrato com design profissional
      let content = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                           CONTRATO DE PRESTAÇÃO DE SERVIÇOS JURÍDICOS        ║
║                                                                              ║
║                              ${contractData.title.toUpperCase().padStart(50)}                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
█                               IDENTIFICAÇÃO DAS PARTES                        █
█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█

🏛️ CONTRATADO:
   Razão Social: [NOME DO ESCRITÓRIO DE ADVOCACIA]
   CNPJ: [CNPJ DO ESCRITÓRIO]
   OAB: [NÚMERO DA OAB]
   Endereço: [ENDEREÇO COMPLETO DO ESCRITÓRIO]
   E-mail: [EMAIL PROFISSIONAL]
   Telefone: [TELEFONE PROFISSIONAL]

👤 CONTRATANTE:
   Nome/Razão Social: ${client?.name || '[NOME DO CLIENTE]'}
   ${client?.type === 'company' ? 'CNPJ' : 'CPF'}: ${client?.document || '[DOCUMENTO]'}
   Endereço: ${client?.address || '[ENDEREÇO DO CLIENTE]'}
   E-mail: ${client?.email || '[EMAIL DO CLIENTE]'}
   Telefone: ${client?.phone || '[TELEFONE DO CLIENTE]'}

█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
█                              OBJETO DO CONTRATO                               █
█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█

📋 DESCRIÇÃO DOS SERVIÇOS:
${contractData.description || '[DESCRIÇÃO DETALHADA DOS SERVIÇOS JURÍDICOS]'}

💰 VALOR DOS HONORÁRIOS: ${contractData.value ? `R$ ${parseFloat(contractData.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '[VALOR DOS HONORÁRIOS]'}

📅 PERÍODO DE VIGÊNCIA:
   • Início: ${contractData.startDate ? new Date(contractData.startDate).toLocaleDateString('pt-BR') : '[DATA DE INÍCIO]'}
   • Término: ${contractData.endDate ? new Date(contractData.endDate).toLocaleDateString('pt-BR') : '[DATA DE TÉRMINO]'}

🏛️ JURISDIÇÃO: ${contractData.jurisdiction}
📋 TIPO DE CONTRATO: ${contractData.contractType || 'Prestação de Serviços Jurídicos'}

█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
█                              CLÁUSULAS GERAIS                                 █
█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█

1ª. CLÁUSULA - DOS HONORÁRIOS E FORMA DE PAGAMENTO
O CONTRATANTE pagará ao CONTRATADO pelos serviços prestados o valor total de ${contractData.value ? `R$ ${parseFloat(contractData.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '[VALOR]'}, nas seguintes condições:
• O pagamento deverá ser efetuado conforme cronograma a ser estabelecido;
• Em caso de atraso, incidirão juros de 1% ao mês e multa de 2%;
• Os valores não incluem custas processuais, taxas e despesas de terceiros.

2ª. CLÁUSULA - DAS OBRIGAÇÕES DO CONTRATADO
O CONTRATADO obriga-se a:
• Prestar os serviços jurídicos com a devida diligência e ética profissional;
• Manter sigilo absoluto sobre todas as informações recebidas;
• Comunicar ao CONTRATANTE sobre o andamento dos serviços;
• Atuar sempre no melhor interesse do CONTRATANTE, respeitando os limites éticos.

3ª. CLÁUSULA - DAS OBRIGAÇÕES DO CONTRATANTE
O CONTRATANTE obriga-se a:
• Fornecer todas as informações e documentos necessários;
• Efetuar os pagamentos nas datas acordadas;
• Comunicar qualquer alteração em seus dados;
• Colaborar para o bom desenvolvimento dos serviços.

4ª. CLÁUSULA - DA CONFIDENCIALIDADE
Todas as informações trocadas entre as partes são confidenciais e protegidas pelo sigilo profissional do advogado, conforme art. 34 do Estatuto da Advocacia e da OAB.

5ª. CLÁUSULA - DA RESCISÃO
Este contrato poderá ser rescindido por qualquer das partes, mediante notificação prévia de 30 (trinta) dias, respeitando-se os honorários pelos serviços já prestados.
`;

      // Adicionar cláusulas especiais se selecionadas
      if (selectedClauseData && selectedClauseData.length > 0) {
        content += `

█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
█                             CLÁUSULAS ESPECIAIS                               █
█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█

`;
        selectedClauseData.forEach((clause, index) => {
          content += `${index + 6}ª. CLÁUSULA - ${clause.title.toUpperCase()}\n${clause.content}\n\n`;
        });
      }

      // Adicionar cláusulas finais
      content += `

█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█
█                            DISPOSIÇÕES FINAIS                                 █
█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█

CLÁUSULA FINAL - DO FORO
Fica eleito o foro da Comarca de ${contractData.jurisdiction} para dirimir qualquer questão oriunda do presente contrato, renunciando as partes a qualquer outro, por mais privilegiado que seja.

E por estarem assim justas e contratadas, as partes assinam o presente instrumento em duas vias de igual teor e forma, na presença de duas testemunhas${contractData.witnessRequired ? ' conforme exigido' : ''}.

${contractData.jurisdiction}, ${formattedDate}

┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 ASSINATURAS                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│ CONTRATADO:                              CONTRATANTE:                          │
│                                                                                 │
│ _____________________________            _____________________________        │
│ [NOME DO ADVOGADO]                       ${client?.name || '[NOME DO CLIENTE]'} │
│ OAB/SP nº [NÚMERO]                       ${client?.type === 'company' ? 'CNPJ' : 'CPF'}: ${client?.document || '[DOCUMENTO]'} │
│                                                                                 │
│                                                                                 │
${contractData.witnessRequired ? `│ TESTEMUNHAS:                                                                    │
│                                                                                 │
│ 1ª Testemunha: ____________________    2ª Testemunha: ____________________     │
│ CPF: ____________________              CPF: ____________________               │` : ''}
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

╔══════════════════════════════════════════════════════════════════════════════╗
║   Este contrato foi elaborado em conformidade com o Código de Ética e        ║
║   Disciplina da OAB e demais normas aplicáveis à advocacia no Brasil.        ║
║                                                                              ║
║   Data de elaboração: ${formattedDate}                                       ║
║   Documento gerado pelo sistema LegalPro                                     ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;
      
      return content;
    },
    onSuccess: (content) => {
      setGeneratedContent(content);
      setFinalContract(content);
      toast({
        title: "✅ Contrato Gerado",
        description: "Contrato jurídico profissional criado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "❌ Erro",
        description: "Erro ao gerar contrato. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const saveContractMutation = useMutation({
    mutationFn: async () => {
      const contractPayload = {
        title: contractData.title,
        description: contractData.description,
        clientId: contractData.clientId,
        value: contractData.value,
        startDate: contractData.startDate ? new Date(contractData.startDate) : undefined,
        endDate: contractData.endDate ? new Date(contractData.endDate) : undefined,
        status: "draft",
        content: finalContract,
      };
      
      const response = await apiRequest("POST", "/api/contracts", contractPayload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      toast({
        title: "✅ Sucesso",
        description: "Contrato salvo no sistema com sucesso!",
      });
      onContractGenerated(finalContract);
    },
  });

  const steps = [
    { number: 1, title: "Tipo e Minuta", description: "Escolha tipo e minuta base", icon: FileText },
    { number: 2, title: "Dados Contratuais", description: "Informações do contrato", icon: Edit3 },
    { number: 3, title: "Cláusulas Especiais", description: "Cláusulas complementares", icon: Layers },
    { number: 4, title: "Revisão Jurídica", description: "Gerar e revisar contrato", icon: Scale },
    { number: 5, title: "Finalização", description: "Salvar e exportar", icon: CheckCircle },
  ];

  const handleClauseToggle = (clauseId: string) => {
    setSelectedClauses(prev => 
      prev.includes(clauseId) 
        ? prev.filter(id => id !== clauseId)
        : [...prev, clauseId]
    );
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleExportPDF = () => {
    const element = document.createElement('a');
    const file = new Blob([finalContract], { type: 'text/plain; charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${contractData.title || 'contrato-juridico'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "📄 Download Iniciado",
      description: "Contrato jurídico sendo baixado em formato texto.",
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return selectedTemplate !== "" && contractData.contractType !== "";
      case 2: return contractData.title && contractData.clientId && contractData.value;
      case 3: return true;
      case 4: return generatedContent !== "";
      case 5: return true;
      default: return false;
    }
  };

  const activeTemplates = templates?.filter(t => t.isActive) || [];
  const activeClauses = clauses?.filter(c => c.isActive) || [];
  const clausesByCategory = activeClauses.reduce((acc, clause) => {
    const category = clause.category || "Geral";
    if (!acc[category]) acc[category] = [];
    acc[category].push(clause);
    return acc;
  }, {} as Record<string, ContractClause[]>);

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="space-y-6">
      {/* Header com progresso aprimorado */}
      <Card className="legal-card border-l-4 border-l-blue-500">
        <CardContent className="pt-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Gavel className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Assistente Jurídico de Contratos</h2>
                  <p className="text-sm text-gray-600">Sistema profissional para elaboração de contratos jurídicos</p>
                </div>
              </div>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Etapa {currentStep} de {steps.length}
              </Badge>
            </div>
            <Progress value={progress} className="h-3 bg-blue-50" />
          </div>
          
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`flex flex-col items-center space-y-2 ${
                  step.number <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
                    step.number < currentStep
                      ? 'bg-blue-600 text-white border-blue-600'
                      : step.number === currentStep
                      ? 'bg-blue-50 text-blue-600 border-blue-600'
                      : 'bg-gray-100 text-gray-400 border-gray-200'
                  }`}
                >
                  {step.number < currentStep ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <step.icon className="w-6 h-6" />
                  )}
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium">{step.title}</p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo da etapa atual */}
      <Card className="legal-card">
        <CardContent className="pt-6">
          {/* Etapa 1: Seleção de Tipo e Minuta */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Tipo de Contrato e Minuta Base</h3>
              </div>

              {/* Seleção do tipo de contrato */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className={`cursor-pointer transition-all ${contractData.contractType === 'prestacao-servicos' ? 'border-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
                      onClick={() => setContractData(prev => ({ ...prev, contractType: 'prestacao-servicos' }))}>
                  <CardContent className="p-4 text-center">
                    <Scale className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <h4 className="font-medium">Prestação de Serviços</h4>
                    <p className="text-sm text-gray-600">Contratos de serviços jurídicos</p>
                  </CardContent>
                </Card>
                
                <Card className={`cursor-pointer transition-all ${contractData.contractType === 'consultoria' ? 'border-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
                      onClick={() => setContractData(prev => ({ ...prev, contractType: 'consultoria' }))}>
                  <CardContent className="p-4 text-center">
                    <FileCheck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <h4 className="font-medium">Consultoria Jurídica</h4>
                    <p className="text-sm text-gray-600">Assessoria e consultoria</p>
                  </CardContent>
                </Card>

                <Card className={`cursor-pointer transition-all ${contractData.contractType === 'representacao' ? 'border-blue-500 bg-blue-50' : 'hover:shadow-md'}`}
                      onClick={() => setContractData(prev => ({ ...prev, contractType: 'representacao' }))}>
                  <CardContent className="p-4 text-center">
                    <Gavel className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <h4 className="font-medium">Representação Legal</h4>
                    <p className="text-sm text-gray-600">Representação processual</p>
                  </CardContent>
                </Card>
              </div>

              {/* Seleção de minuta */}
              <div>
                <h4 className="font-medium mb-3">Selecione uma Minuta Base:</h4>
                {templatesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Carregando minutas profissionais...</p>
                  </div>
                ) : (
                  <div className="grid gap-3 max-h-96 overflow-y-auto">
                    {activeTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedTemplate === template.id
                            ? "border-blue-500 bg-blue-50 shadow-md"
                            : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <Scale className="w-4 h-4 text-blue-600" />
                              <h4 className="font-medium">{template.name}</h4>
                              {template.category && (
                                <Badge variant="outline" className="text-xs">{template.category}</Badge>
                              )}
                            </div>
                            {template.description && (
                              <p className="text-sm text-gray-600">{template.description}</p>
                            )}
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowPreview(true);
                              setGeneratedContent(template.content);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Etapa 2: Dados do Contrato */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <Edit3 className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold">Dados Contratuais</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Título do Contrato *</label>
                    <Input
                      placeholder="Ex: Contrato de Prestação de Serviços Jurídicos"
                      value={contractData.title}
                      onChange={(e) => setContractData(prev => ({ ...prev, title: e.target.value }))}
                      className="legal-card"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Cliente *</label>
                    <Select 
                      value={contractData.clientId} 
                      onValueChange={(value) => setContractData(prev => ({ ...prev, clientId: value }))}
                    >
                      <SelectTrigger className="legal-card">
                        <SelectValue placeholder="Selecione um cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients?.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            <div className="flex items-center space-x-2">
                              <span>{client.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {client.type === 'company' ? 'PJ' : 'PF'}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Valor dos Honorários *</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={contractData.value}
                      onChange={(e) => setContractData(prev => ({ ...prev, value: e.target.value }))}
                      className="legal-card"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Jurisdição</label>
                    <Select 
                      value={contractData.jurisdiction} 
                      onValueChange={(value) => setContractData(prev => ({ ...prev, jurisdiction: value }))}
                    >
                      <SelectTrigger className="legal-card">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="São Paulo">São Paulo - SP</SelectItem>
                        <SelectItem value="Rio de Janeiro">Rio de Janeiro - RJ</SelectItem>
                        <SelectItem value="Belo Horizonte">Belo Horizonte - MG</SelectItem>
                        <SelectItem value="Salvador">Salvador - BA</SelectItem>
                        <SelectItem value="Brasília">Brasília - DF</SelectItem>
                        <SelectItem value="Curitiba">Curitiba - PR</SelectItem>
                        <SelectItem value="Porto Alegre">Porto Alegre - RS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Data de Início</label>
                    <Input
                      type="date"
                      value={contractData.startDate}
                      onChange={(e) => setContractData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="legal-card"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Data de Término</label>
                    <Input
                      type="date"
                      value={contractData.endDate}
                      onChange={(e) => setContractData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="legal-card"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="witness"
                      checked={contractData.witnessRequired}
                      onCheckedChange={(checked) => setContractData(prev => ({ ...prev, witnessRequired: !!checked }))}
                    />
                    <label htmlFor="witness" className="text-sm font-medium">
                      Requer testemunhas
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição dos Serviços Jurídicos *</label>
                <Textarea
                  placeholder="Descreva detalhadamente os serviços jurídicos que serão prestados..."
                  value={contractData.description}
                  onChange={(e) => setContractData(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[120px] legal-card"
                />
              </div>
            </div>
          )}

          {/* Etapa 3: Cláusulas Especiais */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Layers className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold">Cláusulas Especiais</h3>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {selectedClauses.length} selecionadas
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Selecione cláusulas adicionais específicas para este contrato (opcional).
              </p>
              
              {clausesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Carregando biblioteca de cláusulas...</p>
                </div>
              ) : (
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {Object.entries(clausesByCategory).map(([category, categoryCllauses]) => (
                      <Card key={category} className="legal-card">
                        <CardHeader className="pb-3">
                          <CardTitle className="flex items-center space-x-2 text-base">
                            <Layers className="w-4 h-4 text-blue-600" />
                            <span>{category}</span>
                            <Badge variant="outline" className="text-xs">{categoryCllauses.length}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {categoryCllauses.map((clause) => (
                              <div
                                key={clause.id}
                                className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-blue-50 transition-colors"
                              >
                                <Checkbox
                                  id={clause.id}
                                  checked={selectedClauses.includes(clause.id)}
                                  onCheckedChange={() => handleClauseToggle(clause.id)}
                                />
                                <div className="flex-1">
                                  <label 
                                    htmlFor={clause.id}
                                    className="font-medium cursor-pointer block"
                                  >
                                    {clause.title}
                                  </label>
                                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {clause.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}

          {/* Etapa 4: Geração e Revisão */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Scale className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold">Revisão Jurídica do Contrato</h3>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => generateContractMutation.mutate()}
                    disabled={generateContractMutation.isPending}
                    className="legal-button-primary"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    {generateContractMutation.isPending ? "Gerando..." : "Gerar Contrato"}
                  </Button>
                  {generatedContent && (
                    <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      {isEditing ? "Visualizar" : "Editar"}
                    </Button>
                  )}
                </div>
              </div>

              {generatedContent ? (
                <Card className="legal-card">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="font-medium">Contrato Jurídico Gerado</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          ✓ Minuta: {templates?.find(t => t.id === selectedTemplate)?.name}
                        </Badge>
                        {selectedClauses.length > 0 && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            + {selectedClauses.length} cláusulas especiais
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {isEditing ? (
                      <Textarea
                        value={finalContract}
                        onChange={(e) => setFinalContract(e.target.value)}
                        className="min-h-[500px] font-mono text-sm legal-card"
                      />
                    ) : (
                      <ScrollArea className="h-96">
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                          {finalContract}
                        </pre>
                      </ScrollArea>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="legal-card border-2 border-dashed border-blue-300">
                  <CardContent className="p-12 text-center">
                    <Scale className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      Pronto para Gerar Contrato Jurídico
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Clique em "Gerar Contrato" para criar o documento jurídico profissional baseado nas suas seleções.
                    </p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Dados validados</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Minuta selecionada</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span>Padrões jurídicos</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Etapa 5: Finalização */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Contrato Jurídico Finalizado!</h3>
                <p className="text-gray-600">
                  Seu contrato profissional foi gerado com sucesso. Escolha uma das opções abaixo:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="legal-card text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-2">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Save className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Salvar no Sistema</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Salvar o contrato na base de dados para futuras consultas e gestão
                    </p>
                    <Button 
                      onClick={() => saveContractMutation.mutate()}
                      disabled={saveContractMutation.isPending}
                      className="w-full legal-button-primary"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saveContractMutation.isPending ? "Salvando..." : "Salvar Contrato"}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="legal-card text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-2">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Download className="w-8 h-8 text-green-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Exportar Documento</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Fazer download do contrato em formato de texto para impressão
                    </p>
                    <Button variant="outline" onClick={handleExportPDF} className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      Download TXT
                    </Button>
                  </CardContent>
                </Card>

                <Card className="legal-card text-center p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="pt-2">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Printer className="w-8 h-8 text-purple-600" />
                    </div>
                    <h4 className="font-semibold mb-2">Imprimir Contrato</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Ver uma prévia otimizada para impressão do contrato gerado
                    </p>
                    <Button variant="outline" onClick={() => setShowPreview(true)} className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      Prévia de Impressão
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="legal-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
                <h4 className="font-semibold mb-4 flex items-center space-x-2">
                  <FileCheck className="w-5 h-5 text-blue-600" />
                  <span>Resumo do Contrato Jurídico</span>
                </h4>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div className="space-y-2">
                    <div><span className="font-medium text-gray-700">Título:</span> {contractData.title}</div>
                    <div><span className="font-medium text-gray-700">Cliente:</span> {clients?.find(c => c.id === contractData.clientId)?.name}</div>
                    <div><span className="font-medium text-gray-700">Tipo:</span> {contractData.contractType}</div>
                  </div>
                  <div className="space-y-2">
                    <div><span className="font-medium text-gray-700">Valor:</span> R$ {contractData.value ? parseFloat(contractData.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</div>
                    <div><span className="font-medium text-gray-700">Jurisdição:</span> {contractData.jurisdiction}</div>
                    <div><span className="font-medium text-gray-700">Cláusulas Especiais:</span> {selectedClauses.length}</div>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Botões de navegação aprimorados */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="min-w-[120px]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Anterior
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={currentStep === steps.length || !canProceed()}
          className={`min-w-[120px] ${canProceed() ? 'legal-button-primary' : ''}`}
        >
          {currentStep === steps.length ? "Finalizar" : "Próximo"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Dialog de Preview aprimorado */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Visualização do Contrato Jurídico</span>
            </DialogTitle>
          </DialogHeader>
          <div className="bg-white border rounded-lg p-6 shadow-inner">
            <ScrollArea className="h-[60vh]">
              <div className="bg-white p-8 font-mono text-sm leading-relaxed border border-gray-200 rounded">
                <pre className="whitespace-pre-wrap">
                  {generatedContent || finalContract}
                </pre>
              </div>
            </ScrollArea>
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
