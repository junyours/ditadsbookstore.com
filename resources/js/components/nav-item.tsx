import {
    BookCopy,
    LayoutDashboard,
    Package,
    Shapes,
    Users,
} from "lucide-react";
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { Link, usePage } from "@inertiajs/react";
import { useIsMobile } from "@/hooks/use-mobile";

const navItems = [
    {
        name: "Main",
        items: [
            {
                title: "Dashboard",
                url: "/dashboard",
                icon: LayoutDashboard,
            },
        ],
    },
    {
        name: "Request",
        items: [
            {
                title: "Orders",
                url: "/admin/orders",
                icon: Package,
            },
        ],
    },
    {
        name: "Store",
        items: [
            {
                title: "Books",
                url: "/admin/books",
                icon: BookCopy,
            },
        ],
    },
    {
        name: "Others",
        items: [
            {
                title: "Authors",
                url: "/admin/authors",
                icon: Users,
            },
            {
                title: "Categories",
                url: "/admin/categories",
                icon: Shapes,
            },
        ],
    },
];

export default function NavItem() {
    const { setOpenMobile } = useSidebar();
    const isMobile = useIsMobile();
    const { url } = usePage();

    return navItems.map((group) => (
        <SidebarGroup key={group.name}>
            <SidebarGroupLabel>{group.name}</SidebarGroupLabel>
            <SidebarMenu>
                {group.items.map((item) => (
                    <SidebarMenuItem
                        key={item.title}
                        onClick={() => {
                            if (isMobile) {
                                setOpenMobile(false);
                            }
                        }}
                    >
                        <SidebarMenuButton
                            tooltip={item.title}
                            asChild
                            isActive={url.startsWith(item.url) ? true : false}
                        >
                            <Link href={item.url}>
                                <item.icon />
                                <span className="font-medium">
                                    {item.title}
                                </span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    ));
}
