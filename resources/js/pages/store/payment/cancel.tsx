import StoreLayout from "@/layouts/store-layout";
import { ReactPortal } from "react";

export default function PaymentCancel() {
    return <div>cancel</div>;
}

PaymentCancel.layout = (page: ReactPortal) => <StoreLayout children={page} />;
