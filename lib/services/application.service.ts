import { createClient } from "@/lib/supabase/client";
import {
  ApplicationInsert,
  ApplicationNote,
  ApplicationStatus,
  ApplicationDocuments,
  UserDownload,
} from "@/lib/types/application";
import { DocumentKey } from "@/lib/constants/documents";
import { Json } from "@/lib/types/supabase";
import { applicationRepository } from "@/lib/repositories/application.repo";
import { programRepository } from "@/lib/repositories/program.repo";
import { studentDocumentsRepository } from "@/lib/repositories/student-documents.repo";

export const applicationService = {
  async createApplication(
    studentId: string,
    programId: string,
    universityId: string,
  ) {
    const program = await programRepository.getProgramById(programId);
    if (!program) throw new Error("Program not found");

    const requirements = (program.document_requirements as DocumentKey[]) || [];

    const studentDocs =
      await studentDocumentsRepository.getDocuments(studentId);
    const existingDocs = studentDocs?.documents || {};
    const initialAppDocs: ApplicationDocuments = {};

    requirements.forEach((key) => {
      if (existingDocs[key]) {
        initialAppDocs[key] = {
          url: existingDocs[key]!.url,
          status: "uploaded",
          uploaded_at: new Date().toISOString(),
          file_name: existingDocs[key]!.url.split("/").pop() || "",
        };
      }
    });

    const newApplication: ApplicationInsert = {
      student_id: studentId,
      program_id: programId,
      university_id: universityId,
      status: "draft",
      documents: initialAppDocs as unknown as Json,
    };

    return applicationRepository.createApplication(newApplication);
  },

  async getApplications(studentId: string) {
    return applicationRepository.getApplications(studentId);
  },

  async getApplicationById(id: string) {
    return applicationRepository.getApplicationById(id);
  },

  async updateStatus(id: string, status: ApplicationStatus) {
    return applicationRepository.updateStatus(id, status);
  },

  async uploadDocument(
    applicationId: string,
    key: DocumentKey,
    file: File,
    userId: string,
  ): Promise<string> {
    const supabase = createClient();

    const app =
      await applicationRepository.getApplicationWithDocuments(applicationId);
    if (!app) throw new Error("Application not found");

    const currentDocs = (app.documents as ApplicationDocuments) || {};
    const oldDoc = currentDocs[key];
    if (oldDoc?.url) {
      const urlParts = oldDoc.url.split("/documents/");
      if (urlParts[1]) {
        await supabase.storage.from("documents").remove([urlParts[1]]);
      }
    }

    const filePath = `${userId}/${applicationId}/${key}-${Date.now()}.${file.name.split(".").pop()}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(filePath);

    const newDocEntry = {
      url: publicUrl,
      status: "uploaded" as const,
      uploaded_at: new Date().toISOString(),
    };

    const updatedDocs = {
      ...currentDocs,
      [key]: newDocEntry,
    } as unknown as Json;

    await applicationRepository.updateApplicationDocuments(
      applicationId,
      updatedDocs,
    );

    return publicUrl;
  },

  async getNotes(applicationId: string) {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("application_notes")
      .select(
        `
        *,
        author:profiles(full_name, avatar_url)
      `,
      )
      .eq("application_id", applicationId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ApplicationNote[];
  },

  async addNote(applicationId: string, note: string, authorId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("application_notes").insert({
      application_id: applicationId,
      author_id: authorId,
      note,
    });

    if (error) throw error;
  },

  async assignCounselor(applicationId: string, counselorId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from("applications")
      .update({ counselor_id: counselorId })
      .eq("id", applicationId);

    if (error) throw error;
  },

  async uploadAdminDocument(
    applicationId: string,
    file: File,
    userId: string,
    title: string,
    description: string,
  ): Promise<string> {
    const supabase = createClient();
    const filePath = `${userId}/${applicationId}/admin_downloads/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(filePath);

    const app = await applicationRepository.getApplicationById(applicationId);
    if (!app) throw new Error("Application not found");

    const currentDownloads =
      (app.user_downloads as unknown as UserDownload[]) ?? [];
    const newDownload: UserDownload = {
      title,
      description: description || undefined,
      url: publicUrl,
      file_name: file.name,
      uploaded_at: new Date().toISOString(),
    };

    const updatedDownloads: UserDownload[] = [...currentDownloads, newDownload];

    await applicationRepository.updateUserDownloads(
      applicationId,
      updatedDownloads,
    );

    return publicUrl;
  },
};
