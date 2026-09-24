import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { get, set, del } from "idb-keyval";

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
  title: string;
  goal: string;
  time: string;
  channel: ChannelId;
  status: "draft" | "scheduled" | "posted";
  createdAt: number;
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

  setOnboardingStep: (n: number) => void;
  completeOnboarding: () => void;
  updateBusiness: (patch: Partial<BusinessProfile>) => void;
  setChannelConnected: (id: ChannelId, connected: boolean, handle?: string) => void;
  toggleAutopilot: () => void;
  addPosts: (posts: GeneratedPost[]) => void;
  markPostStatus: (id: string, status: GeneratedPost["status"]) => void;
  setLastGenerationAt: (t: number) => void;
  reset: () => void;
}

// IndexedDB-backed storage — handles MB-sized base64 images fine
const idbStorage = createJSONStorage(() => ({
  getItem: async (name: string) => (await get(name)) ?? null,
  setItem: async (name: string, value: string) => { await set(name, value); },
  removeItem: async (name: string) => { await del(name); },
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

      setOnboardingStep: (n) => set({ onboardingStep: n }),
      completeOnboarding: () => set({ onboardingComplete: true }),
      updateBusiness: (patch) => set((s) => ({ business: { ...s.business, ...patch } })),
      setChannelConnected: (id, connected, handle) =>
        set((s) => ({
          channels: s.channels.map((c) =>
            c.id === id
              ? { ...c, connected, handle: handle ?? c.handle, connectedAt: connected ? Date.now() : undefined }
              : c,
          ),
        })),
      toggleAutopilot: () => set((s) => ({ autopilotOn: !s.autopilotOn })),
      addPosts: (posts) => set((s) => ({ posts: [...posts, ...s.posts] })),
      markPostStatus: (id, status) =>
        set((s) => ({ posts: s.posts.map((p) => (p.id === id ? { ...p, status } : p)) })),
      setLastGenerationAt: (t) => set({ lastGenerationAt: t }),
      reset: () =>
        set({
          onboardingStep: 1,
          onboardingComplete: false,
          business: { name: "", niche: "", audience: "", offer: "", tone: "Friendly" },
          channels: DEFAULT_CHANNELS,
          autopilotOn: true,
          posts: [],
          lastGenerationAt: null,
        }),
    }),
    {
      name: "pulseboard-app-idb", // new key — old localStorage entry stays orphaned
      version: 1,
      storage: idbStorage,
    },
  ),
);
