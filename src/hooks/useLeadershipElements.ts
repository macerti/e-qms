import { useState, useCallback } from "react";
import { 
  QualityPolicyData, 
  ManagementReviewData 
} from "@/types/leadership-elements";

export function useLeadershipElements() {
  const [qualityPolicy, setQualityPolicy] = useState<QualityPolicyData | null>(null);
  const [managementReviews, setManagementReviews] = useState<ManagementReviewData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Quality Policy
  const saveQualityPolicy = useCallback((data: Omit<QualityPolicyData, "id" | "createdAt" | "updatedAt" | "version" | "revisionDate">) => {
    const now = new Date().toISOString();
    
    if (qualityPolicy) {
      // Update existing
      setQualityPolicy({
        ...qualityPolicy,
        ...data,
        updatedAt: now,
        version: qualityPolicy.version + 1,
        revisionDate: now,
      });
    } else {
      // Create new
      const newPolicy: QualityPolicyData = {
        id: crypto.randomUUID(),
        createdAt: now,
        updatedAt: now,
        version: 1,
        revisionDate: now,
        ...data,
      };
      setQualityPolicy(newPolicy);
    }
  }, [qualityPolicy]);

  // Management Reviews
  const generateReviewCode = useCallback(() => {
    const count = managementReviews.length + 1;
    return `REV-${count.toString().padStart(3, "0")}`;
  }, [managementReviews.length]);

  const createManagementReview = useCallback((
    data: Omit<ManagementReviewData, "id" | "createdAt" | "updatedAt" | "code" | "version" | "revisionDate">,
    customCode?: string
  ) => {
    const now = new Date().toISOString();
    const newReview: ManagementReviewData = {
      id: crypto.randomUUID(),
      code: customCode || generateReviewCode(),
      createdAt: now,
      updatedAt: now,
      version: 1,
      revisionDate: now,
      ...data,
    };
    setManagementReviews((prev) => [...prev, newReview]);
    return newReview;
  }, [generateReviewCode]);

  const updateManagementReview = useCallback((id: string, data: Partial<ManagementReviewData>, revisionNote?: string) => {
    const now = new Date().toISOString();
    setManagementReviews((prev) =>
      prev.map((review) =>
        review.id === id
          ? {
              ...review,
              ...data,
              updatedAt: now,
              version: review.version + 1,
              revisionDate: now,
              revisionNote: revisionNote || data.revisionNote,
            }
          : review
      )
    );
  }, []);

  const getManagementReviewById = useCallback((id: string) => {
    return managementReviews.find((r) => r.id === id);
  }, [managementReviews]);

  return {
    qualityPolicy,
    managementReviews,
    isLoading,
    saveQualityPolicy,
    generateReviewCode,
    createManagementReview,
    updateManagementReview,
    getManagementReviewById,
  };
}
