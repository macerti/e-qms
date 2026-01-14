import { useState, useCallback } from "react";
import { Document } from "@/types/management-system";

type CreateDocumentData = Omit<Document, "id" | "createdAt" | "updatedAt" | "code" | "version" | "revisionDate"> & { 
  code?: string;
};

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
    return newDocument;
  }, [generateCode]);

  const updateDocument = useCallback((id: string, data: Partial<Document>, revisionNote?: string) => {
    const now = new Date().toISOString();
    setDocuments((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              ...data,
              updatedAt: now,
              version: d.version + 1,
              revisionDate: now,
              revisionNote: revisionNote || data.revisionNote,
            }
          : d
      )
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
