import ProfileLayout from "@/layouts/profile-layout";
import StoreLayout from "@/layouts/store-layout";
import { usePage } from "@inertiajs/react";
import { ReactPortal } from "react";

export default function MyProfile() {
    const user = usePage().props.auth.user;

    return (
        <div className="flex gap-4">
            <img
                src={user.avatar}
                alt={user.name}
                className="object-contain size-28"
            />
            <div className="space-y-1">
                <h1 className="font-semibold">{user.name}</h1>
                <p className="font-medium">{user.email}</p>
            </div>
        </div>
    );
}

MyProfile.layout = (page: ReactPortal) => (
    <StoreLayout>
        <ProfileLayout children={page} />
    </StoreLayout>
);
