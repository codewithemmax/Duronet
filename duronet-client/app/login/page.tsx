"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/");
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-background text-foreground overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-slate-950 p-12 border-r border-border/50 relative">
        <div className="absolute inset-0 bg-emerald-500/5 mix-blend-overlay"></div>
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 shadow-2xl">
            <Shield className="h-16 w-16 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-5xl font-extrabold tracking-tight text-white">DuroNet</h1>
            <p className="text-xl text-emerald-400 font-medium tracking-wide">
              Enterprise Supply Chain Intelligence
            </p>
          </div>
          <div className="max-w-md mt-8 text-slate-400 text-sm leading-relaxed">
            Secure, decoupled infrastructure for predictive resilience and real-time medical supply chain synchronization.
          </div>
        </div>
      </div>

      {/* Right Side - Auth */}
      <div className="flex flex-1 items-center justify-center p-8 bg-background relative">
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center md:hidden mb-8 space-y-2">
            <div className="inline-flex p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20 mb-4">
              <Shield className="h-8 w-8 text-emerald-500" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">DuroNet</h1>
            <p className="text-sm text-emerald-500">Enterprise Portal</p>
          </div>

          <Card className="border-border/50 shadow-xl bg-card/80 backdrop-blur-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl font-bold tracking-tight text-center">
                Enterprise Portal Login
              </CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Authenticate via authorized credentials or SSO.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-foreground/90">
                      Work Email
                    </label>
                    <Input
                      type="email"
                      defaultValue="admin@hospital.org"
                      className="bg-background border-border/50 focus-visible:ring-emerald-500 h-11"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none text-foreground/90">
                      Password
                    </label>
                    <Input
                      type="password"
                      defaultValue="********"
                      className="bg-background border-border/50 focus-visible:ring-emerald-500 h-11 font-mono tracking-wider"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold tracking-wide transition-colors"
                  >
                    Sign In
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border/50" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full h-11 border-border/50 bg-background/50 hover:bg-secondary/50 font-medium"
                    onClick={handleLogin}
                  >
                    Sign in with Enterprise SSO (Okta)
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <p className="text-center text-xs text-muted-foreground pt-4">
            Secured by DuroNet Enterprise Security. All activity is monitored.
          </p>
        </div>
      </div>
    </div>
  );
}
