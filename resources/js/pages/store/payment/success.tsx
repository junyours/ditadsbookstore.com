import StoreLayout from "@/layouts/store-layout";
import { ReactPortal } from "react";

export default function PaymentSuccess() {
    return <div>success</div>;
}

PaymentSuccess.layout = (page: ReactPortal) => <StoreLayout children={page} />;
