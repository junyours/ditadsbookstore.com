import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import StoreLayout from "@/layouts/store-layout";
import { PageProps } from "@/types";
import { Link, router, usePage } from "@inertiajs/react";
import { ShoppingCart } from "lucide-react";
import { ReactPortal, useEffect } from "react";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface Book {
    id: number;
    image: string;
    title: string;
    price: number;
}

interface Category {
    id: number;
    name: string;
    books_count: number;
}

interface Props extends PageProps {
    books: Book[];
    categories: Category[];
    activeCategories: string[];
}

export default function Home() {
    const { books, categories, activeCategories, cart } =
        usePage<Props>().props;
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(amount);

    const toggleCategory = (name: string) => {
        let selected = [...activeCategories];

        if (selected.includes(name)) {
            selected = selected.filter((c) => c !== name);
        } else {
            selected.push(name);
        }

        router.get(
            route("store.home"),
            { categories: selected },
            {
                preserveScroll: true,
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleAddCart = (book_id: number) => {
        router.post(
            route("add.cart"),
            { book_id },
            {
                preserveScroll: true,
                preserveState: true,
            },
        );
    };

    return (
        <div className="flex gap-6">
            <Card className="w-64 h-fit rounded-none">
                <CardHeader className="p-4">
                    <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-2.5">
                    {categories.map((category) => (
                        <div
                            key={category.id}
                            className="flex items-center justify-between gap-2"
                        >
                            <div className="flex items-center gap-2">
                                <Checkbox
                                    id={category.name}
                                    checked={activeCategories.includes(
                                        category.name,
                                    )}
                                    onCheckedChange={() =>
                                        toggleCategory(category.name)
                                    }
                                />
                                <Label htmlFor={category.name}>
                                    {category.name}
                                </Label>
                            </div>
                            <p className="text-sm font-medium">
                                ({category.books_count})
                            </p>
                        </div>
                    ))}
                </CardContent>
            </Card>
            <div className="flex-1 grid grid-cols-3 gap-6">
                {books.map((book) => (
                    <Link href={route("store.book", book.title)} key={book.id}>
                        <Card className="rounded-none">
                            <CardHeader className="p-0">
                                <img
                                    src={`https://lh3.googleusercontent.com/d/${book.image}`}
                                    alt={book.title}
                                    className="object-contain"
                                />
                            </CardHeader>
                            <CardContent className="p-4">
                                <h1 className="text-sm font-semibold line-clamp-3">
                                    {book.title}
                                </h1>
                            </CardContent>
                            <CardFooter className="px-4 pb-4 justify-between">
                                <h1 className="font-semibold">
                                    {formatCurrency(book.price)}
                                </h1>
                                <Button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleAddCart(book.id);
                                    }}
                                >
                                    <ShoppingCart strokeWidth={1.5} />
                                    Add to Cart
                                </Button>
                            </CardFooter>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}

Home.layout = (page: ReactPortal) => <StoreLayout children={page} />;
