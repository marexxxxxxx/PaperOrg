import { useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Users, 
  Ticket, 
  GitBranch, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useThemeStore } from '@/stores/useThemeStore'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/agents', label: 'Agents', icon: Users },
  { to: '/tickets', label: 'Tickets', icon: Ticket },
  { to: '/roadmaps', label: 'Roadmaps', icon: GitBranch },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Layout({ children }: { children: React.ReactNode }) {
  const { mode, colorScheme, toggleMode } = useThemeStore()
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', colorScheme)
    if (colorScheme === 'user-dark' || colorScheme === 'modern-dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [colorScheme])

  return (
    <div className="min-h-screen flex">
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full z-40 transition-all duration-300 ease-in-out",
          "border-r border-border",
          collapsed ? "w-20" : "w-64",
          "bg-card"
        )}
      >
        <div className="flex flex-col h-full">
          <div className={cn(
            "h-16 flex items-center border-b border-border px-4",
            collapsed ? "justify-center" : "justify-between"
          )}>
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="font-bold text-lg">PaperOrg</span>
              </div>
            )}
            {collapsed && (
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
            )}
          </div>

          <nav className="flex-1 py-4 px-3 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                    "hover:bg-muted hover-lift",
                    isActive && [
                      "bg-primary/10 text-primary",
                      "hover:bg-primary/15"
                    ],
                    !isActive && "text-muted-foreground"
                  )
                }
              >
                <item.icon className={cn(
                  "w-5 h-5 flex-shrink-0",
                  location.pathname === item.to && "text-primary"
                )} />
                {!collapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="p-3 border-t border-border">
            <button
              onClick={toggleMode}
              className={cn(
                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg",
                "text-muted-foreground hover:bg-muted hover-lift transition-all duration-200"
              )}
            >
              {mode === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
              {!collapsed && (
                <span className="font-medium">
                  {mode === 'light' ? 'Dark Mode' : 'Light Mode'}
                </span>
              )}
            </button>
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "absolute -right-3 top-20 w-6 h-6 rounded-full",
              "bg-card border border-border",
              "flex items-center justify-center",
              "hover:bg-muted transition-colors duration-200",
              "shadow-sm"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      <main 
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          collapsed ? "ml-20" : "ml-64"
        )}
      >
        <div className="min-h-screen bg-background">
          {children}
        </div>
      </main>
    </div>
  )
}