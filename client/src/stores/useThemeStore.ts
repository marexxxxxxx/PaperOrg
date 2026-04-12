import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark'
export type ThemeColor = 'user-light' | 'user-dark' | 'modern-light' | 'modern-dark'

interface ThemeState {
  mode: ThemeMode
  colorScheme: ThemeColor
  setTheme: (mode: ThemeMode, color: ThemeColor) => void
  toggleMode: () => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      colorScheme: 'user-light',
      setTheme: (mode, colorScheme) => set({ mode, colorScheme }),
      toggleMode: () => set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'paperorg-theme',
    }
  )
)

export const themeColors: Record<ThemeColor, {
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  card: string
  border: string
}> = {
  'user-light': {
    name: 'User Light',
    primary: '#30A2FF',
    secondary: '#00C4FF',
    accent: '#FFE7A0',
    background: '#FFFFFF',
    foreground: '#1a1a2e',
    card: '#FFFFFF',
    border: '#E5E7EB',
  },
  'user-dark': {
    name: 'User Dark',
    primary: '#DFD0B8',
    secondary: '#948979',
    accent: '#FFE7A0',
    background: '#222831',
    foreground: '#DFD0B8',
    card: '#393E46',
    border: '#4A4F5A',
  },
  'modern-light': {
    name: 'Modern Light',
    primary: '#6366F1',
    secondary: '#8B5CF6',
    accent: '#F59E0B',
    background: '#F8FAFC',
    foreground: '#1E293B',
    card: '#FFFFFF',
    border: '#E2E8F0',
  },
  'modern-dark': {
    name: 'Modern Dark',
    primary: '#818CF8',
    secondary: '#A78BFA',
    accent: '#F59E0B',
    background: '#0F172A',
    foreground: '#F1F5F9',
    card: '#1E293B',
    border: '#334155',
  },
}