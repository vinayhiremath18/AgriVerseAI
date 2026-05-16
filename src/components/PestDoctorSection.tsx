"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SectionHeading } from "./ui/Cards";

function ScannerUploadArea() {

  const [image, setImage] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<any>(null);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {

    const file = e.target.files?.[0];

    if (!file) return;

    setLoading(true);

    setResult(null);

    const imageUrl = URL.createObjectURL(file);

    setImage(imageUrl);

    // Compress image before sending
    const canvas = document.createElement("canvas");

    const img = new Image();

    img.src = imageUrl;

    img.onload = async () => {

      const ctx = canvas.getContext("2d");

      const maxWidth = 600;

      const scale = maxWidth / img.width;

      canvas.width = maxWidth;

      canvas.height = img.height * scale;

      ctx?.drawImage(
        img,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const compressedBase64 =
        canvas.toDataURL("image/jpeg", 0.6);

      // Strip "data:image/jpeg;base64," prefix for the API
      const base64Data = compressedBase64.split(",")[1];

      try {

        const response = await fetch(
          "/api/diagnose",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: "image/jpeg",
            }),
          }
        );

        const data = await response.json();

        console.log(data);

        setResult(data);

      } catch (error) {

        console.log(error);

      }

      setLoading(false);
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      className="relative"
    >

      <div className="relative rounded-3xl border border-green-500/20 bg-black/40 backdrop-blur-xl overflow-hidden min-h-[420px] flex items-center justify-center">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,255,100,0.08),transparent_70%)]" />

        {loading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-green-400 animate-pulse z-20" />
        )}

        <div className="relative z-10 flex flex-col items-center justify-center text-center px-6">

          {!image ? (
            <>
              <div className="w-28 h-28 rounded-full border border-green-500/30 bg-green-500/10 flex items-center justify-center shadow-[0_0_40px_rgba(0,255,100,0.2)] mb-6">

                <svg
                  width="50"
                  height="50"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-green-400"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>

              </div>

              <h3 className="text-2xl font-bold text-white mb-2">
                Upload Crop Image
              </h3>

              <p className="text-zinc-400 mb-6 max-w-sm">
                AI will analyze crop diseases and recommend treatments instantly.
              </p>

              <label className="cursor-pointer px-6 py-3 rounded-full bg-green-500 hover:bg-green-400 transition-all text-black font-bold shadow-[0_0_30px_rgba(0,255,100,0.4)]">

                Select Image

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />

              </label>
            </>
          ) : (
            <>
              <div className="relative w-full max-w-md">

                <img
                  src={image}
                  alt="Uploaded"
                  className="rounded-2xl border border-green-500/30 shadow-[0_0_30px_rgba(0,255,100,0.2)]"
                />

                {loading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">

                    <div className="text-green-400 text-lg font-bold animate-pulse">
                      Scanning Crop...
                    </div>

                  </div>
                )}

              </div>

              {!loading && (

                <div className="mt-6 glass-card p-5 rounded-2xl border border-green-500/20 bg-black/40 max-w-md w-full text-left">

                  <h4 className="text-xl font-bold text-green-400 mb-4">
                    Diagnosis Result
                  </h4>

                  <div className="space-y-2 text-sm">

                    {result?.error ? (
                      <p className="text-red-400">{result.error}</p>
                    ) : (
                      <>
                    <p className="text-white">
                      <span className="text-green-400 font-semibold">
                        Disease:
                      </span>{" "}
                      {result?.disease || "Analyzing..."}
                    </p>

                    <p className="text-white">
                      <span className="text-green-400 font-semibold">
                        Confidence:
                      </span>{" "}
                      {result?.confidence || "..."}
                    </p>

                    <p className="text-white">
                      <span className="text-green-400 font-semibold">
                        Treatment:
                      </span>{" "}
                      {result?.treatment || "..."}
                    </p>

                    <p className="text-white">
                      <span className="text-green-400 font-semibold">
                        Fertilizer:
                      </span>{" "}
                      {result?.fertilizer || "..."}
                    </p>

                    {result?.additionalInfo && (
                      <p className="text-zinc-400 text-xs mt-2">{result.additionalInfo}</p>
                    )}
                      </>
                    )}

                  </div>

                  <button
                    onClick={() => {
                      setImage(null);
                      setResult(null);
                    }}
                    className="mt-5 px-5 py-2 rounded-full border border-green-500/30 text-green-400 hover:bg-green-500/10 transition-all"
                  >
                    Scan Another
                  </button>

                </div>

              )}

            </>
          )}

        </div>

      </div>

    </motion.div>
  );
}

function DiagnosisCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {

  return (
    <div className="glass-card p-5 rounded-2xl border border-green-500/20 bg-black/40">

      <p className="text-zinc-400 text-xs uppercase tracking-widest mb-2">
        {title}
      </p>

      <h3 className="text-xl font-bold text-green-400">
        {value}
      </h3>

    </div>
  );
}

export default function PestDoctorSection() {

  return (
    <section
      id="pest-doctor"
      className="relative py-24 md:py-32 overflow-hidden bg-black"
    >

      <div className="max-w-7xl mx-auto px-6">

        <SectionHeading
          badge="AI Pest Doctor"
          title="Intelligent Crop"
          highlight="Protection"
          description="AI-powered crop disease analysis with futuristic agriculture diagnostics."
        />

        <div className="grid lg:grid-cols-2 gap-10 items-center">

          <ScannerUploadArea />

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-5"
          >

            <DiagnosisCard
              title="AI Detection"
              value="Vision Model Active"
            />

            <DiagnosisCard
              title="Analysis Speed"
              value="Real-Time"
            />

            <DiagnosisCard
              title="Detection Engine"
              value="NVIDIA AI"
            />

            <DiagnosisCard
              title="Crop Support"
              value="Multi-Crop"
            />

          </motion.div>

        </div>

      </div>

    </section>
  );
}