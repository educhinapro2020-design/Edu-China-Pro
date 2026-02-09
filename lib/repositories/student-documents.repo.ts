import { createClient } from "@/lib/supabase/client";
import { StudentDocuments, StudentDocumentEntry } from "@/lib/types/student";
import { DocumentKey } from "@/lib/constants/documents";
import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET_NAME = "documents";

export const studentDocumentsRepository = {
  async getDocuments(
    userId: string,
    client?: SupabaseClient,
  ): Promise<StudentDocuments | null> {
    const supabase = client ?? createClient();
    const { data, error } = await supabase
      .from("student_documents")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      console.error("Error fetching student documents:", error);
      return null;
    }

    return data as unknown as StudentDocuments;
  },

  async uploadDocument(
    userId: string,
    file: File,
    docKey: DocumentKey,
    client?: SupabaseClient,
  ): Promise<{ path: string; url: string }> {
    const supabase = client ?? createClient();
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/${docKey}.${fileExt}`;

    const existing = await this.getDocuments(userId, supabase);
    const oldDoc = existing?.documents?.[docKey];
    if (oldDoc?.url) {
      const urlParts = oldDoc.url.split(`/${BUCKET_NAME}/`);
      if (urlParts[1]) {
        const oldPath = urlParts[1];
        if (oldPath !== filePath) {
          await supabase.storage.from(BUCKET_NAME).remove([oldPath]);
        }
      }
    }

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error("Error uploading document:", uploadError);
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    const existingDocs = existing?.documents || {};

    const newEntry: StudentDocumentEntry = {
      url: publicUrl,
      status: "uploaded",
      uploaded_at: new Date().toISOString(),
      file_name: file.name,
    };

    const updatedDocuments = {
      ...existingDocs,
      [docKey]: newEntry,
    };

    const { error: dbError } = await supabase.from("student_documents").upsert({
      id: userId,
      documents: updatedDocuments as any,
      updated_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error("Error updating document record:", dbError);
      throw dbError;
    }

    return { path: filePath, url: publicUrl };
  },
};
