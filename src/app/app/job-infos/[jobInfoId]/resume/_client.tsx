"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { cn } from "@/lib/utils";
import { aiAnalyzeSchema } from "@/services/ai/resumes/schemas";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { UploadIcon } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

export function ResumePageClient({ jobInfoId }: { jobInfoId: string }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileRef = useRef<File | null>(null);

  const {
    object: aiAnalysis,
    isLoading,
    submit: generateAnalysis,
  } = useObject({
    api: "/api/ai/resumes/analyze",
    schema: aiAnalyzeSchema,
    fetch: (url, options) => {
      const headers = new Headers(options?.headers || {});
      headers.delete("Content-Type");

      const formData = new FormData();
      if (fileRef.current) {
        formData.append("resume", fileRef.current);
      }
      formData.append("jobInfoId", jobInfoId);

      return fetch(url, { ...options, headers, body: formData });
    },
  });

  function handleFileUpload(file: File | null) {
    fileRef.current = file;
    if (file == null) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Unsupported file format. Please upload a PDF, Word document, or text file.");
      return;
    }

    generateAnalysis(null);
  }

  return (
    <div className="space-y-8 w-full">
      <Card>
        <CardHeader>
          <CardTitle>{isLoading ? "Analyzing your resume..." : "Upload your resume"}</CardTitle>
          <CardDescription>
            {isLoading
              ? "This may take a couple minutes"
              : "Get personalized feedback on how well your resume matches the job description and suggestions for improvement"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSwap loadingIconClassName="size-16" isLoading={isLoading}>
            <div
              className={cn(
                "mt-2 border-2 border-dashed rounded-lg p-6 transition-colors relative",
                isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/50 bg-muted/10"
              )}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                handleFileUpload(e.dataTransfer.files[0] ?? null);
              }}
            >
              <label htmlFor="resume-upload" className="sr-only">
                Upload your resume
              </label>
              <input
                type="file"
                id="resume-upload"
                accept=".pdf,.doc,.docx,.txt"
                className="opacity-0 absolute inset-0 cursor-pointer"
                onChange={(e) => {
                  handleFileUpload(e.target.files?.[0] ?? null);
                }}
              />
              <div className="flex flex-col items-center justify-center text-center gap-2">
                <UploadIcon className="size-12 text-muted-foreground" />
                <div className="space-y-2">
                  <p className="text-lg">Drag your resume here or click to upload</p>
                  <p className="text-xs text-muted-foreground">Supported formats: PDF, Word docs, and text files</p>
                </div>
              </div>
            </div>
          </LoadingSwap>
        </CardContent>
      </Card>
    </div>
  );
}
