"use client";

import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import type { NeonUser } from "@/contexts/user-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LayoutDashboardIcon, ListIcon, ChartBarIcon, UsersIcon, CommandIcon } from "lucide-react";
import { IconTags } from "@tabler/icons-react";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Problems",
      url: "#",
      icon: <ListIcon />,
    },
    {
      title: "Solved",
      url: "#",
      icon: <ChartBarIcon />,
    },
    {
      title: "Tags",
      url: "#",
      icon: <IconTags />,
    },
    {
      title: "Team Performance",
      url: "#",
      icon: <UsersIcon />,
    },
  ],
};
export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: NeonUser | null }) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!" render={<a href="#" />}>
              <CommandIcon className="size-5!" />
              <span className="text-base font-semibold">Acme Inc.</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <NavUser user={{ name: user.name, email: user.email, avatar: user.image ?? "" }} />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
