import { Button } from "@/components/ui/button";
import StoreLayout from "@/layouts/store-layout";
import { PageProps } from "@/types";
import { router, usePage } from "@inertiajs/react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { ReactPortal, useState } from "react";
import QRPH from "../../../../public/images/icons/QR_Ph_Logo.svg";
import Visa from "../../../../public/images/icons/Visa_Inc._logo.svg";
import MasterCard from "../../../../public/images/icons/Mastercard-logo.svg";
import GCash from "../../../../public/images/icons/GCash_logo.svg";
import Maya from "../../../../public/images/icons/Maya_logo.svg";
import { ImageZoom } from "@/components/ui/shadcn-io/image-zoom";

interface Author {
    id: number;
    name: string;
}

interface Book {
    id: number;
    image: string;
    title: string;
    price: string;
    description: string;
    published_at: Date;
    isbn: string;
    number_page: string;
    users: Author[];
}

interface Props extends PageProps {
    book: Book;
}

const logos = [QRPH, Visa, MasterCard, GCash, Maya];

export default function Book() {
    const { book } = usePage<Props>().props;
    const [quantity, setQuantity] = useState(1);

    const increaseQty = () => {
        setQuantity((prev) => prev + 1);
    };

    const decreaseQty = () => {
        setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    };

    const handleAddCart = () => {
        router.post(
            route("add.cart"),
            { book_id: book.id, quantity },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <div className="space-y-12">
            <div className="flex gap-6">
                <div className="flex-1 space-y-6">
                    <div className="space-y-3">
                        <h1 className="font-semibold text-xl">{book.title}</h1>
                        <p className="font-medium text-sm flex gap-2">
                            <span className="text-neutral-500">
                                Authors:{" "}
                                {book.users.map((a) => a.name).join(", ")}
                            </span>
                        </p>
                    </div>
                    <ImageZoom>
                        <img
                            src={`https://lh3.googleusercontent.com/d/${book.image}`}
                            alt={book.title}
                            className="object-contain"
                        />
                    </ImageZoom>
                </div>
                <div className="flex-1 divide-y border-x border-b h-fit">
                    <div className="p-6 space-y-6 border-t">
                        <p className="font-bold text-2xl">₱{book.price}</p>
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-neutral-500">
                                Qty:
                            </p>
                            <div className="flex items-center gap-4">
                                <Button
                                    onClick={decreaseQty}
                                    size="icon"
                                    variant="outline"
                                    disabled={quantity === 1}
                                >
                                    <Minus strokeWidth={1.5} />
                                </Button>
                                <p>{quantity}</p>
                                <Button
                                    onClick={increaseQty}
                                    size="icon"
                                    variant="outline"
                                >
                                    <Plus strokeWidth={1.5} />
                                </Button>
                            </div>
                        </div>
                        <Button onClick={handleAddCart}>
                            <ShoppingCart strokeWidth={1.5} />
                            Add to Cart
                        </Button>
                    </div>
                    <div className="p-6 space-y-6">
                        <p className="text-sm font-medium text-neutral-500">
                            You can pay through:
                        </p>
                        <div className="grid grid-cols-6 items-center gap-6">
                            {logos.map((logo, index) => (
                                <img key={index} src={logo} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-6">
                <div className="space-y-2">
                    <h1 className="font-semibold">About the Book</h1>
                    <p className="font-medium text-neutral-500 text-sm">
                        {book.description}
                    </p>
                </div>
                <div className="space-y-2">
                    <h1 className="font-semibold">Product Details</h1>
                    <div className="grid grid-cols-[300px_1fr] text-sm divide-x divide-y border-r border-b">
                        <div className="p-2 flex items-center font-semibold border-t border-l">
                            Authors
                        </div>
                        <div className="p-2 font-medium">
                            {book.users.map((a) => a.name).join(", ")}
                        </div>
                        <div className="p-2 flex items-center font-semibold">
                            Publisher
                        </div>
                        <div className="p-2 font-medium">
                            Zas Digital Institute Training and Development
                            Services
                        </div>
                        <div className="p-2 flex items-center font-semibold">
                            Published At
                        </div>
                        <div className="p-2 font-medium">
                            {new Date(book.published_at).toLocaleDateString(
                                "en-US",
                                {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                },
                            )}
                        </div>
                        <div className="p-2 flex items-center font-semibold">
                            ISBN
                        </div>
                        <div className="p-2 font-medium">{book.isbn}</div>
                        <div className="p-2 flex items-center font-semibold">
                            Number of Pages
                        </div>
                        <div className="p-2 font-medium">
                            {book.number_page}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

Book.layout = (page: ReactPortal) => <StoreLayout children={page} />;
