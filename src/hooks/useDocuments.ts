import { useState, useCallback, useEffect } from "react";
import { Document, DocumentAttachment, Process } from "@/types/management-system";
import { createRecord, deleteRecord, fetchRecords, updateRecord } from "@/lib/records";
import { createSeedDocuments } from "@/data/qmsDocuments";

type CreateDocumentData = Omit<Document, "id" | "createdAt" | "updatedAt" | "code" | "version" | "revisionDate"> & {
  code?: string;
};

function attachDocumentsToProcesses(seedDocuments: Document[], processes: Process[]): Document[] {
  const processIdByKeyword = new Map<string, string>();

  const register = (keyword: string, processId: string) => {
    processIdByKeyword.set(keyword, processId);
  };

  processes.forEach((process) => {
    const n = process.name.toLowerCase();
    if (n.includes("human resources")) register("hr", process.id);
    if (n.includes("management")) register("management", process.id);
    if (n.includes("quality")) register("quality", process.id);
    if (n.includes("operational process 01")) register("op1", process.id);
    if (n.includes("operational process 02")) register("op2", process.id);
    if (n.includes("purchasing")) register("purchasing", process.id);
    if (n.includes("it process")) register("it", process.id);
    if (n.includes("administration process")) register("admin", process.id);
    if (n.includes("sales process")) register("sales", process.id);
  });

  const allKnownProcesses = Array.from(new Set(processIdByKeyword.values()));

  const ids = (...keys: string[]) => Array.from(new Set(keys.map((key) => processIdByKeyword.get(key)).filter(Boolean))) as string[];

  const mapByCodeAndMetadata = (document: Document): string[] => {
    const code = document.code;
    const textHint = `${document.title} ${document.purpose ?? ""}`.toLowerCase();
    const clauses = document.isoClauseReferences.map((clause) => clause.clauseNumber);

    // System-wide governance and documented information.
    if (code.startsWith("MS-001") || code.startsWith("MS-002") || code.startsWith("MS-003")) {
      return allKnownProcesses;
    }

    // Leadership and strategic review.
    if (code.startsWith("MS-011") || code.startsWith("MS-012")) {
      return ids("management", "quality");
    }

    // HR and competence controls.
    if (code.startsWith("MS-004") || textHint.includes("recruit") || textHint.includes("training") || textHint.includes("competence")) {
      return ids("hr");
    }

    // Infrastructure and knowledge support.
    if (code.startsWith("MS-013") || textHint.includes("infrastructure") || textHint.includes("knowledge")) {
      return ids("it", "admin", "hr", "op1", "op2");
    }

    // Core operations and customer journey.
    if (code.startsWith("MS-005") || code.startsWith("MS-006") || code.startsWith("MS-008") || code.startsWith("MS-014")) {
      return ids("op1", "op2", "sales", "quality");
    }

    // Supplier selection and purchasing controls.
    if (code.startsWith("MS-007") || textHint.includes("supplier") || textHint.includes("purchase")) {
      return ids("purchasing", "op1", "op2", "quality");
    }

    // QA, audit, corrective action and continual improvement.
    if (code.startsWith("MS-009") || code.startsWith("MS-010") || code.startsWith("MS-015")) {
      return ids("quality", "management");
    }

    // Clause-guided fallback when code is custom or manually created.
    const inferredByClause = new Set<string>();
    if (clauses.some((clause) => clause.startsWith("5."))) ids("management").forEach((id) => inferredByClause.add(id));
    if (clauses.some((clause) => clause.startsWith("7.1") || clause.startsWith("7.2") || clause.startsWith("7.3"))) ids("hr", "it", "admin").forEach((id) => inferredByClause.add(id));
    if (clauses.some((clause) => clause.startsWith("8.2"))) ids("sales", "op1", "op2").forEach((id) => inferredByClause.add(id));
    if (clauses.some((clause) => clause.startsWith("8.4"))) ids("purchasing").forEach((id) => inferredByClause.add(id));
    if (clauses.some((clause) => clause.startsWith("9.") || clause.startsWith("10."))) ids("quality", "management").forEach((id) => inferredByClause.add(id));

    const inferred = Array.from(inferredByClause);
    return inferred.length > 0 ? inferred : allKnownProcesses;
  };

  return seedDocuments.map((document) => ({ ...document, processIds: mapByCodeAndMetadata(document) }));
}


function backfillMissingProcessLinks(documents: Document[], processes: Process[]): Document[] {
  const linkedFromCode = attachDocumentsToProcesses(documents, processes);
  return linkedFromCode.map((document, index) => {
    const current = documents[index];
    if ((current.processIds?.length ?? 0) > 0) {
      return current;
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
        if (remoteDocuments.length === 0) {
          const seeded = createSeedDocuments();
          const processes = await fetchRecords<Process>("processes");
          const linkedSeed = attachDocumentsToProcesses(seeded, processes);
          setDocuments(linkedSeed);
          await Promise.all(linkedSeed.map((document) => createRecord("documents", document)));
        } else {
          const processes = await fetchRecords<Process>("processes");
          const backfilled = backfillMissingProcessLinks(remoteDocuments, processes);
          setDocuments(backfilled);

          // Persist inferred links for documents that were previously unlinked.
          await Promise.all(
            backfilled
              .filter((document, index) => (remoteDocuments[index].processIds?.length ?? 0) === 0 && document.processIds.length > 0)
              .map((document) => updateRecord("documents", document.id, document)),
          );
        }
        setInitialized(true);
      } catch (error) {
        console.error("Failed to load documents:", error);
        // Fallback: still expose the ISO scaffold locally so the app is usable
        // even when the API is down or tenant records are not reachable.
        const fallbackSeed = attachDocumentsToProcesses(createSeedDocuments(), []);
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
