import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { router } from "@inertiajs/react";

interface Book {
    image: string;
    title: string;
    price: number;
}

interface CartDialogProps {
    open: boolean;
    setOpen: () => void;
    book: Book;
    cartCount: number;
}

export default function CartDialog({
    open,
    setOpen,
    book,
    cartCount,
}: CartDialogProps) {
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(amount);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="top-[30%]">
                <DialogHeader>
                    <DialogTitle className="text-base text-center">
                        Book successfully added to your shopping cart
                    </DialogTitle>
                </DialogHeader>
                <div className="flex gap-3">
                    <img
                        src={`https://lh3.googleusercontent.com/d/${book.image}`}
                        alt=""
                        className="w-36"
                    />
                    <div className="flex-1 flex flex-col justify-between gap-3">
                        <h1 className="font-semibold text-sm line-clamp-2">
                            {book.title}
                        </h1>
                        <p className="font-semibold text-sm">
                            {formatCurrency(book.price)}
                        </p>
                        <p className="font-semibold text-sm">
                            {cartCount > 1
                                ? `There are ${cartCount} items in your cart.`
                                : `There is ${cartCount} item in your cart.`}
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={setOpen} className="w-full">
                        Continue Shopping
                    </Button>
                    <Button
                        onClick={() => {
                            setOpen();
                            router.visit(route("checkout"));
                        }}
                        className="w-full"
                    >
                        Proceed to Checkout
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
