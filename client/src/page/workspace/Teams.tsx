import { Separator } from "@/components/ui/separator";
import WorkspaceHeader from "@/components/workspace/common/workspace-header";
import TeamsList from "@/components/workspace/team/teams-list";
import CreateTeamDialog from "@/components/workspace/team/create-team-dialog";
import { Permissions } from "@/constant";
import { useAuthContext } from "@/context/auth-provider";

export default function Teams() {
  const { hasPermission } = useAuthContext();
  const canCreateTeam = hasPermission(Permissions.CREATE_TEAM);

  return (
    <div className="w-full h-auto pt-2">
      <WorkspaceHeader />
      <Separator className="my-4" />
      <main>
        <div className="w-full max-w-3xl mx-auto pt-3">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg leading-[30px] font-semibold mb-1">
                Teams
              </h2>
              <p className="text-sm text-muted-foreground">
                Create and manage teams within your workspace. Teams can have their own members and projects.
              </p>
            </div>
            {canCreateTeam && <CreateTeamDialog />}
          </div>
          <Separator className="my-4" />
          <TeamsList />
        </div>
      </main>
    </div>
  );
}