import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Trash2, Save } from "lucide-react";

export function ProjectSettings() {
  return (
    <div className="flex flex-col p-8 space-y-8 w-full h-full overflow-y-auto bg-background/50">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Settings</h1>
        <p className="text-muted-foreground mt-2">Manage workspace configuration and data pipelines.</p>
      </div>

      <div className="max-w-4xl space-y-8">
        {/* Section 1: General Profile */}
        <Card className="shadow-sm border-border bg-card">
          <CardHeader>
            <CardTitle>Workspace Profile</CardTitle>
            <CardDescription>
              Basic information about this DuroNet workspace.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Workspace Name
              </label>
              <Input
                disabled
                value="DuroNet Demo Hospital"
                className="bg-muted/50 max-w-xl"
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Locked by Enterprise RBAC. Contact your administrator to change workspace names.
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Admin Email
              </label>
              <Input
                disabled
                value="admin@hospital.org"
                className="bg-muted/50 max-w-xl"
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Primary contact for security alerts and pipeline deployment notifications.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Integrations */}
        <Card className="shadow-sm border-border bg-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Data Pipeline Integrations</CardTitle>
              <Lock className="h-4 w-4 text-emerald-500" />
            </div>
            <CardDescription>
              Manage automated synchronization connectors via Fivetran.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Fivetran API Key
              </label>
              <Input
                type="password"
                defaultValue="********************************"
                className="max-w-xl font-mono tracking-widest text-muted-foreground"
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Used exclusively to draft and deploy secure destination pipelines. Keys are encrypted at rest.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Fivetran API Secret
              </label>
              <Input
                type="password"
                defaultValue="********************************"
                className="max-w-xl font-mono tracking-widest text-muted-foreground"
              />
              <p className="text-[0.8rem] text-muted-foreground">
                Secondary authentication token for infrastructure-as-code deployments.
              </p>
            </div>
          </CardContent>
          <CardFooter className="bg-muted/20 border-t border-border px-6 py-4">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition-colors">
              <Save className="h-4 w-4 mr-2" />
              Save Integrations
            </Button>
          </CardFooter>
        </Card>

        {/* Section 3: Danger Zone */}
        <Card className="border-destructive/50 shadow-sm bg-card overflow-hidden">
          <CardHeader className="bg-destructive/5 border-b border-destructive/20">
            <CardTitle className="text-destructive flex items-center gap-2">
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="font-medium">Delete Workspace</p>
                <p className="text-[0.8rem] text-muted-foreground max-w-[500px]">
                  Contact your DuroNet Enterprise Account Executive to initiate workspace offboarding. This action will permanently sever all active EHR and supply chain connections.
                </p>
              </div>
              <Button variant="destructive" className="shrink-0 font-medium">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Workspace
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
