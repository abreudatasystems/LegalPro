
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  FileText, 
  Users, 
  BarChart3, 
  CheckCircle, 
  ArrowRight,
  Scale,
  Briefcase,
  Clock,
  Star,
  Globe,
  Lock
} from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const features = [
    {
      icon: FileText,
      title: "Gestão de Contratos",
      description: "Criação, edição e controle completo de contratos jurídicos com templates personalizáveis."
    },
    {
      icon: Users,
      title: "CRM Jurídico",
      description: "Gerencie clientes, empresas e relacionamentos de forma organizada e profissional."
    },
    {
      icon: Briefcase,
      title: "Gestão de Projetos",
      description: "Acompanhe processos, prazos e entregas com ferramentas especializadas para advocacia."
    },
    {
      icon: BarChart3,
      title: "Dashboard Analytics",
      description: "Relatórios detalhados e métricas de performance para tomada de decisões estratégicas."
    },
    {
      icon: Shield,
      title: "Segurança Avançada",
      description: "Proteção de dados com criptografia e controle de acesso adequado para informações sensíveis."
    },
    {
      icon: Clock,
      title: "Gestão de Tempo",
      description: "Controle de horas trabalhadas, faturamento e produtividade da equipe jurídica."
    }
  ];

  const stats = [
    { number: "500+", label: "Escritórios Atendidos" },
    { number: "99.9%", label: "Uptime Garantido" },
    { number: "24/7", label: "Suporte Especializado" },
    { number: "LGPD", label: "Compliance Total" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 opacity-95"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center text-white">
            <div className="flex items-center justify-center mb-8">
              <div className="p-4 bg-white/20 rounded-full backdrop-blur-sm">
                <Scale className="w-16 h-16 text-white" />
              </div>
            </div>
            
            <Badge variant="secondary" className="mb-6 bg-white/20 text-white border-white/30">
              <Star className="w-4 h-4 mr-2" />
              Sistema Líder em Gestão Jurídica
            </Badge>
            
            <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              LegalPro
            </h1>
            
            <p className="text-2xl mb-4 text-blue-100">
              Plataforma Completa de Gestão Jurídica
            </p>
            
            <p className="text-lg text-blue-100 max-w-3xl mx-auto mb-8 leading-relaxed">
              Transforme a gestão do seu escritório de advocacia com nossa solução integrada. 
              Gerencie contratos, clientes, projetos e documentos jurídicos com máxima eficiência e segurança.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={handleLogin} 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-8 py-4 text-lg"
              >
                Acessar Sistema
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white/30 text-white hover:bg-white/10 font-semibold px-8 py-4 text-lg"
              >
                <Globe className="w-5 h-5 mr-2" />
                Demo Online
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-16 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-blue-200 text-blue-700">
              Funcionalidades
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Tudo que seu escritório precisa
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Uma plataforma completa projetada especificamente para as necessidades 
              dos profissionais do direito e escritórios de advocacia.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="legal-card group cursor-pointer">
                <CardHeader>
                  <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <feature.icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="outline" className="mb-4 border-green-200 text-green-700">
                <Lock className="w-4 h-4 mr-2" />
                Segurança & Compliance
              </Badge>
              
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Segurança Enterprise para Dados Jurídicos
              </h2>
              
              <p className="text-lg text-gray-600 mb-8">
                Proteção máxima para informações confidenciais com certificações 
                internacionais e conformidade total com a LGPD.
              </p>
              
              <div className="space-y-4">
                {[
                  "Criptografia AES-256 em repouso e em trânsito",
                  "Autenticação multi-fator (MFA)",
                  "Backup automático e recuperação de desastres",
                  "Auditoria completa de ações e acessos",
                  "Conformidade LGPD e ISO 27001"
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
                <Shield className="w-16 h-16 mb-6" />
                <h3 className="text-2xl font-bold mb-4">
                  Certificado para o Setor Jurídico
                </h3>
                <p className="text-blue-100 mb-6">
                  Desenvolvido seguindo as melhores práticas de segurança 
                  específicas para o mercado jurídico brasileiro.
                </p>
                <div className="flex items-center text-sm text-blue-100">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovado pela OAB Digital
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para revolucionar seu escritório?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a centenas de escritórios que já modernizaram sua gestão jurídica
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-12 py-4 text-lg"
          >
            Começar Agora
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Scale className="w-8 h-8 text-blue-400 mr-3" />
              <span className="text-xl font-bold text-white">LegalPro</span>
            </div>
            <div className="text-sm">
              © 2024 LegalPro. Todos os direitos reservados. | 
              <span className="text-blue-400 ml-1">Sistema de Gestão Jurídica</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
