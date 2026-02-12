import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ManagementSystemProvider } from "@/context/ManagementSystemContext";
import { TenantProvider } from "@/context/TenantContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import Settings from "./pages/Settings";
import ActivityLog from "./pages/ActivityLog";
import Help from "./pages/Help";
import StandardRequirements from "./pages/settings/StandardRequirements";
import UserDetails from "./pages/settings/UserDetails";

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
import ToolsOverview from "@/pages/tools/ToolsOverview";
import ToolWorkspacePage from "@/pages/tools/ToolWorkspacePage";
import NotFound from "./pages/NotFound";

const App = () => (
  <TenantProvider>
    <ManagementSystemProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Dashboard />} />

              <Route path="/processes" element={<ProcessList />} />
              <Route path="/processes/:id" element={<ProcessDetail />} />

              <Route path="/tools" element={<ToolsOverview />} />
              <Route path="/tools/:toolKey" element={<ToolWorkspacePage />} />

              <Route path="/issues" element={<IssueList />} />
              <Route path="/issues/new" element={<IssueForm />} />
              <Route path="/issues/:id" element={<IssueDetail />} />
              <Route path="/issues/:id/edit" element={<IssueForm />} />

              <Route path="/actions" element={<ActionList />} />
              <Route path="/actions/new" element={<ActionForm />} />
              <Route path="/actions/:id" element={<ActionDetail />} />
              <Route path="/actions/:id/edit" element={<ActionForm />} />

              <Route path="/documents" element={<DocumentList />} />
              <Route path="/documents/new" element={<DocumentForm />} />
              <Route path="/documents/:id" element={<DocumentDetail />} />
              <Route path="/documents/:id/edit" element={<DocumentForm />} />

              <Route path="/settings" element={<Settings />} />
              <Route path="/settings/standard-requirements" element={<StandardRequirements />} />
              <Route path="/settings/user-details" element={<UserDetails />} />
              <Route path="/activity-log" element={<ActivityLog />} />
              <Route path="/help" element={<Help />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ManagementSystemProvider>
  </TenantProvider>
);

export default App;
