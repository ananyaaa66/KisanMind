import React, { useState, useEffect } from "react";
import { User, MapPin, Landmark, LandPlot, Save, Check, Languages, Brain, Key } from "lucide-react";
import { PageHeader, SectionHeader } from "../components/Shared";
import { getProfile, saveProfile, FarmerProfile } from "../utils/settingsStore";
import { useLanguage, Lang } from "../contexts/LanguageContext";
import { getModelInfo, switchModel } from "../utils/api";

export default function SettingsPage() {
  const { t, lang, setLang } = useLanguage();
  const [profile, setProfile] = useState<FarmerProfile>(getProfile());
  const [saved, setSaved] = useState(false);
  const [activeModel, setActiveModel] = useState("gemini");
  const [switchingModel, setSwitchingModel] = useState(false);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    getModelInfo().then(info => {
      if (info.provider) setActiveModel(info.provider);
    }).catch(console.error);
  }, []);

  const handleSave = async () => {
    saveProfile(profile);
    
    // Also save to Supabase so it's permanent
    const userRaw = localStorage.getItem("kisanmind_user");
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await fetch(`${API}/auth/update`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            name: profile.name,
            city: profile.location,
            state: profile.state,
            land_owned: profile.landAcres
          })
        });
        
        const data = await res.json();
        if (data.success && data.user) {
          localStorage.setItem("kisanmind_user", JSON.stringify(data.user));
        }
      } catch (e) {
        console.error("Failed to sync profile to cloud:", e);
      }
    }
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      setPasswordMessage("Password must be at least 6 characters.");
      return;
    }
    
    setChangingPassword(true);
    setPasswordMessage("");
    
    const userRaw = localStorage.getItem("kisanmind_user");
    if (userRaw) {
      try {
        const user = JSON.parse(userRaw);
        const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
        const res = await fetch(`${API}/auth/change-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: user.id,
            new_password: newPassword
          })
        });
        
        const data = await res.json();
        if (data.success) {
          setPasswordMessage("Password updated successfully!");
          setNewPassword("");
        } else {
          setPasswordMessage(
            typeof data.detail === "string"
              ? data.detail
              : Array.isArray(data.detail)
              ? data.detail[0]?.msg || "Failed to update password."
              : "Failed to update password."
          );
        }
      } catch (e) {
        console.error("Failed to change password:", e);
        setPasswordMessage("An error occurred.");
      }
    } else {
      setPasswordMessage("User not logged in.");
    }
    setChangingPassword(false);
  };

  const states = [
    "Andhra Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
    "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  ];

  return (
    <div>
      <PageHeader
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
      />

      {/* Language Section */}
      <section className="mb-8 pb-8 border-b border-border">
        <SectionHeader index="01" title={t("settings.language")} subtitle={t("settings.languageDesc")} />
        <div className="max-w-md">
          <div className="flex gap-0 border border-border w-fit">
            <button
              onClick={() => setLang("en")}
              className={`px-5 py-2.5 text-[13px] font-medium transition-colors border-r border-border flex items-center gap-2 ${
                lang === "en" ? "bg-foreground text-background" : "bg-background text-muted-foreground hover:text-foreground hover:bg-[#fafafa]"
              }`}
            >
              <Languages size={14} />
              English
            </button>
            <button
              onClick={() => setLang("hi")}
              className={`px-5 py-2.5 text-[13px] font-medium transition-colors flex items-center gap-2 ${
                lang === "hi" ? "bg-foreground text-background" : "bg-background text-muted-foreground hover:text-foreground hover:bg-[#fafafa]"
              }`}
            >
              🇮🇳 हिन्दी
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            {lang === "en" ? "Switch to Hindi for all navigation and labels." : "सभी नेविगेशन और लेबल के लिए हिंदी में बदलें।"}
          </p>
        </div>
      </section>

      {/* Model Section */}
      <section className="mb-8 pb-8 border-b border-border">
        <SectionHeader index="02" title={lang === "en" ? "AI Engine" : "एआई इंजन"} subtitle={lang === "en" ? "Select the backend AI provider" : "बैकएंड एआई प्रदाता चुनें"} />
        <div className="max-w-md">
          <div className="flex gap-0 border border-border w-fit">
            <button
              onClick={async () => {
                setSwitchingModel(true);
                try {
                  await switchModel("gemini");
                  setActiveModel("gemini");
                } catch(e) {
                  alert("Failed to switch model to Gemini");
                } finally {
                  setSwitchingModel(false);
                }
              }}
              disabled={switchingModel}
              className={`px-5 py-2.5 text-[13px] font-medium transition-colors border-r border-border flex items-center gap-2 ${
                activeModel === "gemini" ? "bg-foreground text-background" : "bg-background text-muted-foreground hover:text-foreground hover:bg-[#fafafa]"
              } disabled:opacity-50`}
            >
              <Brain size={14} />
              Google Gemini
            </button>
            <button
              onClick={async () => {
                setSwitchingModel(true);
                try {
                  await switchModel("groq");
                  setActiveModel("groq");
                } catch(e) {
                  alert("Failed to switch model to Groq");
                } finally {
                  setSwitchingModel(false);
                }
              }}
              disabled={switchingModel}
              className={`px-5 py-2.5 text-[13px] font-medium transition-colors flex items-center gap-2 ${
                activeModel === "groq" ? "bg-foreground text-background" : "bg-background text-muted-foreground hover:text-foreground hover:bg-[#fafafa]"
              } disabled:opacity-50`}
            >
              <Brain size={14} />
              Groq Cloud
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            {lang === "en" ? "Gemini is recommended for comprehensive intelligence. Groq provides ultra-fast inference." : "जेमिनी की सिफारिश व्यापक बुद्धिमत्ता के लिए की जाती है। ग्रोक बहुत तेज़ अनुमान प्रदान करता है।"}
          </p>
        </div>
      </section>

      {/* Profile Section */}
      <section className="mb-8">
        <SectionHeader index="03" title={t("settings.profile")} subtitle={t("settings.profileDesc")} />
        <div className="bg-[#fafafa] border border-border p-6 rounded-sm max-w-xl space-y-5">
          {/* Name */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
              <User size={11} /> {t("settings.name")}
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              placeholder={t("settings.namePlaceholder")}
              className="w-full bg-background border border-border px-3 py-2 text-[13px] outline-none focus:border-[#2d5a1b]"
            />
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
                <MapPin size={11} /> {t("settings.locationLabel")}
              </label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="e.g. Agra"
                className="w-full bg-background border border-border px-3 py-2 text-[13px] outline-none focus:border-[#2d5a1b]"
              />
              <p className="text-[10px] text-muted-foreground mt-1">{t("settings.locationHint")}</p>
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
                <Landmark size={11} /> {t("settings.stateLabel")}
              </label>
              <select
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                className="w-full bg-background border border-border px-3 py-2 text-[13px] outline-none focus:border-[#2d5a1b] appearance-none"
              >
                {states.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">{t("settings.stateHint")}</p>
            </div>
          </div>

          {/* Land */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
              <LandPlot size={11} /> {t("settings.landLabel")}
            </label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={profile.landAcres || ""}
              onChange={(e) => setProfile({ ...profile, landAcres: parseFloat(e.target.value) || 0 })}
              placeholder="e.g. 5"
              className="w-full bg-background border border-border px-3 py-2 text-[13px] outline-none focus:border-[#2d5a1b] max-w-[200px]"
            />
            <p className="text-[10px] text-muted-foreground mt-1">{t("settings.landHint")}</p>
          </div>

          {/* Save */}
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 text-[12.5px] font-medium transition-colors rounded-sm ${
              saved
                ? "bg-emerald-600 text-white"
                : "bg-[#2d5a1b] text-white hover:bg-[#234715]"
            }`}
          >
            {saved ? <><Check size={13} /> {t("settings.saved")}</> : <><Save size={13} /> {t("settings.save")}</>}
          </button>
        </div>
      </section>

      {/* Security Section */}
      <section className="mb-12">
        <SectionHeader index="04" title={lang === "en" ? "Security" : "सुरक्षा"} subtitle={lang === "en" ? "Manage your account security" : "अपने खाते की सुरक्षा प्रबंधित करें"} />
        <div className="bg-[#fafafa] border border-border p-6 rounded-sm max-w-xl space-y-5">
          <div>
            <label className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest text-muted-foreground mb-1.5">
              <Key size={11} /> {lang === "en" ? "New Password" : "नया पासवर्ड"}
            </label>
            <div className="flex gap-3">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={lang === "en" ? "Enter new password" : "नया पासवर्ड दर्ज करें"}
                className="w-full bg-background border border-border px-3 py-2 text-[13px] outline-none focus:border-[#2d5a1b] max-w-[280px]"
              />
              <button
                onClick={handleChangePassword}
                disabled={changingPassword || !newPassword}
                className="flex items-center justify-center gap-2 px-5 py-2 text-[12.5px] font-medium transition-colors rounded-sm bg-foreground text-background hover:opacity-90 disabled:opacity-50 whitespace-nowrap"
              >
                {changingPassword ? (lang === "en" ? "Updating..." : "अपडेट हो रहा है...") : (lang === "en" ? "Change Password" : "पासवर्ड बदलें")}
              </button>
            </div>
            {passwordMessage && (
              <p className={`text-[12px] mt-2 ${passwordMessage.includes("success") ? "text-emerald-600" : "text-red-600"}`}>
                {passwordMessage}
              </p>
            )}
            <p className="text-[10px] text-muted-foreground mt-1.5">
              {lang === "en" ? "Choose a strong password with at least 6 characters." : "कम से कम 6 अक्षरों वाला एक मजबूत पासवर्ड चुनें।"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
