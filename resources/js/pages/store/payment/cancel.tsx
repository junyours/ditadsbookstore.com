import StoreLayout from "@/layouts/store-layout";
import { ReactPortal } from "react";
import XMark from "../../../../../public/images/letter-x.png";
import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";

export default function PaymentCancel() {
    return (
        <div className="flex flex-col items-center gap-8">
            <img src={XMark} alt="check-mark" className="size-36" />
            <Button onClick={() => router.visit(route("store.home"))}>
                Continue Shopping
            </Button>
        </div>
    );
}

PaymentCancel.layout = (page: ReactPortal) => <StoreLayout children={page} />;
