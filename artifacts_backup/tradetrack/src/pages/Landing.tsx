import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Crosshair, Target } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <img src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/logo.svg`} alt="TradeTrack Pro" className="h-6 w-6" />
          <span className="font-bold tracking-tight text-lg">TradeTrack Pro</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in">
            <Button variant="ghost" className="text-sm font-medium">Log In</Button>
          </Link>
          <Link href="/sign-up">
            <Button className="text-sm font-medium">Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm text-primary">
            <Crosshair className="mr-2 h-4 w-4" />
            Precision journaling for serious traders
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
            Stop guessing. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-600">Know your edge.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A cockpit-grade trading journal built for active futures and forex traders. 
            Log trades in under 10 seconds. Identify exactly which setups print money and which bleed your account.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/sign-up">
              <Button size="lg" className="h-14 px-8 text-base font-semibold w-full sm:w-auto">
                Start Tracking Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold w-full sm:w-auto bg-transparent border-border hover:bg-muted">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full text-left">
          <div className="p-6 rounded-2xl bg-card border border-card-border/50 space-y-4">
            <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Lightning Fast Entry</h3>
            <p className="text-muted-foreground leading-relaxed">Keyboard-optimized forms with smart defaults let you log trades in under 10 seconds before you lose the details.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-card border border-card-border/50 space-y-4">
            <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500">
              <BarChart3 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Actionable Analytics</h3>
            <p className="text-muted-foreground leading-relaxed">See your win rate and expectancy by setup, session, and execution quality. Cut the dead weight instantly.</p>
          </div>
          
          <div className="p-6 rounded-2xl bg-card border border-card-border/50 space-y-4">
            <div className="h-12 w-12 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-500">
              <Crosshair className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Ruthless Honesty</h3>
            <p className="text-muted-foreground leading-relaxed">Compare A+ execution against FOMO entries. Put a real dollar value on your indiscipline.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} TradeTrack Pro. All rights reserved.</p>
      </footer>
    </div>
  );
}
