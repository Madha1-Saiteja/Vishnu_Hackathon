import React, { useMemo, useState } from "react";
import { BRAIN_API_URL } from "../config/api";

function MetricCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
      <p className="text-sm uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-red-600">{value}</p>
    </div>
  );
}

function BrainTumorAnalyzer() {
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  const handleAnalyze = async () => {
    if (!file) {
      setError("Please select an MRI image first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        `${BRAIN_API_URL}/analyze?language=${encodeURIComponent(language)}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.detail || "Analysis failed.");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  const imageSrc = (value) =>
    value ? (value.startsWith("data:") ? value : `data:image/png;base64,${value}`) : "";

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-red-100 px-6 pb-16 pt-36">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-red-500">
            New Feature
          </p>
          <h1 className="mt-4 text-5xl font-bold text-gray-900">Brain MRI Analysis</h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600">
            Upload an MRI scan to run brain tumor classification, Grad-CAM
            explainability, clinical reporting, and visual analysis directly from MediDoc AI.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="rounded-3xl bg-white p-8 shadow-xl ring-1 ring-red-100">
            <h2 className="text-2xl font-semibold text-gray-900">Upload MRI Scan</h2>
            <p className="mt-2 text-gray-600">
              Supported input: brain MRI image. The analyzer uses your published
              X-Brain backend.
            </p>

            <div className="mt-8 rounded-2xl border-2 border-dashed border-red-200 bg-red-50/60 p-8 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setFile(event.target.files?.[0] || null)}
                className="mx-auto block text-sm text-gray-700 file:mr-4 file:rounded-full file:border-0 file:bg-red-600 file:px-5 file:py-2.5 file:font-semibold file:text-white hover:file:bg-red-700"
              />
              <p className="mt-4 text-sm text-gray-500">
                Choose a brain MRI image to generate tumor insights.
              </p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-[1fr,auto]">
              <select
                value={language}
                onChange={(event) => setLanguage(event.target.value)}
                className="rounded-xl border border-red-200 px-4 py-3 outline-none focus:border-red-500"
              >
                <option value="en">English</option>
                <option value="hi">Hindi</option>
                <option value="te">Telugu</option>
                <option value="ta">Tamil</option>
              </select>
              <button
                onClick={handleAnalyze}
                disabled={loading || !file}
                className={`rounded-xl px-6 py-3 font-semibold text-white transition ${
                  loading || !file
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading ? "Analyzing..." : "Analyze MRI"}
              </button>
            </div>

            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            {previewUrl && (
              <div className="mt-8">
                <h3 className="mb-3 text-lg font-semibold text-gray-900">Selected Image</h3>
                <img
                  src={previewUrl}
                  alt="Selected MRI preview"
                  className="max-h-[420px] w-full rounded-2xl object-contain ring-1 ring-red-100"
                />
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-gray-950 p-8 text-white shadow-xl">
            <h2 className="text-2xl font-semibold">Included Capabilities</h2>
            <div className="mt-6 grid gap-4">
              {[
                "Tumor classification with confidence scores",
                "Grad-CAM explainability overlays",
                "Clinical report generation",
                "Tumor mask and segmentation-ready pipeline",
                "Multilingual report support",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        {result && (
          <div className="mt-10 space-y-8">
            <div className="grid gap-4 md:grid-cols-4">
              <MetricCard label="Prediction" value={result.classification.class_name} />
              <MetricCard
                label="Confidence"
                value={`${(result.classification.confidence * 100).toFixed(1)}%`}
              />
              <MetricCard
                label="Tumor Area"
                value={`${result.segmentation.tumor_area_pct.toFixed(2)}%`}
              />
              <MetricCard
                label="Inference Time"
                value={`${result.inference_time_ms} ms`}
              />
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900">Probability Scores</h3>
                <div className="mt-5 space-y-4">
                  {Object.entries(result.classification.probabilities).map(([key, value]) => (
                    <div key={key}>
                      <div className="mb-2 flex items-center justify-between text-sm font-medium text-gray-700">
                        <span className="capitalize">{key}</span>
                        <span>{(value * 100).toFixed(1)}%</span>
                      </div>
                      <div className="h-3 rounded-full bg-red-100">
                        <div
                          className="h-3 rounded-full bg-red-600"
                          style={{ width: `${Math.max(value * 100, 2)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900">Clinical Summary</h3>
                <div className="mt-5 space-y-4 text-gray-700">
                  <p>
                    <span className="font-semibold text-gray-900">Tumor type:</span>{" "}
                    {result.clinical_report.tumor_type}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Urgency:</span>{" "}
                    {result.clinical_report.urgency}
                  </p>
                  <p>{result.clinical_report.description}</p>
                  <p>{result.clinical_report.area_interpretation}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-3xl bg-white p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900">Explainability Images</h3>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {[
                    ["Original", result.images.original],
                    ["Grad-CAM Heatmap", result.images.gradcam_heatmap],
                    ["Grad-CAM Overlay", result.images.gradcam_overlay],
                    ["Segmentation Overlay", result.images.seg_overlay],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-red-100 p-3">
                      <p className="mb-3 text-sm font-semibold text-gray-700">{label}</p>
                      <img
                        src={imageSrc(value)}
                        alt={label}
                        className="h-48 w-full rounded-xl object-contain bg-gray-50"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-white p-6 shadow-lg">
                <h3 className="text-xl font-semibold text-gray-900">AI Report</h3>
                <div className="mt-5 rounded-2xl bg-red-50 p-5 text-gray-700 whitespace-pre-wrap">
                  {result.rag_report.llm_report}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default BrainTumorAnalyzer;
