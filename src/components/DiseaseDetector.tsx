"use client";

import { useState } from "react";

function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            // Strip the "data:image/...;base64," prefix
            resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
    });
}

export default function DiseaseDetector() {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUpload = async () => {
        if (!image) return;

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const base64 = await readFileAsBase64(image);

            const response = await fetch("/api/diagnose", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    imageBase64: base64,
                    mimeType: image.type || "image/jpeg",
                }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "Analysis failed");
            setResult(data);
        } catch (err: any) {
            setError(err.message ?? "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="ai-detector" className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6">

            <h2 className="text-5xl font-bold text-green-400 mb-10">
                AI Disease Detector
            </h2>

            <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                        setImage(file);
                        setPreview(URL.createObjectURL(file));
                        setResult(null);
                        setError(null);
                    }
                }}
                className="mb-6"
            />

            {preview && (
                <img
                    src={preview}
                    alt="Selected crop"
                    className="mb-6 max-h-64 rounded-2xl border border-green-700 object-contain"
                />
            )}

            <button
                onClick={handleUpload}
                className="px-8 py-4 bg-green-500 rounded-full text-black font-bold hover:bg-green-400 transition-all"
            >
                {loading ? "Analyzing..." : "Analyze Crop"}
            </button>

            {error && (
                <p className="mt-6 text-red-400 font-semibold">{error}</p>
            )}

            {result && (
                <div className="mt-10 bg-zinc-900 border border-green-500 p-8 rounded-3xl max-w-xl w-full shadow-[0_0_40px_rgba(34,197,94,0.4)]">

                    <h3 className="text-3xl font-bold text-green-400 mb-4">
                        Diagnosis Result
                    </h3>

                    <p className="mb-2">
                        <span className="font-bold">Disease:</span> {result.disease}
                    </p>

                    <p className="mb-2">
                        <span className="font-bold">Confidence:</span> {result.confidence}
                    </p>

                    <p className="mb-2">
                        <span className="font-bold">Treatment:</span> {result.treatment}
                    </p>

                    <p className="mb-2">
                        <span className="font-bold">Fertilizer:</span> {result.fertilizer}
                    </p>

                    {result.additionalInfo && (
                        <p className="mt-4 text-sm text-zinc-400">{result.additionalInfo}</p>
                    )}

                </div>
            )}
        </div>
    );
}