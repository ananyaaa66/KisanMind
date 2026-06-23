/**
 * localStorage-backed farmer profile settings.
 * Used to personalize default values across the app:
 *   - location → Weather page default city
 *   - state → Government Schemes default state
 *   - landAcres → Included in scheme eligibility context
 */

export interface FarmerProfile {
  name: string;
  location: string;   // City/District (e.g. "Agra")
  state: string;      // State (e.g. "Uttar Pradesh")
  landAcres: number;  // Total land in acres
}

const SETTINGS_KEY = "kisanmind_profile";

const DEFAULT_PROFILE: FarmerProfile = {
  name: "",
  location: "Agra",
  state: "Uttar Pradesh",
  landAcres: 0,
};

export function getProfile(): FarmerProfile {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_PROFILE };
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_PROFILE };
  }
}

export function saveProfile(profile: FarmerProfile) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(profile));
}

export function getDefaultLocation(): string {
  return getProfile().location || "Agra";
}

export function getDefaultState(): string {
  return getProfile().state || "Uttar Pradesh";
}

export function getLandAcres(): number {
  return getProfile().landAcres || 0;
}
