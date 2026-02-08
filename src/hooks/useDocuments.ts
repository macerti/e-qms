import { useState, useCallback, useEffect } from "react";
import { Document } from "@/types/management-system";
import { createRecord, fetchRecords, updateRecord } from "@/lib/records";

type CreateDocumentData = Omit<Document, "id" | "createdAt" | "updatedAt" | "code" | "version" | "revisionDate"> & { 
  code?: string;
};

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Load documents from the database once on mount.
  useEffect(() => {
    if (initialized) return;

    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        const remoteDocuments = await fetchRecords<Document>("documents");
        setDocuments(remoteDocuments);
        setInitialized(true);
      } catch (error) {
        console.error("Failed to load documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    void loadDocuments();
  }, [initialized]);

  const generateCode = useCallback(() => {
    const count = documents.length + 1;
    return `DOC-${count.toString().padStart(3, "0")}`;
  }, [documents.length]);

  const createDocument = useCallback((data: CreateDocumentData) => {
    const now = new Date().toISOString();
    const newDocument: Document = {
      id: crypto.randomUUID(),
      code: data.code || generateCode(),
      createdAt: now,
      updatedAt: now,
      version: 1,
      revisionDate: now,
      ...data,
    };
    setDocuments((prev) => [...prev, newDocument]);
    void createRecord("documents", newDocument).catch((error) => {
      console.error("Failed to persist document:", error);
    });
    return newDocument;
  }, [generateCode]);

  const updateDocument = useCallback((id: string, data: Partial<Document>, revisionNote?: string) => {
    const now = new Date().toISOString();
    setDocuments((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;

        const updated = {
          ...d,
          ...data,
          updatedAt: now,
          version: d.version + 1,
          revisionDate: now,
          revisionNote: revisionNote || data.revisionNote,
        };

        void updateRecord("documents", id, updated).catch((error) => {
          console.error("Failed to update document:", error);
        });

        return updated;
      }),
    );
  }, []);

  const archiveDocument = useCallback((id: string) => {
    updateDocument(id, { status: "archived" }, "Document archived");
  }, [updateDocument]);

  const getDocumentById = useCallback((id: string) => {
    return documents.find((d) => d.id === id);
  }, [documents]);

  const getDocumentsByProcess = useCallback((processId: string) => {
    return documents.filter((d) => d.processIds.includes(processId) && d.status !== "archived");
  }, [documents]);

  const getActiveDocuments = useCallback(() => {
    return documents.filter((d) => d.status === "active");
  }, [documents]);

  return {
    documents,
    isLoading,
    generateCode,
    createDocument,
    updateDocument,
    archiveDocument,
    getDocumentById,
    getDocumentsByProcess,
    getActiveDocuments,
  };
}
