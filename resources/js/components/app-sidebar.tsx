import { NavUser } from "@/components/nav-user";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";
import { Link, usePage } from "@inertiajs/react";
import Icon from "../../../public/images/icon.png";
import NavItem from "@/components/nav-item";

export function AppSidebar() {
    const user = usePage().props.auth.user;

    return (
        <Sidebar variant="floating" collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <Link href={route("store.home")}>
                            <SidebarMenuButton
                                size="lg"
                                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <div className="flex aspect-square size-8 items-center justify-center">
                                    <img src={Icon} alt="icon" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-bold">
                                        {import.meta.env.VITE_APP_NAME}
                                    </span>
                                </div>
                            </SidebarMenuButton>
                        </Link>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavItem />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
