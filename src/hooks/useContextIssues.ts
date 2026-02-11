import { useState, useCallback, useEffect } from "react";
import { 
  ContextIssue, 
  IssueType, 
  SwotQuadrant, 
  ContextNature, 
  RiskPriority, 
  RiskVersion,
  RiskTrigger 
} from "@/types/management-system";
import { createRecord, fetchRecords, updateRecord, deleteRecord as deleteDbRecord } from "@/lib/records";
import { createDemoIssues, inferProcessIdFromText } from "@/data/demo-seed";
import { Process } from "@/types/management-system";
import { createFallbackProcesses } from "@/data/default-processes";

type CreateIssueData = {
  code?: string;
  type: IssueType;
  quadrant: SwotQuadrant;
  description: string;
  contextNature: ContextNature;
  processId: string;
  severity?: number; // 1-3 scale
  probability?: number; // 1-3 scale
};


function backfillIssueProcessLinks(issues: ContextIssue[], processes: Process[]): ContextIssue[] {
  const processIds = new Set(processes.map((process) => process.id));

  return issues.map((issue) => {
    if (issue.processId && processIds.has(issue.processId)) {
      return issue;
    }

    const inferredProcessId = inferProcessIdFromText(processes, `${issue.code} ${issue.description}`);
    return inferredProcessId ? { ...issue, processId: inferredProcessId } : issue;
  });
}

// Calculate priority from criticity (3×3 matrix)
export function getPriorityFromCriticity(criticity: number): RiskPriority {
  if (criticity <= 3) return '03'; // Low priority (optional action)
  if (criticity <= 6) return '02'; // Medium priority (required action)
  return '01'; // High priority (mandatory/urgent action)
}

