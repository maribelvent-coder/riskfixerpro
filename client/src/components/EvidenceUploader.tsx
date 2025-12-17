import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Camera, Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface EvidenceUploaderProps {
  assessmentId: string;
  questionId: string;
  questionType: "facility" | "assessment";
  evidence: string[];
  onUpdate: () => void;
}

export function EvidenceUploader({
  assessmentId,
  questionId,
  questionType,
  evidence,
  onUpdate,
}: EvidenceUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Get presigned upload URL from server
      const urlRes = await apiRequest(
        "POST",
        `/api/assessments/${assessmentId}/evidence/upload-url`,
        {
          questionId,
          questionType,
          filename: file.name,
        }
      );
      const urlResponse = await urlRes.json() as { uploadURL: string; evidencePath: string; method: string };

      // Step 2: Upload file directly to presigned URL
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 100);
            setUploadProgress(progress);
          }
        });

        xhr.addEventListener("load", () => {
          setUploadProgress(null);
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        });

        xhr.addEventListener("error", () => {
          setUploadProgress(null);
          reject(new Error("Network error during upload"));
        });

        xhr.open("PUT", urlResponse.uploadURL);
        xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
        xhr.send(file);
      });

      // Step 3: Register the upload with the server
      await apiRequest(
        "POST",
        `/api/assessments/${assessmentId}/evidence/register`,
        {
          questionId,
          questionType,
          evidencePath: urlResponse.evidencePath,
          filename: file.name,
        }
      );

      return { success: true, evidencePath: urlResponse.evidencePath };
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Photo uploaded successfully",
      });
      onUpdate();
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (evidencePath: string) => {
      return apiRequest(
        "DELETE",
        `/api/assessments/${assessmentId}/evidence`,
        {
          questionId,
          questionType,
          evidencePath,
        }
      );
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Photo deleted successfully",
      });
      onUpdate();
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 10MB",
          variant: "destructive",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Only image files are allowed",
          variant: "destructive",
        });
        return;
      }

      uploadMutation.mutate(file);
    }
    event.target.value = "";
  };

  const handleDelete = (evidencePath: string) => {
    if (confirm("Are you sure you want to delete this photo?")) {
      deleteMutation.mutate(evidencePath);
    }
  };

  if (evidence.length >= 10) {
    return (
      <div className="text-sm text-muted-foreground">
        Maximum of 10 photos reached
      </div>
    );
  }

  const handleTakePhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.setAttribute('capture', 'environment');
      fileInputRef.current.click();
    }
  };

  const handleUploadPhoto = () => {
    if (fileInputRef.current) {
      fileInputRef.current.removeAttribute('capture');
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          data-testid={`input-file-${questionId}`}
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTakePhoto}
          disabled={uploadMutation.isPending || uploadProgress !== null}
          data-testid={`button-camera-${questionId}`}
        >
          {uploadMutation.isPending || uploadProgress !== null ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              {uploadProgress !== null ? `${uploadProgress}%` : "Uploading..."}
            </>
          ) : (
            <>
              <Camera className="h-3 w-3 mr-1" />
              Take Photo
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleUploadPhoto}
          disabled={uploadMutation.isPending || uploadProgress !== null}
          data-testid={`button-upload-${questionId}`}
        >
          {uploadMutation.isPending || uploadProgress !== null ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              {uploadProgress !== null ? `${uploadProgress}%` : "Uploading..."}
            </>
          ) : (
            <>
              <Upload className="h-3 w-3 mr-1" />
              Upload Photo
            </>
          )}
        </Button>
      </div>

      {evidence.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 max-w-2xl">
          {evidence.map((path, index) => (
            <Card
              key={path}
              className="relative group overflow-hidden aspect-square max-w-[120px]"
              data-testid={`card-evidence-${questionId}-${index}`}
            >
              <img
                src={path}
                alt={`Evidence ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3ENo image%3C/text%3E%3C/svg%3E";
                }}
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(path)}
                  disabled={deleteMutation.isPending}
                  data-testid={`button-delete-${questionId}-${index}`}
                >
                  <X className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {evidence.length === 0 && (
        <div className="border-2 border-dashed rounded-md p-4 text-center text-sm text-muted-foreground">
          <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
          No photos uploaded yet
        </div>
      )}
    </div>
  );
}
