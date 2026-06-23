import React, { useState } from "react";
import { Leaf, MapPin, Calendar, User, Download } from "lucide-react";
import { SectionHeader, PageHeader } from "../components/Shared";
import { runAdvisory, downloadAdvisoryPdf } from "../utils/api";
import { saveReport } from "../utils/reportStore";
import ReactMarkdown from 'react-markdown';
import { useLanguage } from "../contexts/LanguageContext";
import { getProfile } from "../utils/settingsStore";

export default function CropAnalysisPage() {
  const { t } = useLanguage();
  const profile = getProfile();
  
  const [cropType, setCropType] = useState("Wheat");
  const [location, setLocation] = useState(profile.location && profile.state ? `${profile.location}, ${profile.state}` : "Agra, Uttar Pradesh");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await runAdvisory(cropType, location, `Analyze crop health for ${cropType} in ${location}`, imageFile);
      setResult(data);
      // Persist report for Reports tab & Dashboard
      const reportText = typeof data.final_report === 'string' ? data.final_report : '';
      saveReport({
        id: data.session_id || `report-${Date.now()}`,
        crop: cropType,
        location: location,
        date: new Date().toISOString(),
        status: data.errors && Object.keys(data.errors).length > 0 ? "Action Required" : "Completed",
        summary: reportText.slice(0, 120),
        fullReport: reportText,
      });
    } catch (err: any) {
      setError(err.message || "Failed to run advisory pipeline.");
    } finally {
      setLoading(false);
    }
  };

  const todayStr = new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });

  const handleDownload = async () => {
    if (!result) return;
    const reportText = typeof result.final_report === 'string' ? result.final_report : '';
    try {
      await downloadAdvisoryPdf(result.session_id || "report", reportText);
    } catch (err) {
      alert("Failed to download PDF. The backend might not have wkhtmltopdf installed.");
    }
  };

  return (
    <div>
      <PageHeader
        title={t("crop.title")}
        subtitle={t("crop.subtitle")}
        right={
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">{t("crop.date")}</div>
            <div className="text-[12px] font-medium text-foreground">{todayStr}</div>
          </div>
        }
      />

      <section className="mb-8 pb-8 border-b border-border">
        <SectionHeader index="01" title={t("crop.newAnalysis")} subtitle={t("crop.uploadImage")} />
        <form onSubmit={handleSubmit} className="bg-[#fafafa] border border-border p-5 rounded-sm max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">{t("crop.cropType")}</label>
              <input 
                type="text" 
                value={cropType} 
                onChange={(e) => setCropType(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 text-[13px] outline-none focus:border-[#2d5a1b]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">{t("crop.location")}</label>
              <input 
                type="text" 
                value={location} 
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 text-[13px] outline-none focus:border-[#2d5a1b]"
                required
              />
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">{t("crop.cropImage")}</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full text-[12px] file:mr-4 file:py-2 file:px-4 file:border-0 file:text-[11px] file:uppercase file:tracking-widest file:bg-border file:text-foreground hover:file:bg-[#e5e5e5] transition-colors cursor-pointer"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full sm:w-auto bg-[#2d5a1b] text-white px-6 py-2.5 text-[12.5px] font-medium hover:bg-[#234715] transition-colors disabled:opacity-50"
          >
            {loading ? t("crop.analyzing") : t("crop.runAnalysis")}
          </button>
          {error && <div className="mt-3 text-[12px] text-red-600">{error}</div>}
        </form>
      </section>

      {loading && (
        <div className="text-center py-12 text-muted-foreground text-[13px]">
          <div className="inline-block w-5 h-5 border-2 border-border border-t-[#2d5a1b] rounded-full animate-spin mb-3"></div>
          <div>{t("crop.pipelineRunning")}</div>
        </div>
      )}

      {result && (
        <section className="mb-12">
          <SectionHeader index="02" title={t("crop.results")} subtitle={t("crop.generatedReport")} />
          
          <div className="bg-background border border-border p-6 rounded-sm">
            <div className="prose prose-sm max-w-none text-[13px] leading-relaxed text-foreground prose-headings:font-semibold prose-a:text-[#2d5a1b]">
              <ReactMarkdown>{
                typeof result.final_report === 'string' ? result.final_report
                : typeof result.report === 'string' ? result.report
                : JSON.stringify(result, null, 2)
              }</ReactMarkdown>
            </div>
          </div>
          
          <div className="mt-8 pt-5 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-[11px] text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">KisanMind</span> Agricultural Intelligence Platform
              <br />Ref: {result.session_id || "Session"} · {todayStr}
            </div>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 text-[12.5px] bg-[#2d5a1b] text-white px-4 py-2 rounded-sm hover:bg-[#234715] transition-colors font-medium flex-shrink-0"
            >
              <Download size={13} /> {t("crop.downloadPdf")}
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
