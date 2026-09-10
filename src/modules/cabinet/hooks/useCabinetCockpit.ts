import { useQuery } from "@tanstack/react-query";
import { cabinetApi } from "../services/cabinetApi.service";

export function useCabinetCockpit() {
  const cockpitQuery = useQuery({
    queryKey: ["cabinet", "cockpit"],
    queryFn: () => cabinetApi.getCockpitMetrics(),
    refetchInterval: 30000,
  });

  return { cockpitQuery };
}