export function useContextIssues() {
  const [issues, setIssues] = useState<ContextIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load issues from the database once on mount.
  useEffect(() => {
    if (initialized) return;

    const loadIssues = async () => {
      setIsLoading(true);
      try {
        const [remoteIssues, processes] = await Promise.all([
          fetchRecords<ContextIssue>("issues"),
          fetchRecords<Process>("processes"),
        ]);
        const processesForLinking = processes.length > 0 ? processes : createFallbackProcesses();

        if (remoteIssues.length > 0) {
          const backfilledIssues = backfillIssueProcessLinks(remoteIssues, processesForLinking);
          setIssues(backfilledIssues);
          setInitialized(true);

          await Promise.all(
            backfilledIssues
              .filter((issue, index) => issue.processId !== remoteIssues[index].processId)
              .map((issue) => updateRecord("issues", issue.id, issue)),
          );
          return;
        }

        const seededIssues = createDemoIssues(processesForLinking);
        setIssues(seededIssues);
        setInitialized(true);

        await Promise.all(seededIssues.map((issue) => createRecord("issues", issue)));
      } catch (error) {
        console.error("Failed to load issues:", error);

        const fallbackProcesses = createFallbackProcesses();
        const seededIssues = createDemoIssues(fallbackProcesses);
        setIssues(seededIssues);
        setInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    void loadIssues();
  }, [initialized]);

  // Generate code with format RISK/YY/XXX or OPP/YY/XXX based on issue type
  const generateCode = useCallback((issueType: IssueType) => {
    const year = new Date().getFullYear().toString().slice(-2);
    const prefix = issueType === 'risk' ? 'RISK' : 'OPP';
    const typeIssues = issues.filter(i => i.type === issueType);
    const count = typeIssues.length + 1;
    return `${prefix}/${year}/${count.toString().padStart(3, "0")}`;
  }, [issues]);

  // Create initial risk version for negative issues
  const createRiskVersion = (
    severity: number, 
    probability: number, 
    description: string,
    trigger: RiskTrigger = 'initial',
    versionNumber: number = 1,
    evaluatorName?: string,
    notes?: string
  ): RiskVersion => {
    const criticity = severity * probability;
    return {
      id: crypto.randomUUID(),
      versionNumber,
      date: new Date().toISOString(),
      trigger,
      description,
      severity,
      probability,
      criticity,
      priority: getPriorityFromCriticity(criticity),
      evaluatorName,
      notes,
    };
  };

  const createIssue = useCallback((data: CreateIssueData) => {
    const now = new Date().toISOString();
    
    // Create risk versions array if this is a negative issue (risk)
    const isRisk = data.quadrant === 'weakness' || data.quadrant === 'threat';
    const riskVersions: RiskVersion[] = [];
    
    if (isRisk && data.severity && data.probability) {
      riskVersions.push(createRiskVersion(
        data.severity,
        data.probability,
        data.description,
        'initial'
      ));
    }
    
    // Get latest risk version values for convenience
    const latestVersion = riskVersions[riskVersions.length - 1];
    
    const newIssue: ContextIssue = {
      id: crypto.randomUUID(),
      code: data.code || generateCode(data.type),
      createdAt: now,
      updatedAt: now,
      version: 1,
      revisionDate: now,
      type: data.type,
      quadrant: data.quadrant,
      description: data.description,
      contextNature: data.contextNature,
      processId: data.processId,
      riskVersions,
      // Derived from latest risk version for convenience
      severity: latestVersion?.severity,
      probability: latestVersion?.probability,
      criticity: latestVersion?.criticity,
      priority: latestVersion?.priority,
    };
    
    setIssues((prev) => [...prev, newIssue]);
    void createRecord("issues", newIssue).catch((error) => {
      console.error("Failed to persist issue:", error);
    });
    return newIssue;
  }, [generateCode]);

  const updateIssue = useCallback((id: string, data: Partial<ContextIssue>, revisionNote?: string) => {
    const now = new Date().toISOString();
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id !== id) return issue;
        
        const updated: ContextIssue = {
          ...issue,
          ...data,
          updatedAt: now,
          version: issue.version + 1,
          revisionDate: now,
          revisionNote: revisionNote || data.revisionNote,
        };

        void updateRecord("issues", id, updated).catch((error) => {
          console.error("Failed to update issue:", error);
        });

        return updated;
      })
    );
  }, []);

  // Add a new risk version (for residual risk evaluation)
  const addRiskVersion = useCallback((
    issueId: string,
    data: {
      severity: number;
      probability: number;
      description: string;
      trigger: RiskTrigger;
      evaluatorName?: string;
      notes?: string;
    }
  ) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id !== issueId) return issue;
        
        const newVersionNumber = issue.riskVersions.length + 1;
        const newVersion = createRiskVersion(
          data.severity,
          data.probability,
          data.description,
          data.trigger,
          newVersionNumber,
          data.evaluatorName,
          data.notes
        );
        
        const now = new Date().toISOString();
        
        const updated = {
          ...issue,
          riskVersions: [...issue.riskVersions, newVersion],
          // Update description to latest
          description: data.description,
          // Update derived fields from latest version
          severity: newVersion.severity,
          probability: newVersion.probability,
          criticity: newVersion.criticity,
          priority: newVersion.priority,
          updatedAt: now,
          version: issue.version + 1,
          revisionDate: now,
          revisionNote: `Residual risk evaluation v${newVersionNumber}`,
        };

        void updateRecord("issues", issueId, updated).catch((error) => {
          console.error("Failed to update issue risk versions:", error);
        });

        return updated;
      })
    );
  }, []);

  // Get latest risk version for an issue
  const getLatestRiskVersion = useCallback((issueId: string): RiskVersion | undefined => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue || issue.riskVersions.length === 0) return undefined;
    return issue.riskVersions[issue.riskVersions.length - 1];
  }, [issues]);

  // Get all risk versions for an issue
  const getRiskHistory = useCallback((issueId: string): RiskVersion[] => {
    const issue = issues.find(i => i.id === issueId);
    return issue?.riskVersions || [];
  }, [issues]);

  const deleteIssue = useCallback((id: string) => {
    setIssues((prev) => prev.filter((issue) => issue.id !== id));
    void deleteDbRecord("issues", id).catch((error) => {
      console.error("Failed to delete issue:", error);
    });
  }, []);

  const getIssuesByProcess = useCallback((processId: string) => {
    return issues.filter((issue) => issue.processId === processId);
  }, [issues]);

  const getIssuesByQuadrant = useCallback((processId: string, quadrant: SwotQuadrant) => {
    return issues.filter(
      (issue) => issue.processId === processId && issue.quadrant === quadrant
    );
  }, [issues]);

  const getRisksByPriority = useCallback(() => {
    return issues
      .filter((issue) => issue.type === "risk" && issue.criticity !== undefined)
      .sort((a, b) => (b.criticity || 0) - (a.criticity || 0));
  }, [issues]);

  const getIssueById = useCallback((id: string) => {
    return issues.find((issue) => issue.id === id);
  }, [issues]);

  return {
    issues,
    isLoading,
    generateCode,
    createIssue,
    updateIssue,
    deleteIssue,
    addRiskVersion,
    getLatestRiskVersion,
    getRiskHistory,
    getIssuesByProcess,
    getIssuesByQuadrant,
    getRisksByPriority,
    getIssueById,
  };
}
