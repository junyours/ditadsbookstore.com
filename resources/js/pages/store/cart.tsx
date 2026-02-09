import StoreLayout from "@/layouts/store-layout";
import { ReactPortal, useEffect, useMemo, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Link, router, usePage } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash } from "lucide-react";
import { PageProps } from "@/types";
import { debounce } from "lodash";
import axios from "axios";
import CartEmpty from "../../../../public/images/cart-empty.png";

interface Author {
    id: number;
    name: string;
}

interface Book {
    image: string;
    title: string;
    price: number;
    users: Author[];
}

interface Cart {
    id: number;
    user_id: number;
    book_id: number;
    quantity: number;
    book: Book;
}

interface Props extends PageProps {
    carts: Cart[];
}

export default function Cart() {
    const { carts: initialCarts } = usePage<Props>().props;
    const [carts, setCarts] = useState<Cart[]>(initialCarts);
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(amount);

    const handleRemove = (cart_id: number) => {
        router.post(
            route("cart.remove"),
            { cart_id },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setCarts((prev) =>
                        prev.filter((cart) => cart.id !== cart_id),
                    );
                },
            },
        );
    };

    const totalAmount = carts.reduce((total, cart) => {
        return total + cart.book.price * cart.quantity;
    }, 0);

    const totalItem = carts.reduce((total, cart) => {
        return total + cart.quantity;
    }, 0);

    const updateCartQuantity = (cart_id: number, quantity: number) => {
        try {
            axios.post(route("cart.quantity", { cart_id, quantity }));
        } catch (error) {
            console.log(error);
        } finally {
            router.reload({ only: ["cartCount"] });
        }
    };

    const debouncedUpdateQuantity = useMemo(
        () =>
            debounce((cart_id: number, quantity: number) => {
                updateCartQuantity(cart_id, quantity);
            }, 500),
        [],
    );

    const incrementQuantity = (cart_id: number) => {
        setCarts((prev) =>
            prev.map((cart) => {
                if (cart.id === cart_id) {
                    const newQty = cart.quantity + 1;
                    debouncedUpdateQuantity(cart_id, newQty);
                    return { ...cart, quantity: newQty };
                }
                return cart;
            }),
        );
    };

    const decrementQuantity = (cart_id: number) => {
        setCarts((prev) =>
            prev.map((cart) => {
                if (cart.id === cart_id) {
                    const newQty = Math.max(1, cart.quantity - 1);
                    debouncedUpdateQuantity(cart_id, newQty);
                    return { ...cart, quantity: newQty };
                }
                return cart;
            }),
        );
    };

    useEffect(() => {
        return () => {
            debouncedUpdateQuantity.cancel();
        };
    }, [debouncedUpdateQuantity]);

    return carts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-6">
            <img
                src={CartEmpty}
                alt="cart-empty"
                className="size-40 object-contain"
            />
            <p className="font-medium text-muted-foreground">
                Your shopping cart is empty
            </p>
            <Link href={route("store.home")}>
                <Button>Go Shopping Now</Button>
            </Link>
        </div>
    ) : (
        <div className="flex gap-6">
            <div className="flex-1">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-full text-center">
                                Items
                            </TableHead>
                            <TableHead className="w-60 text-center">
                                Price
                            </TableHead>
                            <TableHead className="w-60 text-center">
                                Quantity
                            </TableHead>
                            <TableHead className="w-60 text-center">
                                Total
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {carts.map((cart) => (
                            <TableRow key={cart.id}>
                                <TableCell>
                                    <div className="flex gap-4">
                                        <img
                                            src={`https://lh3.googleusercontent.com/d/${cart.book.image}`}
                                            alt={cart.book.title}
                                            className="w-44"
                                        />
                                        <div className="flex-1 flex flex-col gap-2 justify-between">
                                            <div className="space-y-4">
                                                <h1 className="font-semibold line-clamp-2">
                                                    {cart.book.title}
                                                </h1>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {cart.book.users
                                                        .map((a) => a.name)
                                                        .join(", ")}
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() =>
                                                    handleRemove(cart.id)
                                                }
                                                variant="link"
                                                size="sm"
                                                className="text-destructive p-0 w-fit"
                                            >
                                                <Trash />
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    {formatCurrency(cart.book.price)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-center">
                                        <div className="flex">
                                            <Button
                                                onClick={() =>
                                                    decrementQuantity(cart.id)
                                                }
                                                size="icon"
                                                variant="outline"
                                                disabled={cart.quantity === 1}
                                            >
                                                <Minus />
                                            </Button>
                                            <div className="min-w-10 px-2 border flex justify-center items-center">
                                                <p>{cart.quantity}</p>
                                            </div>
                                            <Button
                                                onClick={() =>
                                                    incrementQuantity(cart.id)
                                                }
                                                size="icon"
                                                variant="outline"
                                            >
                                                <Plus />
                                            </Button>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    {formatCurrency(
                                        cart.book.price * cart.quantity,
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="w-80 space-y-6">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order Summary</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="p-4 space-y-4">
                                <div className="flex items-center justify-between font-semibold">
                                    <h1>Total Items</h1>
                                    <p>{totalItem}</p>
                                </div>
                                <div className="flex items-center justify-between font-semibold">
                                    <h1>Total Amount</h1>
                                    <p>{formatCurrency(totalAmount)}</p>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <Button
                    onClick={() => router.visit(route("checkout"))}
                    className="w-full"
                >
                    Proceed to Checkout
                </Button>
            </div>
        </div>
    );
}

Cart.layout = (page: ReactPortal) => <StoreLayout children={page} />;
