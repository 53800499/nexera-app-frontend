"use client";

import {
  BellIcon,
  BoxIcon,
  DocsIcon,
  DollarLineIcon,
  FileIcon,
  GridIcon,
  GroupIcon,
  LockIcon,
  PieChartIcon,
  PlugInIcon,
  TaskIcon,
  UserIcon,
} from "@/icons";
import type { NavIconKey } from "./types";

export const NAV_ICONS: Record<NavIconKey, React.ReactNode> = {
  grid: <GridIcon />,
  group: <GroupIcon />,
  box: <BoxIcon />,
  docs: <DocsIcon />,
  task: <TaskIcon />,
  file: <FileIcon />,
  dollar: <DollarLineIcon />,
  bell: <BellIcon />,
  chart: <PieChartIcon />,
  plug: <PlugInIcon />,
  user: <UserIcon />,
  lock: <LockIcon />,
};
