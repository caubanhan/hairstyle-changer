import { Camera, Download, LoaderCircle, Upload } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { AIAdviceCard } from './AIAdviceCard';
import { useImageUpload } from '../hooks/useImageUpload';
import { useAppStore } from '../store/useAppStore';

interface HairstyleSubmitResponse {
  taskId: string;
}

interface HairstyleStatusResponse {
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  imageUrl?: string;
  error?: string;
}

interface AdviceResponse {
  advice: string;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result);
      const base64 = result.split(',')[1] ?? '';
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}

export function UploadZone() {
  const uploadedImage = useAppStore((state) => state.uploadedImage);
  const uploadedImageUrl = useAppStore((state) => state.uploadedImageUrl);
  const selectedHairstyle = useAppStore((state) => state.selectedHairstyle);
  const resultImageUrl = useAppStore((state) => state.resultImageUrl);
  const generatedAdvice = useAppStore((state) => state.generatedAdvice);
  const isGenerating = useAppStore((state) => state.isGenerating);
  const setIsGenerating = useAppStore((state) => state.setIsGenerating);
  const setResultImageUrl = useAppStore((state) => state.setResultImageUrl);
  const setGeneratedAdvice = useAppStore((state) => state.setGeneratedAdvice);
  const clearResult = useAppStore((state) => state.clearResult);
  const resetUpload = useAppStore((state) => state.resetUpload);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const pollingIntervalRef = useRef<number | null>(null);

  const { isDragging, handleFileChange, handleDrop, handleDragLeave, handleDragOver } = useImageUpload();

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current !== null) {
        window.clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, []);

  const clearPollingInterval = () => {
    if (pollingIntervalRef.current !== null) {
      window.clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const API_URL = import.meta.env.VITE_API_URL;
  const requestAdvice = async (
    imageBase64: string,
    imageMediaType: 'image/jpeg' | 'image/png',
    hairstyleName: string,
  ): Promise<string> => {
    try {
    //   const response = await fetch('http://localhost:3000/api/advice', {
        const response = await fetch(`${API_URL}api/advice`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageBase64, imageMediaType, hairstyleName }),
      });

      if (!response.ok) {
        throw new Error(`Advice request failed with status ${response.status}`);
      }

      const data = (await response.json()) as AdviceResponse;
      if (!data.advice) {
        throw new Error('Advice response did not include text');
      }

      return data.advice;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown advice error';
      throw new Error(`Failed to get hairstyle advice: ${message}`);
    }
  };

  const pollHairstyleResult = async (taskId: string): Promise<string> => {
    try {
      return await new Promise((resolve, reject) => {
        let isRequestInFlight = false;
        let attempts = 0;
        const maxAttempts = Math.ceil(120000 / 3000);

        const checkStatus = async () => {
          if (isRequestInFlight) {
            return;
          }

          isRequestInFlight = true;
          attempts += 1;

          try {
            // const response = await fetch(`http://localhost:3000/api/hairstyle/status/${taskId}`);
            const response = await fetch(`${API_URL}api/hairstyle/status/${taskId}`);
            if (!response.ok) {
              throw new Error(`Status request failed with status ${response.status}`);
            }

            const statusData = (await response.json()) as HairstyleStatusResponse;

            if (statusData.status === 'SUCCESS') {
              clearPollingInterval();
              if (!statusData.imageUrl) {
                reject(new Error('Generation completed without an image URL'));
                return;
              }
              resolve(statusData.imageUrl);
              return;
            }

            if (statusData.status === 'FAILED') {
              clearPollingInterval();
              reject(new Error(statusData.error || 'Hairstyle generation failed'));
              return;
            }

            if (attempts >= maxAttempts) {
              clearPollingInterval();
              reject(new Error('Polling timeout after 2 minutes'));
            }
          } catch (error) {
            clearPollingInterval();
            const message = error instanceof Error ? error.message : 'Unknown polling error';
            reject(new Error(`Polling failed: ${message}`));
          } finally {
            isRequestInFlight = false;
          }
        };

        void checkStatus();
        pollingIntervalRef.current = window.setInterval(() => {
          void checkStatus();
        }, 3000);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown polling error';
      throw new Error(`pollHairstyleResult failed: ${message}`);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage || !uploadedImageUrl || !selectedHairstyle) {
      return;
    }

    setIsGenerating(true);
    clearPollingInterval();

    try {
      const base64 = await fileToBase64(uploadedImage);
      const imageMediaType: 'image/jpeg' | 'image/png' = uploadedImage.type === 'image/png' ? 'image/png' : 'image/jpeg';

    //   const submitResponse = await fetch('http://localhost:3000/api/hairstyle', {
        const submitResponse = await fetch(`${API_URL}api/hairstyle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64,
          hairstyleName: selectedHairstyle.name,
        }),
      });

      if (!submitResponse.ok) {
        throw new Error(`Hairstyle request failed with status ${submitResponse.status}`);
      }

      const submitData = (await submitResponse.json()) as HairstyleSubmitResponse;
      if (!submitData.taskId) {
        throw new Error('Backend did not return a taskId');
      }

      const advicePromise = requestAdvice(base64, imageMediaType, selectedHairstyle.name).catch(
        () =>
          `A ${selectedHairstyle.name} style can be a great match. Ask your stylist to adapt layering and volume around your natural hairline to keep the shape balanced with your face proportions.`,
      );

      const generatedImageUrl = await pollHairstyleResult(submitData.taskId);
      const adviceText = await advicePromise;

      setResultImageUrl(generatedImageUrl);
      setGeneratedAdvice(adviceText);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown generation error';
      setGeneratedAdvice(
        `We could not generate your ${selectedHairstyle.name} look right now (${message}). Try again with a clearer front-facing photo and even lighting.`,
      );
    } finally {
      clearPollingInterval();
      setIsGenerating(false);
    }
  };

  const downloadResult = () => {
    if (!resultImageUrl) {
      return;
    }

    const anchor = document.createElement('a');
    anchor.href = resultImageUrl;
    anchor.download = 'cut-gen-result.png';
    anchor.click();
  };

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <section
        className={`relative rounded-2xl border-2 bg-white p-8 text-center shadow-sm transition md:p-10 ${
          isDragging ? 'border-[#E8173A] bg-[#FFF7F8]' : 'border-[#E5E7EB]'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="user"
          className="hidden"
          onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
        />

        {!uploadedImageUrl ? (
          <>
            <button
              type="button"
              onClick={() => imageInputRef.current?.click()}
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#FEE2E6] text-[#E8173A] transition hover:bg-[#FBD3DB]"
              aria-label="Upload photo"
            >
              <Upload size={40} aria-hidden="true" />
            </button>
            <h2 className="mt-5 text-[22px] font-bold text-[#1A1A1A]">Upload your photo</h2>
            <p className="mt-2 text-sm text-[#6B7280]">Drag & drop or Click to choose your photo</p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full bg-[#E8173A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#C0122F]"
              >
                <Upload size={16} aria-hidden="true" />
                Choose Image
              </button>
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full border border-[#1F2937] bg-white px-5 py-2.5 text-sm font-medium text-[#111827] transition hover:bg-[#F9FAFB]"
              >
                <Camera size={16} aria-hidden="true" />
                Take Photo
              </button>
            </div>
            <p className="mt-3 text-xs font-medium text-[#9CA3AF]">JPG or PNG up to 10MB</p>
          </>
        ) : resultImageUrl ? (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[#E5E7EB] p-2">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#6B7280]">Before</p>
                <img
                  src={uploadedImageUrl}
                  alt="Original upload"
                  className="h-[260px] w-full rounded-lg object-contain"
                />
              </div>
              <div className="rounded-xl border border-[#F8C7D1] p-2">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-[#E8173A]">After</p>
                <img
                  src={resultImageUrl}
                  alt="Generated hairstyle result"
                  className="h-[260px] w-full rounded-lg object-contain"
                />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={downloadResult}
                className="inline-flex items-center gap-2 rounded-full border border-[#E8173A] px-5 py-2.5 text-sm font-medium text-[#E8173A] transition hover:bg-[#FFF2F4]"
              >
                <Download size={16} aria-hidden="true" />
                Download
              </button>
              <button
                type="button"
                onClick={clearResult}
                className="rounded-full bg-[#E8173A] px-6 py-2.5 text-sm font-medium text-white transition hover:bg-[#C0122F]"
              >
                Try Another Style
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="relative">
              <img
                src={uploadedImageUrl}
                alt="Uploaded preview"
                className="mx-auto max-h-[400px] w-full rounded-xl object-contain"
              />
              {selectedHairstyle ? (
                <span className="absolute right-3 top-3 rounded-full bg-[#E8173A] px-3 py-1 text-xs font-medium text-white shadow">
                  {selectedHairstyle.name}
                </span>
              ) : null}
            </div>

            {isGenerating ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/75 backdrop-blur-sm">
                <LoaderCircle className="h-8 w-8 animate-spin text-[#E8173A]" aria-hidden="true" />
                <p className="mt-3 text-sm font-medium text-[#1F2937]">
                  Applying {selectedHairstyle?.name ?? 'selected style'}...
                </p>
              </div>
            ) : null}

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={resetUpload}
                className="rounded-full border border-[#E8173A] px-5 py-2.5 text-sm font-medium text-[#E8173A] transition hover:bg-[#FFF2F4]"
              >
                Try Another Photo
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={!selectedHairstyle || isGenerating}
                className="rounded-full bg-[#E8173A] px-8 py-2.5 text-sm font-medium text-white transition hover:bg-[#C0122F] disabled:cursor-not-allowed disabled:bg-[#F2AAB6]"
              >
                Generate
              </button>
            </div>
          </>
        )}
      </section>

      {generatedAdvice ? <AIAdviceCard advice={generatedAdvice} /> : null}
    </div>
  );
}
