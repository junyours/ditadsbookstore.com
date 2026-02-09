import { Link, router, usePage } from "@inertiajs/react";
import {
    ChevronDown,
    CircleQuestionMark,
    LogOut,
    MessageSquare,
    Package,
    Search,
    ShoppingCart,
    User,
} from "lucide-react";
import Logo from "../../../../public/images/bookstore-logo.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export default function NavBar() {
    const user = usePage().props.auth.user;
    const { cartCount, search } = usePage().props;
    const [searchText, setSearchText] = useState(search ?? "");

    const submitSearch = () => {
        router.get(
            route("store.home"),
            {
                search: searchText,
            },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <Link className="flex items-center gap-1">
                        <CircleQuestionMark
                            className="size-4 text-neutral-500"
                            strokeWidth={1.5}
                        />
                        <p className="text-xs font-medium">Help</p>
                    </Link>
                    <Link className="flex items-center gap-1">
                        <MessageSquare
                            className="size-4 text-neutral-500"
                            strokeWidth={1.5}
                        />
                        <p className="text-xs font-medium">Contact Us</p>
                    </Link>
                </div>
                {user ? (
                    user.role === "admin" ? (
                        <Link
                            href={route("dashboard")}
                            className="text-xs font-medium"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-1 cursor-pointer">
                                    <p className="text-xs font-medium">
                                        Hi, {user.name}
                                    </p>{" "}
                                    <ChevronDown
                                        className="size-4"
                                        strokeWidth={1.5}
                                    />
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.visit(route("my-profile"))
                                        }
                                    >
                                        <User />
                                        My Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.visit(route("my-order"))
                                        }
                                    >
                                        <Package />
                                        My Orders
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() =>
                                            router.post(route("logout"))
                                        }
                                        className="text-destructive"
                                    >
                                        <LogOut />
                                        Sign Out
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )
                ) : (
                    <Link href={route("login")} className="text-xs font-medium">
                        Sign in
                    </Link>
                )}
            </div>
            <div className="flex items-center gap-20">
                <Link href={route("store.home")}>
                    <img
                        src={Logo}
                        alt="bookstore-logo"
                        className="w-40 h-30"
                    />
                </Link>
                <div className="flex-1">
                    <div className="flex">
                        <Input
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && submitSearch()
                            }
                            className="flex-1 bg-neutral-200/50 border-none focus-visible:ring-0 h-11 px-5 placeholder:font-semibold font-medium"
                            placeholder="Search our books"
                        />
                        <Button
                            onClick={submitSearch}
                            size="icon"
                            className="size-11"
                        >
                            <Search strokeWidth={1.5} />
                        </Button>
                    </div>
                </div>
                <div className="relative">
                    <Link href={route("cart")}>
                        <Button size="icon" variant="secondary">
                            <ShoppingCart strokeWidth={1.5} />
                        </Button>
                        {cartCount > 0 && (
                            <Badge
                                className="absolute -top-2 -right-2 h-5 min-w-5 rounded-full px-1 tabular-nums flex justify-center"
                                variant="destructive"
                            >
                                {cartCount}
                            </Badge>
                        )}
                    </Link>
                </div>
            </div>
        </div>
    );
}
