import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ManagementSystemProvider } from "@/context/ManagementSystemContext";
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import ProcessList from "./pages/processes/ProcessList";
import ProcessForm from "./pages/processes/ProcessForm";
import ProcessDetail from "./pages/processes/ProcessDetail";
import IssueList from "./pages/issues/IssueList";
import IssueForm from "./pages/issues/IssueForm";
import IssueDetail from "./pages/issues/IssueDetail";
import ActionList from "./pages/actions/ActionList";
import ActionForm from "./pages/actions/ActionForm";
import ActionDetail from "./pages/actions/ActionDetail";
import DocumentList from "./pages/documents/DocumentList";
import DocumentForm from "./pages/documents/DocumentForm";
import DocumentDetail from "./pages/documents/DocumentDetail";
import KPIDashboard from "./pages/KPIDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ManagementSystemProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />
              
              {/* Processes */}
              <Route path="/processes" element={<ProcessList />} />
              <Route path="/processes/:id" element={<ProcessDetail />} />
              <Route path="/processes/:id/edit" element={<ProcessForm />} />
              
              {/* Issues (Context Analysis) */}
              <Route path="/issues" element={<IssueList />} />
              <Route path="/issues/new" element={<IssueForm />} />
              <Route path="/issues/:id" element={<IssueDetail />} />
              <Route path="/issues/:id/edit" element={<IssueForm />} />
              
              {/* Actions */}
              <Route path="/actions" element={<ActionList />} />
              <Route path="/actions/new" element={<ActionForm />} />
              <Route path="/actions/:id" element={<ActionDetail />} />
              <Route path="/actions/:id/edit" element={<ActionForm />} />

              {/* Documents */}
              <Route path="/documents" element={<DocumentList />} />
              <Route path="/documents/new" element={<DocumentForm />} />
              <Route path="/documents/:id" element={<DocumentDetail />} />
              <Route path="/documents/:id/edit" element={<DocumentForm />} />
              
              {/* KPI Dashboard (Planned) */}
              <Route path="/kpi" element={<KPIDashboard />} />
            </Route>
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ManagementSystemProvider>
  </QueryClientProvider>
);

export default App;
