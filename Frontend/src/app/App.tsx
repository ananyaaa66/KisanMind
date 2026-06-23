import React, { useState } from "react";
import { LayoutDashboard, Leaf, TrendingUp, FileText, Cloud, BarChart3, ChevronRight, Menu, Download, Settings } from "lucide-react";
import DashboardPage from "../screens/DashboardPage";
import CropAnalysisPage from "../screens/CropAnalysisPage";
import MarketForecastPage from "../screens/MarketForecastPage";
import GovernmentSchemesPage from "../screens/GovernmentSchemesPage";
import WeatherPage from "../screens/WeatherPage";
import ReportsPage from "../screens/ReportsPage";
import SettingsPage from "../screens/SettingsPage";
import { useLanguage } from "../contexts/LanguageContext";
import { getProfile } from "../utils/settingsStore";
import { syncReportsFromBackend } from "../utils/reportStore";

type PageId = "dashboard" | "crop" | "market" | "schemes" | "weather" | "reports" | "settings";

export default function App() {
  const { t } = useLanguage();
  const profile = getProfile();
  const [activePage, setActivePage] = useState<PageId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  React.useEffect(() => {
    syncReportsFromBackend();
  }, []);

  const NAV_ITEMS: { id: PageId; labelKey: string; icon: any }[] = [
    { id: "dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
    { id: "crop", labelKey: "nav.crop", icon: Leaf },
    { id: "market", labelKey: "nav.market", icon: TrendingUp },
    { id: "schemes", labelKey: "nav.schemes", icon: FileText },
    { id: "weather", labelKey: "nav.weather", icon: Cloud },
    { id: "reports", labelKey: "nav.reports", icon: BarChart3 },
    { id: "settings", labelKey: "nav.settings", icon: Settings },
  ];

  const pageTitle: Record<PageId, string> = {
    dashboard: t("dash.title"),
    crop: t("crop.title"),
    market: t("market.title"),
    schemes: t("schemes.title"),
    weather: t("weather.title"),
    reports: t("reports.title"),
    settings: t("settings.title"),
  };

  function renderPage() {
    switch (activePage) {
      case "dashboard": return <DashboardPage navigate={setActivePage} />;
      case "crop":      return <CropAnalysisPage />;
      case "market":    return <MarketForecastPage />;
      case "schemes":   return <GovernmentSchemesPage />;
      case "weather":   return <WeatherPage />;
      case "reports":   return <ReportsPage />;
      case "settings":  return <SettingsPage />;
    }
  }

  const contextItems = [
    profile.name || "Kisan",
    profile.location ? `${profile.location}, ${profile.state}` : t("dash.subtitle"),
    profile.landAcres ? `${profile.landAcres} Acres` : ""
  ].filter(Boolean);

  return (
    <div className="flex h-screen bg-background overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/20 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-[210px] border-r border-border flex flex-col flex-shrink-0 bg-background transition-transform duration-200 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="h-[52px] flex items-center px-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 flex-shrink-0">
              <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2C10 2 5 7 5 12C5 14.76 7.24 17 10 17C12.76 17 15 14.76 15 12C15 7 10 2 10 2Z" fill="#2d5a1b" fillOpacity="0.15" stroke="#2d5a1b" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M10 17V19" stroke="#2d5a1b" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M10 8L13 11" stroke="#2d5a1b" strokeWidth="1.2" strokeLinecap="round"/>
                <path d="M10 10L7 12" stroke="#2d5a1b" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-[14px] font-semibold tracking-tight text-foreground">
              Kisan<span className="text-[#2d5a1b]">Mind</span>
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 px-2 overflow-y-auto">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 mb-2 mt-1">{t("nav.platform")}</div>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-[7px] rounded-sm text-[13px] text-left transition-colors mb-px ${active ? "bg-[#edf3e8] text-[#2d5a1b] font-medium" : "text-muted-foreground hover:text-foreground hover:bg-[#f5f5f4]"}`}
              >
                <Icon size={14} strokeWidth={active ? 2 : 1.5} />
                {t(item.labelKey)}
              </button>
            );
          })}

          <div className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 mb-2 mt-5">{t("nav.context")}</div>
          {contextItems.map((item, i) => (
            <div key={i} className="px-3 py-[5px] text-[11.5px] text-muted-foreground">{item}</div>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-border flex-shrink-0">
          <div className="text-[11px] text-muted-foreground leading-relaxed">
            UP Agricultural Intelligence<br />
            <span className="text-[10px] opacity-70">v2.4.1 · Ministry of Agriculture</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-[52px] border-b border-border flex items-center justify-between px-5 lg:px-8 bg-background flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(true)}>
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-1.5 text-[12px]">
              <span className="text-muted-foreground hidden sm:block">KisanMind</span>
              <ChevronRight size={12} className="text-muted-foreground hidden sm:block" />
              <span className="text-foreground font-medium">{pageTitle[activePage]}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-muted-foreground hidden md:block">
              {profile.location || "Agra Dist."} · {profile.name || "Farmer"}
            </span>
            {activePage === "crop" && (
              <button className="flex items-center gap-1.5 text-[12px] bg-foreground text-background px-3 py-1.5 rounded-sm hover:opacity-90 transition-opacity font-medium">
                <Download size={12} />
                <span className="hidden sm:block">{t("crop.downloadPdf")}</span>
              </button>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-5 lg:px-10 py-8">
            {renderPage()}
          </div>
        </main>
      </div>
    </div>
  );
}
