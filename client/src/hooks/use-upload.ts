import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface UploadResponse {
  objectPath: string;
  metadata: {
    name: string;
    size: number;
    contentType: string;
  };
}

interface UseUploadOptions {
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: Error) => void;
}

export function useUpload(options: UseUploadOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(
    async (file: File): Promise<UploadResponse | null> => {
      setIsUploading(true);
      setError(null);
      setProgress(0);

      try {
        setProgress(10);

        // Generate a unique file path
        const fileExtension = file.name.split(".").pop() || "jpg";
        const fileName = `${crypto.randomUUID()}.${fileExtension}`;
        const filePath = `kyc/${fileName}`;

        setProgress(30);

        const { error: uploadError } = await supabase.storage
          .from("aadhar-documents")
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          });

       if (uploadError) {
  console.error("SUPABASE STORAGE UPLOAD ERROR:", uploadError);
  throw uploadError;
}

        setProgress(100);

        const response: UploadResponse = {
          objectPath: filePath,
          metadata: {
            name: file.name,
            size: file.size,
            contentType: file.type,
          },
        };

        options.onSuccess?.(response);

        return response;
      } catch (err) {
        const uploadError =
          err instanceof Error
            ? err
            : new Error("Failed to upload file");

        setError(uploadError);
        options.onError?.(uploadError);

        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [options]
  );

  return {
    uploadFile,
    isUploading,
    error,
    progress,
  };
}