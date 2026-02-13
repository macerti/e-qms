import { useState, useCallback, useEffect } from "react";
import { 
  QualityPolicyData, 
  ManagementReviewData 
} from "@/domains/leadership/models";
import { createRecord, fetchRecords, updateRecord } from "@/lib/records";

type LeadershipRecord =
  | (QualityPolicyData & { kind: "qualityPolicy" })
  | (ManagementReviewData & { kind: "managementReview" });

export function useLeadershipElements() {
  const [qualityPolicy, setQualityPolicy] = useState<QualityPolicyData | null>(null);
  const [managementReviews, setManagementReviews] = useState<ManagementReviewData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load leadership data from the database.
  useEffect(() => {
    if (initialized) return;

    const loadLeadership = async () => {
      setIsLoading(true);
      try {
        const records = await fetchRecords<LeadershipRecord>("leadership");
        const policy = records.find((record) => record.kind === "qualityPolicy") || null;
        const reviews = records.filter((record) => record.kind === "managementReview");

        if (policy) {
          const { kind, ...policyData } = policy;
          setQualityPolicy(policyData);
        } else {
          setQualityPolicy(null);
        }

        setManagementReviews(
          reviews.map(({ kind, ...review }) => review),
        );
        setInitialized(true);
      } catch (error) {
        console.error("Failed to load leadership data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadLeadership();
  }, [initialized]);

  // Quality Policy
  const saveQualityPolicy = useCallback((data: Omit<QualityPolicyData, "id" | "createdAt" | "updatedAt" | "version" | "revisionDate">) => {
    const now = new Date().toISOString();
    
    if (qualityPolicy) {
      // Update existing
      const updated = {
        ...qualityPolicy,
        ...data,
        updatedAt: now,
        version: qualityPolicy.version + 1,
        revisionDate: now,
      };

      setQualityPolicy(updated);
      void updateRecord("leadership", updated.id, { ...updated, kind: "qualityPolicy" }).catch((error) => {
        console.error("Failed to update quality policy:", error);
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
      void createRecord("leadership", { ...newPolicy, kind: "qualityPolicy" }).catch((error) => {
        console.error("Failed to persist quality policy:", error);
      });
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
    void createRecord("leadership", { ...newReview, kind: "managementReview" }).catch((error) => {
      console.error("Failed to persist management review:", error);
    });
    return newReview;
  }, [generateReviewCode]);

  const updateManagementReview = useCallback((id: string, data: Partial<ManagementReviewData>, revisionNote?: string) => {
    const now = new Date().toISOString();
    setManagementReviews((prev) =>
      prev.map((review) => {
        if (review.id !== id) return review;

        const updated = {
          ...review,
          ...data,
          updatedAt: now,
          version: review.version + 1,
          revisionDate: now,
          revisionNote: revisionNote || data.revisionNote,
        };

        void updateRecord("leadership", id, { ...updated, kind: "managementReview" }).catch((error) => {
          console.error("Failed to update management review:", error);
        });

        return updated;
      })
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
