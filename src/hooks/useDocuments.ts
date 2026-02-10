import { useState, useCallback, useEffect } from "react";
import { Document, DocumentAttachment } from "@/types/management-system";
import { createRecord, deleteRecord, fetchRecords, updateRecord } from "@/lib/records";
import { createSeedDocuments } from "@/data/qmsDocuments";

type CreateDocumentData = Omit<Document, "id" | "createdAt" | "updatedAt" | "code" | "version" | "revisionDate"> & {
  code?: string;
};

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    const loadDocuments = async () => {
      setIsLoading(true);
      try {
        const remoteDocuments = await fetchRecords<Document>("documents");
        if (remoteDocuments.length === 0) {
          const seeded = createSeedDocuments();
          setDocuments(seeded);
          await Promise.all(seeded.map((document) => createRecord("documents", document)));
        } else {
          setDocuments(remoteDocuments);
        }
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

  const createDocument = useCallback(
    (data: CreateDocumentData) => {
      const now = new Date().toISOString();
      const newDocument: Document = {
        id: crypto.randomUUID(),
        code: data.code || generateCode(),
        createdAt: now,
        updatedAt: now,
        version: 1,
        revisionDate: now,
        attachments: [],
        mergedDocumentIds: [],
        ...data,
      };
      setDocuments((prev) => [...prev, newDocument]);
      void createRecord("documents", newDocument).catch((error) => {
        console.error("Failed to persist document:", error);
      });
      return newDocument;
    },
    [generateCode],
  );

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

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((document) => document.id !== id));
    void deleteRecord("documents", id).catch((error) => {
      console.error("Failed to delete document:", error);
    });
  }, []);

  const mergeDocuments = useCallback(
    (sourceId: string, targetId: string) => {
      const source = documents.find((item) => item.id === sourceId);
      const target = documents.find((item) => item.id === targetId);
      if (!source || !target || source.id === target.id) {
        return;
      }

      const mergedAttachmentIds = new Set((target.attachments ?? []).map((attachment) => attachment.id));
      const mergedAttachments = [...(target.attachments ?? [])];
      (source.attachments ?? []).forEach((attachment) => {
        if (!mergedAttachmentIds.has(attachment.id)) {
          mergedAttachments.push(attachment);
        }
      });

      updateDocument(
        target.id,
        {
          mergedDocumentIds: [...(target.mergedDocumentIds ?? []), source.id],
          attachments: mergedAttachments,
        },
        `Merged ${source.code} into ${target.code}`,
      );

      updateDocument(source.id, { status: "archived" }, `Merged into ${target.code}`);

      // Move children forms/records under the target procedure.
      documents
        .filter((item) => item.parentProcedureId === source.id)
        .forEach((child) => {
          updateDocument(child.id, { parentProcedureId: target.id }, `Re-linked after merge into ${target.code}`);
        });
    },
    [documents, updateDocument],
  );

  const uploadDocumentAttachment = useCallback(
    (id: string, attachment: DocumentAttachment) => {
      const existing = documents.find((d) => d.id === id);
      if (!existing) return;
      const nextAttachments = [...(existing.attachments ?? []), attachment];
      updateDocument(id, { attachments: nextAttachments }, "Attachment uploaded");
    },
    [documents, updateDocument],
  );

  const removeDocumentAttachment = useCallback(
    (id: string, attachmentId: string) => {
      const existing = documents.find((d) => d.id === id);
      if (!existing) return;
      const nextAttachments = (existing.attachments ?? []).filter((attachment) => attachment.id !== attachmentId);
      updateDocument(id, { attachments: nextAttachments }, "Attachment removed");
    },
    [documents, updateDocument],
  );

  const archiveDocument = useCallback(
    (id: string) => {
      updateDocument(id, { status: "archived" }, "Document archived");
    },
    [updateDocument],
  );

  const getDocumentById = useCallback(
    (id: string) => {
      return documents.find((d) => d.id === id);
    },
    [documents],
  );

  const getDocumentsByProcess = useCallback(
    (processId: string) => {
      return documents.filter((d) => d.processIds.includes(processId) && d.status !== "archived");
    },
    [documents],
  );

  const getActiveDocuments = useCallback(() => {
    return documents.filter((d) => d.status === "active");
  }, [documents]);

  return {
    documents,
    isLoading,
    generateCode,
    createDocument,
    updateDocument,
    deleteDocument,
    mergeDocuments,
    uploadDocumentAttachment,
    removeDocumentAttachment,
    archiveDocument,
    getDocumentById,
    getDocumentsByProcess,
    getActiveDocuments,
  };
}
