import { Button } from "@/components/ui/button";
import { router, usePage } from "@inertiajs/react";
import { Package, User } from "lucide-react";
import { PropsWithChildren } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function ProfileLayout({ children }: PropsWithChildren) {
    const { url } = usePage();

    return (
        <div className="flex gap-6">
            <Card className="w-64 h-fit rounded-none">
                <CardContent className="p-4 flex flex-col gap-2">
                    <Button
                        onClick={() => router.visit(route("my-profile"))}
                        className="justify-start"
                        variant={
                            url === "/my-profile" ? "default" : "secondary"
                        }
                    >
                        <User />
                        My Profile
                    </Button>
                    <Button
                        onClick={() => router.visit(route("my-order"))}
                        className="justify-start"
                        variant={url === "/my-orders" ? "default" : "secondary"}
                    >
                        <Package />
                        My Orders
                    </Button>
                </CardContent>
            </Card>
            {children}
        </div>
    );
}
