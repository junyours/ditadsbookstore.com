import { PropsWithChildren, useEffect, useState } from "react";
import NavBar from "@/components/store/nav-bar";
import { usePage } from "@inertiajs/react";
import CartDialog from "@/components/cart-dialog";
import { PageProps } from "@/types";

interface Book {
    image: string;
    title: string;
    price: number;
}

interface Props extends PageProps {
    cartBook: Book;
}

export default function StoreLayout({ children }: PropsWithChildren) {
    const { cartBook, cartCount } = usePage<Props>().props;
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (cartBook) {
            setOpen(true);
        }
    }, [cartBook]);

    return (
        <>
            {cartBook && (
                <CartDialog
                    open={open}
                    setOpen={() => setOpen(false)}
                    book={cartBook}
                    cartCount={cartCount}
                />
            )}
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                <NavBar />
                {children}
            </div>
        </>
    );
}
