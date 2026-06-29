import Badge from "@/components/ui/badge/Badge";

export function UserStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge size="sm" color={isActive ? "success" : "warning"}>
      {isActive ? "Actif" : "Inactif"}
    </Badge>
  );
}
