import { studentRepository } from "@/lib/repositories/student.repo";
import { studentDocumentsRepository } from "@/lib/repositories/student-documents.repo";
import {
  StudentProfile,
  StudentDocuments,
  StudentDocumentEntry,
} from "@/lib/types/student";
import { DocumentKey } from "@/lib/constants/documents";

/**
 * Student service
 */
export const studentService = {
  async getProfile(userId: string): Promise<StudentProfile | null> {
    return studentRepository.getProfile(userId);
  },

  async updateProfile(
    userId: string,
    updates: Partial<StudentProfile>,
  ): Promise<StudentProfile | null> {
    return studentRepository.updateProfile(userId, updates);
  },

  async getDocuments(userId: string): Promise<StudentDocuments | null> {
    return studentDocumentsRepository.getDocuments(userId);
  },

  async uploadDocument(
    userId: string,
    file: File,
    docKey: DocumentKey,
  ): Promise<{ path: string; url: string }> {
    return studentDocumentsRepository.uploadDocument(userId, file, docKey);
  },

  /**
   * Check which of the given requirement keys the student already has.
   * Returns a record mapping each key to its document entry (or undefined).
   */
  async checkRequirements(
    userId: string,
    requirements: DocumentKey[],
  ): Promise<Partial<Record<DocumentKey, StudentDocumentEntry | undefined>>> {
    const docs = await studentDocumentsRepository.getDocuments(userId);
    if (!docs?.documents) return {};

    const result: Partial<
      Record<DocumentKey, StudentDocumentEntry | undefined>
    > = {};
    for (const key of requirements) {
      result[key] = docs.documents[key];
    }
    return result;
  },
};
