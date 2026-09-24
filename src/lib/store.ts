import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";
import { DEFAULT_BRAND, type BrandKit } from "./brand";

export type ChannelId = "facebook" | "instagram" | "tiktok";

export interface ConnectedChannel {
  id: ChannelId;
  name: string;
  handle: string;
  connected: boolean;
  connectedAt?: number;
}

export interface BusinessProfile {
  name: string;
  niche: string;
  audience: string;
  offer: string;
  tone: string;
}

export interface GeneratedPost {
  id: string;
  image: string;
  bgImage?: string;
  title: string;
  goal: string;
  time: string;
  channel: ChannelId;
  status: "draft" | "scheduled" | "posted";
  createdAt: number;
  /** Brand kit captured at generation time. Absent on pre-Phase-5 posts. */
  brandSnapshot?: BrandKit;
}

const DEFAULT_CHANNELS: ConnectedChannel[] = [
  { id: "facebook", name: "Facebook", handle: "facebook.com/yourbusiness", connected: false },
  { id: "instagram", name: "Instagram", handle: "@yourbusiness", connected: false },
  { id: "tiktok", name: "TikTok", handle: "@yourbusiness", connected: false },
];

interface AppState {
  onboardingStep: number;
  onboardingComplete: boolean;
  business: BusinessProfile;
  channels: ConnectedChannel[];
  autopilotOn: boolean;
  posts: GeneratedPost[];
  lastGenerationAt: number | null;
  brand: BrandKit;

  setOnboardingStep: (n: number) => void;
  completeOnboarding: () => void;
  updateBusiness: (patch: Partial<BusinessProfile>) => void;
  setChannelConnected: (id: ChannelId, connected: boolean, handle?: string) => void;
  toggleAutopilot: () => void;
  addPosts: (posts: GeneratedPost[]) => void;
  updatePost: (id: string, patch: Partial<GeneratedPost>) => void;
  markPostStatus: (id: string, status: GeneratedPost["status"]) => void;
  setLastGenerationAt: (t: number) => void;
  updateBrand: (patch: Partial<BrandKit>) => void;
  clearBrand: () => void;
  reset: () => void;
}

const idbStorage = createJSONStorage(() => ({
  getItem: async (name: string) => (await get(name)) ?? null,
  setItem: async (name: string, value: string) => {
    await set(name, value);
  },
  removeItem: async (name: string) => {
    await del(name);
  },
}));

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      onboardingStep: 1,
      onboardingComplete: false,
      business: { name: "", niche: "", audience: "", offer: "", tone: "Friendly" },
      channels: DEFAULT_CHANNELS,
      autopilotOn: true,
      posts: [],
      lastGenerationAt: null,
      brand: DEFAULT_BRAND,

      setOnboardingStep: (n) => set({ onboardingStep: n }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      updateBusiness: (patch) => set((s) => ({ business: { ...s.business, ...patch } })),
      setChannelConnected: (id, connected, handle) =>
        set((s) => ({
          channels: s.channels.map((c) =>
            c.id === id
              ? {
                  ...c,
                  connected,
                  handle: handle ?? c.handle,
                  connectedAt: connected ? Date.now() : undefined,
                }
              : c,
          ),
        })),
      toggleAutopilot: () => set((s) => ({ autopilotOn: !s.autopilotOn })),
      addPosts: (posts) => set((s) => ({ posts: [...posts, ...s.posts] })),
      updatePost: (id, patch) =>
        set((s) => ({ posts: s.posts.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      markPostStatus: (id, status) =>
        set((s) => ({ posts: s.posts.map((p) => (p.id === id ? { ...p, status } : p)) })),
      setLastGenerationAt: (t) => set({ lastGenerationAt: t }),

      updateBrand: (patch) => set((s) => ({ brand: { ...s.brand, ...patch, configured: true } })),

      clearBrand: () => set({ brand: DEFAULT_BRAND }),

      reset: () =>
        set({
          onboardingStep: 1,
          onboardingComplete: false,
          business: { name: "", niche: "", audience: "", offer: "", tone: "Friendly" },
          channels: DEFAULT_CHANNELS,
          autopilotOn: true,
          posts: [],
          lastGenerationAt: null,
          brand: DEFAULT_BRAND,
        }),
    }),
    {
      name: "pulseboard-app-idb",
      version: 3,
      storage: idbStorage,
      migrate: (persisted: unknown, version: number) => {
        const state = (persisted ?? {}) as Record<string, unknown>;
        if (version < 3) {
          return {
            ...state,
            brand: { ...DEFAULT_BRAND, ...(state.brand as object | undefined) },
          };
        }
        return state as never;
      },
    },
  ),
);
