import StoreLayout from "@/layouts/store-layout";
import { ReactPortal } from "react";
import CheckMark from "../../../../../public/images/check-mark.png";
import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";

export default function PaymentSuccess() {
    return (
        <div className="flex flex-col items-center gap-8">
            <img src={CheckMark} alt="check-mark" className="size-36" />
            <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => router.visit(route("my-order"))}>
                    Track your Orders
                </Button>
                <Button onClick={() => router.visit(route("store.home"))}>
                    Continue Shopping
                </Button>
            </div>
        </div>
    );
}

PaymentSuccess.layout = (page: ReactPortal) => <StoreLayout children={page} />;
