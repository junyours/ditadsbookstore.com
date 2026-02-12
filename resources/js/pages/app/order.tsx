import AppLayout from "@/layouts/app-layout";
import { Fragment, ReactPortal, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageProps } from "@/types";
import { router, usePage } from "@inertiajs/react";
import {
    CircleCheck,
    CircleX,
    FileText,
    MapPin,
    MoreHorizontal,
    PackageOpen,
    Truck,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import InputError from "@/components/input-error";

interface User {
    name: string;
}

interface Book {
    title: string;
    image: string;
}

interface OrderBook {
    price: number;
    quantity: number;
    book: Book;
}

interface OrderPayment {
    payment_method: string;
    status: string;
}

interface OrderShippingAddress {
    region: string;
    province: string;
    municipality: string;
    barangay: string;
    street: string;
    postal_code: string;
    phone_number: string;
}

interface OrderCourier {
    tracking_number: string;
    name: string;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    created_at: Date;
    user: User;
    order_book: OrderBook[];
    order_payment: OrderPayment;
    order_shipping_address: OrderShippingAddress;
    order_courier: OrderCourier;
}

interface Props extends PageProps {
    orders: Order[];
}

export default function Order() {
    const { orders } = usePage<Props>().props;
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    const [tabs, setTabs] = useState("preparing");
    const [courier, setCourier] = useState({
        tracking_number: "",
        name: "",
    });
    const [loading, setLoading] = useState(false);

    const orderStatus = (status: string) => {
        return orders.filter((o) => o.status === status).length;
    };

    const order = orders.find((order) => order.status === tabs);

    const handleMoveShipping = (order_id: number) => {
        setLoading(true);
        router.post(
            "/admin/orders/change-status",
            {
                order_id,
                status: "shipping",
                tracking_number: courier.tracking_number,
                name: courier.name,
            },
            {
                onFinish: () => {
                    setLoading(false);
                },
            },
        );
    };

    const handleMoveDelivered = (order_id: number) => {
        setLoading(true);
        router.post(
            "/admin/orders/change-status",
            {
                order_id,
                status: "delivered",
            },
            {
                onFinish: () => {
                    setLoading(false);
                },
            },
        );
    };

    return (
        <div className="space-y-4">
            <Input className="max-w-xs" placeholder="Search..." type="search" />
            <Tabs value={tabs} onValueChange={setTabs}>
                <TabsList className="w-full">
                    <TabsTrigger value="preparing" className="w-full gap-1">
                        <PackageOpen className="size-4" strokeWidth={1.5} />
                        Preparing
                        {orderStatus("preparing") > 0 && (
                            <p className="text-destructive">
                                ({orderStatus("preparing")})
                            </p>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="shipping" className="w-full gap-1">
                        <Truck className="size-4" strokeWidth={1.5} />
                        Shipping
                        {orderStatus("shipping") > 0 && (
                            <p className="text-destructive">
                                ({orderStatus("shipping")})
                            </p>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="delivered" className="w-full gap-1">
                        <CircleCheck className="size-4" strokeWidth={1.5} />
                        Delivered
                        {orderStatus("delivered") > 0 && (
                            <p className="text-destructive">
                                ({orderStatus("delivered")})
                            </p>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="cancelled" className="w-full gap-1">
                        <CircleX className="size-4" strokeWidth={1.5} />
                        Cancelled
                        {orderStatus("cancelled") > 0 && (
                            <p className="text-destructive">
                                ({orderStatus("cancelled")})
                            </p>
                        )}
                    </TabsTrigger>
                </TabsList>
                <TabsContent value={tabs}>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="whitespace-nowrap">
                                    Order ID
                                </TableHead>
                                <TableHead></TableHead>
                                <TableHead>Book</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Quantity</TableHead>
                                <TableHead className="whitespace-nowrap">
                                    Total Item(s)
                                </TableHead>
                                <TableHead className="whitespace-nowrap">
                                    Total Amount
                                </TableHead>
                                <TableHead className="text-right"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map((order) => {
                                const orderTotalItem = order.order_book.reduce(
                                    (sum, item) => sum + Number(item.quantity),
                                    0,
                                );
                                const orderTotalAmount =
                                    order.order_book.reduce(
                                        (sum, item) =>
                                            sum +
                                            Number(item.price) *
                                                Number(item.quantity),
                                        0,
                                    );
                                const hiddenItemsCount = order.order_book
                                    .slice(1)
                                    .reduce(
                                        (sum, item) =>
                                            sum + Number(item.quantity),
                                        0,
                                    );
                                return (
                                    order.status === tabs && (
                                        <Fragment key={order.id}>
                                            <TableRow>
                                                <TableCell className="whitespace-nowrap">
                                                    {order.order_number}
                                                </TableCell>
                                                {order.order_book
                                                    .slice(0, 1)
                                                    .map(
                                                        (
                                                            order_book,
                                                            orderBookIndex,
                                                        ) => (
                                                            <Fragment
                                                                key={
                                                                    orderBookIndex
                                                                }
                                                            >
                                                                <TableCell>
                                                                    <div className="w-20">
                                                                        <img
                                                                            src={`https://lh3.googleusercontent.com/d/${order_book.book.image}`}
                                                                            alt={
                                                                                order_book
                                                                                    .book
                                                                                    .title
                                                                            }
                                                                        />
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {
                                                                        order_book
                                                                            .book
                                                                            .title
                                                                    }
                                                                </TableCell>
                                                                <TableCell>
                                                                    {formatCurrency(
                                                                        order_book.price,
                                                                    )}
                                                                </TableCell>
                                                                <TableCell>
                                                                    x
                                                                    {
                                                                        order_book.quantity
                                                                    }
                                                                </TableCell>
                                                            </Fragment>
                                                        ),
                                                    )}
                                                <TableCell>
                                                    {orderTotalItem}
                                                </TableCell>
                                                <TableCell>
                                                    {formatCurrency(
                                                        orderTotalAmount,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="ghost"
                                                                className="size-8 p-0"
                                                            >
                                                                <MoreHorizontal />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent className="mr-4">
                                                            <DropdownMenuLabel>
                                                                Actions
                                                            </DropdownMenuLabel>
                                                            <DropdownMenuSeparator />
                                                            <Sheet>
                                                                <SheetTrigger
                                                                    asChild
                                                                >
                                                                    <DropdownMenuItem
                                                                        onSelect={(
                                                                            e,
                                                                        ) =>
                                                                            e.preventDefault()
                                                                        }
                                                                    >
                                                                        <FileText />
                                                                        More
                                                                        Details
                                                                    </DropdownMenuItem>
                                                                </SheetTrigger>
                                                                <SheetContent className="flex flex-col">
                                                                    <SheetHeader>
                                                                        <SheetTitle className="text-sm">
                                                                            Order
                                                                            ID:{" "}
                                                                            {
                                                                                order.order_number
                                                                            }
                                                                        </SheetTitle>
                                                                        <SheetDescription>
                                                                            <Badge
                                                                                className={cn(
                                                                                    "capitalize",
                                                                                    order.status ===
                                                                                        "preparing"
                                                                                        ? "bg-orange-500 hover:bg-orange-500/80"
                                                                                        : order.status ===
                                                                                            "shipping"
                                                                                          ? "bg-indigo-500 hover:bg-indigo-500/80"
                                                                                          : order.status ===
                                                                                              "delivered"
                                                                                            ? "bg-green-500 hover:bg-green-500/80"
                                                                                            : order.status ===
                                                                                                "cancelled"
                                                                                              ? "bg-red-500 hover:bg-red-500/80"
                                                                                              : "",
                                                                                )}
                                                                            >
                                                                                {
                                                                                    order.status
                                                                                }
                                                                            </Badge>
                                                                        </SheetDescription>
                                                                    </SheetHeader>
                                                                    <div className="flex-1 space-y-3 text-sm overflow-y-auto">
                                                                        <div className="space-y-3">
                                                                            {[
                                                                                "shipping",
                                                                                "delivered",
                                                                            ].includes(
                                                                                order.status,
                                                                            ) && (
                                                                                <div className="space-y-3">
                                                                                    <div className="flex items-center justify-between">
                                                                                        <SheetTitle className="text-sm">
                                                                                            Courier:
                                                                                        </SheetTitle>
                                                                                        <div className="flex items-center gap-2">
                                                                                            <p className="font-medium">
                                                                                                {
                                                                                                    order
                                                                                                        .order_courier
                                                                                                        .name
                                                                                                }
                                                                                            </p>
                                                                                            <p className="font-medium">
                                                                                                (
                                                                                                {
                                                                                                    order
                                                                                                        .order_courier
                                                                                                        .tracking_number
                                                                                                }

                                                                                                )
                                                                                            </p>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            <SheetTitle className="text-sm">
                                                                                Shipping
                                                                                Address
                                                                            </SheetTitle>
                                                                            <div className="space-y-2">
                                                                                <div className="flex gap-2">
                                                                                    <MapPin
                                                                                        className="shrink-0"
                                                                                        strokeWidth={
                                                                                            1.5
                                                                                        }
                                                                                    />
                                                                                    <div className="space-y-0.5">
                                                                                        <h1 className="font-medium">
                                                                                            {
                                                                                                order
                                                                                                    .user
                                                                                                    .name
                                                                                            }
                                                                                        </h1>
                                                                                        <p className="font-medium">
                                                                                            {
                                                                                                order
                                                                                                    .order_shipping_address
                                                                                                    .phone_number
                                                                                            }
                                                                                        </p>
                                                                                        <p className="font-medium">
                                                                                            {
                                                                                                order
                                                                                                    .order_shipping_address
                                                                                                    .street
                                                                                            }

                                                                                            ,{" "}
                                                                                            {
                                                                                                order
                                                                                                    .order_shipping_address
                                                                                                    .barangay
                                                                                            }

                                                                                            ,{" "}
                                                                                            {
                                                                                                order
                                                                                                    .order_shipping_address
                                                                                                    .municipality
                                                                                            }

                                                                                            ,{" "}
                                                                                            {
                                                                                                order
                                                                                                    .order_shipping_address
                                                                                                    .province
                                                                                            }

                                                                                            ,{" "}
                                                                                            {
                                                                                                order
                                                                                                    .order_shipping_address
                                                                                                    .region
                                                                                            }

                                                                                            ,{" "}
                                                                                            {
                                                                                                order
                                                                                                    .order_shipping_address
                                                                                                    .postal_code
                                                                                            }
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <SheetTitle className="text-sm">
                                                                            Order{" "}
                                                                            {orderTotalItem ===
                                                                            1
                                                                                ? "Item"
                                                                                : "Items"}
                                                                        </SheetTitle>
                                                                        {order.order_book
                                                                            .slice(
                                                                                0,
                                                                                1,
                                                                            )
                                                                            .map(
                                                                                (
                                                                                    order_book,
                                                                                    orderBookIndex,
                                                                                ) => (
                                                                                    <div
                                                                                        key={
                                                                                            orderBookIndex
                                                                                        }
                                                                                        className="flex gap-3"
                                                                                    >
                                                                                        <img
                                                                                            src={`https://lh3.googleusercontent.com/d/${order_book.book.image}`}
                                                                                            alt={
                                                                                                order_book
                                                                                                    .book
                                                                                                    .title
                                                                                            }
                                                                                            className="w-24"
                                                                                        />
                                                                                        <div className="flex-1 flex flex-col justify-between">
                                                                                            <h1 className="font-medium line-clamp-2">
                                                                                                {
                                                                                                    order_book
                                                                                                        .book
                                                                                                        .title
                                                                                                }
                                                                                            </h1>
                                                                                            <div className="flex items-center justify-between">
                                                                                                <p className="font-medium">
                                                                                                    x
                                                                                                    {
                                                                                                        order_book.quantity
                                                                                                    }
                                                                                                </p>
                                                                                                <p className="font-medium">
                                                                                                    {formatCurrency(
                                                                                                        order_book.price,
                                                                                                    )}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                ),
                                                                            )}
                                                                        {order
                                                                            .order_book
                                                                            .length >
                                                                            1 && (
                                                                            <Accordion
                                                                                type="single"
                                                                                collapsible
                                                                            >
                                                                                <AccordionItem
                                                                                    value="items"
                                                                                    className="border-none"
                                                                                >
                                                                                    <AccordionTrigger className="text-sm p-0">
                                                                                        Show{" "}
                                                                                        {
                                                                                            hiddenItemsCount
                                                                                        }{" "}
                                                                                        more
                                                                                        item
                                                                                        {hiddenItemsCount >
                                                                                        1
                                                                                            ? "s"
                                                                                            : ""}
                                                                                    </AccordionTrigger>
                                                                                    <AccordionContent className="space-y-3 pt-3 pb-0">
                                                                                        {order.order_book
                                                                                            .slice(
                                                                                                1,
                                                                                            )
                                                                                            .map(
                                                                                                (
                                                                                                    order_book,
                                                                                                    index,
                                                                                                ) => (
                                                                                                    <div
                                                                                                        key={
                                                                                                            index
                                                                                                        }
                                                                                                        className="flex gap-3"
                                                                                                    >
                                                                                                        <img
                                                                                                            src={`https://lh3.googleusercontent.com/d/${order_book.book.image}`}
                                                                                                            alt={
                                                                                                                order_book
                                                                                                                    .book
                                                                                                                    .title
                                                                                                            }
                                                                                                            className="w-24"
                                                                                                        />
                                                                                                        <div className="flex-1 flex flex-col justify-between">
                                                                                                            <h1 className="font-medium line-clamp-2">
                                                                                                                {
                                                                                                                    order_book
                                                                                                                        .book
                                                                                                                        .title
                                                                                                                }
                                                                                                            </h1>
                                                                                                            <div className="flex items-center justify-between">
                                                                                                                <p className="font-medium">
                                                                                                                    x
                                                                                                                    {
                                                                                                                        order_book.quantity
                                                                                                                    }
                                                                                                                </p>
                                                                                                                <p className="font-medium">
                                                                                                                    {formatCurrency(
                                                                                                                        order_book.price,
                                                                                                                    )}
                                                                                                                </p>
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    </div>
                                                                                                ),
                                                                                            )}
                                                                                    </AccordionContent>
                                                                                </AccordionItem>
                                                                            </Accordion>
                                                                        )}
                                                                        <div className="flex justify-end">
                                                                            <h1 className="font-medium">
                                                                                Total{" "}
                                                                                {
                                                                                    orderTotalItem
                                                                                }{" "}
                                                                                {orderTotalItem ===
                                                                                1
                                                                                    ? "Item"
                                                                                    : "Items"}

                                                                                :{" "}
                                                                                {formatCurrency(
                                                                                    orderTotalAmount,
                                                                                )}
                                                                            </h1>
                                                                        </div>
                                                                        {[
                                                                            "preparing",
                                                                            "shipping",
                                                                            "delivered",
                                                                        ].includes(
                                                                            order.status,
                                                                        ) && (
                                                                            <div className="flex items-center justify-between">
                                                                                <SheetTitle className="text-sm">
                                                                                    Paid
                                                                                    by
                                                                                </SheetTitle>
                                                                                <p className="font-medium">
                                                                                    {
                                                                                        order
                                                                                            .order_payment
                                                                                            .payment_method
                                                                                    }
                                                                                </p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <SheetFooter>
                                                                        {order.status ===
                                                                            "preparing" && (
                                                                            <Dialog>
                                                                                <DialogTrigger>
                                                                                    <Button>
                                                                                        Move
                                                                                        to
                                                                                        Shipping
                                                                                    </Button>
                                                                                </DialogTrigger>
                                                                                <DialogContent>
                                                                                    <DialogHeader>
                                                                                        <DialogTitle>
                                                                                            Add
                                                                                            Courier
                                                                                        </DialogTitle>
                                                                                    </DialogHeader>
                                                                                    <div className="space-y-4">
                                                                                        <div className="grid w-full items-center gap-2">
                                                                                            <Label>
                                                                                                Tracking
                                                                                                Number
                                                                                            </Label>
                                                                                            <Input
                                                                                                value={
                                                                                                    courier.tracking_number
                                                                                                }
                                                                                                onChange={(
                                                                                                    e,
                                                                                                ) =>
                                                                                                    setCourier(
                                                                                                        (
                                                                                                            prev,
                                                                                                        ) => ({
                                                                                                            ...prev,
                                                                                                            tracking_number:
                                                                                                                e
                                                                                                                    .target
                                                                                                                    .value,
                                                                                                        }),
                                                                                                    )
                                                                                                }
                                                                                            />
                                                                                            <InputError message="" />
                                                                                        </div>
                                                                                        <div className="grid w-full items-center gap-2">
                                                                                            <Label>
                                                                                                Name
                                                                                            </Label>
                                                                                            <Input
                                                                                                value={
                                                                                                    courier.name
                                                                                                }
                                                                                                onChange={(
                                                                                                    e,
                                                                                                ) =>
                                                                                                    setCourier(
                                                                                                        (
                                                                                                            prev,
                                                                                                        ) => ({
                                                                                                            ...prev,
                                                                                                            name: e
                                                                                                                .target
                                                                                                                .value,
                                                                                                        }),
                                                                                                    )
                                                                                                }
                                                                                            />
                                                                                            <InputError message="" />
                                                                                        </div>
                                                                                    </div>
                                                                                    <DialogFooter>
                                                                                        <DialogClose>
                                                                                            <Button variant="ghost">
                                                                                                Cancel
                                                                                            </Button>
                                                                                        </DialogClose>
                                                                                        <Button
                                                                                            onClick={() =>
                                                                                                handleMoveShipping(
                                                                                                    order.id,
                                                                                                )
                                                                                            }
                                                                                            disabled={
                                                                                                loading
                                                                                            }
                                                                                        >
                                                                                            Save
                                                                                        </Button>
                                                                                    </DialogFooter>
                                                                                </DialogContent>
                                                                            </Dialog>
                                                                        )}
                                                                        {order.status ===
                                                                            "shipping" && (
                                                                            <Button
                                                                                onClick={() =>
                                                                                    handleMoveDelivered(
                                                                                        order.id,
                                                                                    )
                                                                                }
                                                                                disabled={
                                                                                    loading
                                                                                }
                                                                            >
                                                                                Move
                                                                                to
                                                                                Delivered
                                                                            </Button>
                                                                        )}
                                                                    </SheetFooter>
                                                                </SheetContent>
                                                            </Sheet>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                            {order.order_book.length > 1 && (
                                                <TableRow>
                                                    <TableCell></TableCell>
                                                    <TableCell colSpan={7}>
                                                        <Accordion
                                                            type="single"
                                                            collapsible
                                                        >
                                                            <AccordionItem
                                                                value="items"
                                                                className="border-none"
                                                            >
                                                                <AccordionTrigger className="text-xs p-0">
                                                                    Show{" "}
                                                                    {
                                                                        hiddenItemsCount
                                                                    }{" "}
                                                                    more item
                                                                    {hiddenItemsCount >
                                                                    1
                                                                        ? "s"
                                                                        : ""}
                                                                </AccordionTrigger>
                                                                <AccordionContent className="space-y-2 pb-0">
                                                                    {order.order_book
                                                                        .slice(
                                                                            1,
                                                                        )
                                                                        .map(
                                                                            (
                                                                                order_book,
                                                                                index,
                                                                            ) => (
                                                                                <Fragment
                                                                                    key={
                                                                                        index
                                                                                    }
                                                                                >
                                                                                    <TableCell>
                                                                                        <div className="w-20">
                                                                                            <img
                                                                                                src={`https://lh3.googleusercontent.com/d/${order_book.book.image}`}
                                                                                                alt={
                                                                                                    order_book
                                                                                                        .book
                                                                                                        .title
                                                                                                }
                                                                                            />
                                                                                        </div>
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        {
                                                                                            order_book
                                                                                                .book
                                                                                                .title
                                                                                        }
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        {formatCurrency(
                                                                                            order_book.price,
                                                                                        )}
                                                                                    </TableCell>
                                                                                    <TableCell>
                                                                                        x
                                                                                        {
                                                                                            order_book.quantity
                                                                                        }
                                                                                    </TableCell>
                                                                                </Fragment>
                                                                            ),
                                                                        )}
                                                                </AccordionContent>
                                                            </AccordionItem>
                                                        </Accordion>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </Fragment>
                                    )
                                );
                            })}
                        </TableBody>
                    </Table>
                </TabsContent>
            </Tabs>
        </div>
    );
}

Order.layout = (page: ReactPortal) => <AppLayout children={page} />;
