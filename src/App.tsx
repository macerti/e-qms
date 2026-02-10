import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ManagementSystemProvider } from "@/context/ManagementSystemContext";
import { TenantProvider } from "@/context/TenantContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Settings from "./pages/Settings";
import ActivityLog from "./pages/ActivityLog";
import Help from "./pages/Help";
import StandardRequirements from "./pages/settings/StandardRequirements";

// Pages
import Dashboard from "./pages/Dashboard";
import ProcessList from "./pages/processes/ProcessList";
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
import NotFound from "./pages/NotFound";

const App = () => (
  <TenantProvider>
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

              {/* Settings */}
              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/standard-requirements" element={<StandardRequirements />} />
              <Route path="/activity-log" element={<ActivityLog />} />
              <Route path="/help" element={<Help />} />
            </Route>
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ManagementSystemProvider>
  </TenantProvider>
);

export default App;
