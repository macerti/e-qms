import { useState, useCallback } from "react";
import { ContextIssue, IssueType, SwotQuadrant, IssueOrigin, RiskPriority } from "@/types/management-system";

type CreateIssueData = {
  code?: string;
  type: IssueType;
  quadrant: SwotQuadrant;
  description: string;
  origin: IssueOrigin;
  processId: string;
  severity?: number; // 1-3 scale
  probability?: number; // 1-3 scale
};

// Calculate priority from criticity (3×3 matrix)
function getPriorityFromCriticity(criticity: number): RiskPriority {
  if (criticity <= 3) return '03'; // Low priority (optional action)
  if (criticity <= 6) return '02'; // Medium priority (required action)
  return '01'; // High priority (mandatory/urgent action)
}

export function useContextIssues() {
  const [issues, setIssues] = useState<ContextIssue[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateCode = useCallback(() => {
    const count = issues.length + 1;
    return `ISS-${count.toString().padStart(3, "0")}`;
  }, [issues.length]);

  const createIssue = useCallback((data: CreateIssueData) => {
    const now = new Date().toISOString();
    
    // Calculate criticity and priority if severity and probability provided (for risks only)
    const criticity = data.severity && data.probability 
      ? data.severity * data.probability 
      : undefined;
    const priority = criticity ? getPriorityFromCriticity(criticity) : undefined;
    
    const newIssue: ContextIssue = {
      id: crypto.randomUUID(),
      code: data.code || generateCode(),
      createdAt: now,
      updatedAt: now,
      version: 1,
      revisionDate: now,
      criticity,
      priority,
      type: data.type,
      quadrant: data.quadrant,
      description: data.description,
      origin: data.origin,
      processId: data.processId,
      severity: data.severity,
      probability: data.probability,
    };
    
    setIssues((prev) => [...prev, newIssue]);
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
        
        // Recalculate criticity and priority if severity or probability changed
        if (data.severity !== undefined || data.probability !== undefined) {
          const severity = data.severity ?? issue.severity;
          const probability = data.probability ?? issue.probability;
          const criticity = severity && probability ? severity * probability : undefined;
          updated.criticity = criticity;
          updated.priority = criticity ? getPriorityFromCriticity(criticity) : undefined;
        }
        
        return updated;
      })
    );
  }, []);

  const deleteIssue = useCallback((id: string) => {
    setIssues((prev) => prev.filter((issue) => issue.id !== id));
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

  return {
    issues,
    isLoading,
    generateCode,
    createIssue,
    updateIssue,
    deleteIssue,
    getIssuesByProcess,
    getIssuesByQuadrant,
    getRisksByPriority,
  };
}
