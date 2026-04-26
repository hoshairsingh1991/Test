import { Link, useLocation } from "wouter";
import { useClerk, useUser } from "@clerk/react";
import {
  LayoutDashboard,
  PlusCircle,
  History,
  LineChart,
  CalendarDays,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trades/new", label: "New Trade", icon: PlusCircle },
  { href: "/trades", label: "History", icon: History },
  { href: "/analysis", label: "Analysis", icon: LineChart },
  { href: "/review", label: "Weekly Review", icon: CalendarDays },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { signOut } = useClerk();
  const { user } = useUser();
  const [open, setOpen] = useState(false);

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

  const NavLinks = () => (
    <nav className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const isActive = location === item.href || (location.startsWith(item.href) && item.href !== "/");
        return (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
            <div
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium cursor-pointer ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </div>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-card px-4 md:hidden">
        <div className="flex items-center gap-2">
          <img src={`${basePath}/logo.svg`} alt="TradeTrack Pro" className="h-6 w-6" />
          <span className="font-bold tracking-tight">TradeTrack Pro</span>
        </div>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center gap-2 border-b px-6">
                <img src={`${basePath}/logo.svg`} alt="TradeTrack Pro" className="h-6 w-6" />
                <span className="font-bold tracking-tight">TradeTrack Pro</span>
              </div>
              <div className="flex-1 overflow-auto py-4 px-3">
                <NavLinks />
              </div>
              <div className="border-t p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-9 w-9 border border-border">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback>{user?.firstName?.[0] || user?.primaryEmailAddress?.emailAddress?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">{user?.fullName || "Trader"}</span>
                    <span className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full justify-start text-muted-foreground" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-card md:flex h-screen sticky top-0">
        <div className="flex h-16 items-center gap-2 border-b px-6">
          <img src={`${basePath}/logo.svg`} alt="TradeTrack Pro" className="h-6 w-6" />
          <span className="font-bold tracking-tight">TradeTrack Pro</span>
        </div>
        <div className="flex-1 overflow-auto py-6 px-3">
          <NavLinks />
        </div>
        <div className="border-t p-4">
          <div className="flex items-center gap-3 mb-4 px-2">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={user?.imageUrl} />
              <AvatarFallback>{user?.firstName?.[0] || user?.primaryEmailAddress?.emailAddress?.[0] || "T"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium truncate">{user?.fullName || "Trader"}</span>
              <span className="text-xs text-muted-foreground truncate">{user?.primaryEmailAddress?.emailAddress}</span>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-foreground" onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="mx-auto max-w-6xl p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
