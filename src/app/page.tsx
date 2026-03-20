import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Briefcase,
  Users,
  DollarSign,
} from "lucide-react";
import { MandatesChart } from "@/components/mandates-chart";
import { activeMandates, clients } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { Mandate } from "@/lib/definitions";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const totalHeadcount = activeMandates.reduce(
    (acc, mandate) => acc + mandate.headcount,
    0
  );

  const getStageBadgeVariant = (stage: Mandate['stage']) => {
    switch (stage) {
      case 'Sourcing':
        return 'secondary';
      case 'Interviewing':
        return 'default';
      case 'Offer':
        return 'outline';
      case 'Closed':
        return 'destructive';
      default:
        return 'default';
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Dashboard" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Mandates</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeMandates.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently open positions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Headcount</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHeadcount}</div>
            <p className="text-xs text-muted-foreground">
              Required to be filled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
             <p className="text-xs text-muted-foreground">
              Managed clients
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4">
          <CardHeader>
            <CardTitle>Mandates by Stage</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <MandatesChart />
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle>Active Mandates Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {activeMandates.slice(0, 5).map((mandate) => {
                const client = clients.find((c) => c.id === mandate.clientId);
                return (
                  <div
                    key={mandate.id}
                    className="flex flex-col justify-between rounded-lg border bg-card p-4 w-56 flex-shrink-0"
                  >
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {mandate.role}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {client?.name}
                      </p>
                    </div>
                    <Badge
                      variant={getStageBadgeVariant(mandate.stage)}
                      className="mt-4 self-start"
                    >
                      {mandate.stage}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
