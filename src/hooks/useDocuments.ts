import { useState, useCallback, useEffect } from "react";
import { Document, DocumentAttachment, Process } from "@/types/management-system";
import { createRecord, deleteRecord, fetchRecords, updateRecord } from "@/lib/records";
import { createSeedDocuments } from "@/data/qmsDocuments";
import { createFallbackProcesses } from "@/data/default-processes";

type CreateDocumentData = Omit<Document, "id" | "createdAt" | "updatedAt" | "code" | "version" | "revisionDate"> & {
  code?: string;
};

function buildFallbackProcesses(): Process[] {
  return createFallbackProcesses();
}

function backfillMissingClauseReferences(documents: Document[]): Document[] {
  const seedByCode = new Map(createSeedDocuments().map((document) => [document.code, document.isoClauseReferences]));
  return documents.map((document) => {
    if ((document.isoClauseReferences?.length ?? 0) > 0) {
      return document;
    }
    const inferredClauses = seedByCode.get(document.code);
    return inferredClauses ? { ...document, isoClauseReferences: inferredClauses } : document;
  });
}

function attachDocumentsToProcesses(seedDocuments: Document[], processes: Process[]): Document[] {
  const processIdByKeyword = new Map<string, string>();

  const register = (keyword: string, processId: string) => {
    processIdByKeyword.set(keyword, processId);
  };

  processes.forEach((process) => {
    const n = process.name.toLowerCase();
    const c = process.code.toLowerCase();

    if (n.includes("human resources") || c === "pro-001") register("hr", process.id);
    if (n.includes("management") || c === "pro-002") register("management", process.id);
    if (n.includes("quality") || c === "pro-003") register("quality", process.id);
    if (n.includes("operational process 01") || c === "pro-004") register("op1", process.id);
    if (n.includes("operational process 02") || c === "pro-005") register("op2", process.id);
    if (n.includes("purchasing") || c === "pro-006") register("purchasing", process.id);
    if (n.includes("it process") || c === "pro-007") register("it", process.id);
    if (n.includes("administration process") || c === "pro-008") register("admin", process.id);
    if (n.includes("sales process") || c === "pro-009") register("sales", process.id);

    // Aliases for customized process names.
    if (n.includes("recruit") || n.includes("talent")) register("hr", process.id);
    if (n.includes("supplier") || n.includes("procurement")) register("purchasing", process.id);
  });


  const mapByCode = (code: string): string[] => {
    if (code.startsWith("MS-004")) return [processIdByKeyword.get("hr")].filter(Boolean) as string[];
    if (code.startsWith("MS-012") || code.startsWith("MS-011")) return [processIdByKeyword.get("management")].filter(Boolean) as string[];
    if (code.startsWith("MS-009") || code.startsWith("MS-010") || code.startsWith("MS-015")) return [processIdByKeyword.get("quality")].filter(Boolean) as string[];
    if (code.startsWith("MS-005") || code.startsWith("MS-008") || code.startsWith("MS-014")) return [processIdByKeyword.get("op1"), processIdByKeyword.get("op2"), processIdByKeyword.get("sales")].filter(Boolean) as string[];
    if (code.startsWith("MS-006") || code.startsWith("MS-007")) return [processIdByKeyword.get("op1"), processIdByKeyword.get("op2"), processIdByKeyword.get("purchasing")].filter(Boolean) as string[];
    if (code.startsWith("MS-002") || code.startsWith("MS-003") || code.startsWith("MS-001") || code.startsWith("MS-013")) {
      return Array.from(processIdByKeyword.values());
    }

    return [];
  };

  return seedDocuments.map((document) => ({ ...document, processIds: mapByCode(document.code) }));
}


function backfillMissingProcessLinks(documents: Document[], processes: Process[]): Document[] {
  const linkedFromCode = attachDocumentsToProcesses(documents, processes);
  const validProcessIds = new Set(processes.map((process) => process.id));

  return linkedFromCode.map((document, index) => {
    const current = documents[index];
    const existingValidIds = (current.processIds ?? []).filter((processId) => validProcessIds.has(processId));

    if (existingValidIds.length > 0) {
      return existingValidIds.length === current.processIds.length ? current : { ...current, processIds: existingValidIds };
    }

    return { ...current, processIds: document.processIds };
  });
}


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

        let processes: Process[] = [];
        try {
          processes = await fetchRecords<Process>("processes");
        } catch (processError) {
          console.warn("Failed to load processes for document linking, using fallback process list:", processError);
        }

        if (processes.length === 0) {
          processes = buildFallbackProcesses();
        }

        if (remoteDocuments.length === 0) {
          const seeded = createSeedDocuments();
          const linkedSeed = attachDocumentsToProcesses(seeded, processes);
          setDocuments(linkedSeed);
          await Promise.all(linkedSeed.map((document) => createRecord("documents", document)));
        } else {
          const backfilled = backfillMissingProcessLinks(remoteDocuments, processes);
          setDocuments(backfilled);

          // Persist inferred links for documents that were previously unlinked.
          await Promise.all(
            backfilled
              .filter((document, index) => (remoteDocuments[index].processIds ?? []).join("|") !== document.processIds.join("|") && document.processIds.length > 0)
              .map((document) => updateRecord("documents", document.id, document)),
          );
        }
        setInitialized(true);
      } catch (error) {
        console.error("Failed to load documents:", error);
        // Fallback: expose scaffold with process and clause links even when APIs are unavailable.
        const fallbackSeed = backfillMissingClauseReferences(attachDocumentsToProcesses(createSeedDocuments(), buildFallbackProcesses()));
        setDocuments(fallbackSeed);
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
