import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Contracts from "@/pages/contracts";
import Clients from "@/pages/clients";
import Projects from "@/pages/projects";
import Documents from "@/pages/documents";
import Financial from "@/pages/financial";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import Suppliers from "@/pages/suppliers";
import Employees from "@/pages/employees";
import CalendarPage from "@/pages/calendar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/contracts" component={Contracts} />
          <Route path="/clients" component={Clients} />
          <Route path="/suppliers" component={Suppliers} />
          <Route path="/employees" component={Employees} />
          <Route path="/projects" component={Projects} />
          <Route path="/documents" component={Documents} />
          <Route path="/financial" component={Financial} />
          <Route path="/settings" component={Settings} />
          <Route path="/profile" component={Profile} />
          <Route path="/calendar" component={CalendarPage} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;