import StoreLayout from "@/layouts/store-layout";
import { ReactPortal, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileLayout from "@/layouts/profile-layout";
import { router, usePage } from "@inertiajs/react";
import { PageProps } from "@/types";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    CircleCheck,
    CircleX,
    MapPin,
    MoveRight,
    PackageOpen,
    Truck,
    Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import axios from "axios";
import Loading from "@/components/loading";

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

export default function MyOrder() {
    const { orders } = usePage<Props>().props;
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    const [loading, setLoading] = useState<boolean>(false);

    const orderStatus = (status: string) => {
        return orders.filter((o) => o.status === status).length;
    };

    const handleCancelOrder = (order_id: number) => {
        router.post("/my-orders/cancel", {
            order_id,
        });
    };

    const handlePay = async (order_id: number) => {
        setLoading(true);
        try {
            const res = await axios.post("/pay/repay", { order_id });
            window.location.href = res.data.checkout_url;
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Loading open={loading} />
            <div className="flex-1">
                <Tabs defaultValue="to_pay">
                    <TabsList className="w-full">
                        <TabsTrigger value="to_pay" className="w-full gap-1">
                            <Wallet className="size-4" strokeWidth={1.5} />
                            To Pay
                            {orderStatus("to_pay") > 0 && (
                                <p className="text-destructive">
                                    ({orderStatus("to_pay")})
                                </p>
                            )}
                        </TabsTrigger>
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
                    {orders.map((order) => {
                        const orderTotalItem = order.order_book.reduce(
                            (sum, item) => sum + Number(item.quantity),
                            0,
                        );
                        const orderTotalAmount = order.order_book.reduce(
                            (sum, item) =>
                                sum +
                                Number(item.price) * Number(item.quantity),
                            0,
                        );
                        const hiddenItemsCount = order.order_book
                            .slice(1)
                            .reduce(
                                (sum, item) => sum + Number(item.quantity),
                                0,
                            );
                        return (
                            <TabsContent
                                key={order.id}
                                value={order.status}
                                className="space-y-2"
                            >
                                <Card className="rounded-none">
                                    <div
                                        className={cn(
                                            "h-1.5",
                                            order.status === "to_pay"
                                                ? "bg-yellow-500"
                                                : order.status === "preparing"
                                                  ? "bg-orange-500"
                                                  : order.status === "shipping"
                                                    ? "bg-indigo-500"
                                                    : order.status ===
                                                        "delivered"
                                                      ? "bg-green-500"
                                                      : order.status ===
                                                          "cancelled"
                                                        ? "bg-red-500"
                                                        : "",
                                        )}
                                    />
                                    <CardHeader className="flex-row items-center justify-between">
                                        <CardTitle className="text-sm">
                                            Order ID: {order.order_number}
                                        </CardTitle>
                                        <Badge
                                            className={cn(
                                                "capitalize",
                                                order.status === "to_pay"
                                                    ? "bg-yellow-500 hover:bg-yellow-500/80"
                                                    : order.status ===
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
                                            {order.status === "to_pay"
                                                ? "To Pay"
                                                : order.status}
                                        </Badge>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {order.order_book
                                            .slice(0, 1)
                                            .map(
                                                (
                                                    order_book,
                                                    orderBookIndex,
                                                ) => (
                                                    <div
                                                        key={orderBookIndex}
                                                        className="flex gap-4"
                                                    >
                                                        <img
                                                            src={`https://lh3.googleusercontent.com/d/${order_book.book.image}`}
                                                            alt={
                                                                order_book.book
                                                                    .title
                                                            }
                                                            className="w-28"
                                                        />
                                                        <div className="flex-1 flex flex-col justify-between">
                                                            <h1 className="font-semibold line-clamp-2">
                                                                {
                                                                    order_book
                                                                        .book
                                                                        .title
                                                                }
                                                            </h1>
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-semibold">
                                                                    x
                                                                    {
                                                                        order_book.quantity
                                                                    }
                                                                </p>
                                                                <p className="font-semibold">
                                                                    {formatCurrency(
                                                                        order_book.price,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ),
                                            )}
                                        {order.order_book.length > 1 && (
                                            <Accordion
                                                type="single"
                                                collapsible
                                            >
                                                <AccordionItem
                                                    value="items"
                                                    className="border-none"
                                                >
                                                    <AccordionTrigger className="text-sm p-0">
                                                        Show {hiddenItemsCount}{" "}
                                                        more item
                                                        {hiddenItemsCount > 1
                                                            ? "s"
                                                            : ""}
                                                    </AccordionTrigger>
                                                    <AccordionContent className="space-y-3 pt-3 pb-0 text-base">
                                                        {order.order_book
                                                            .slice(1)
                                                            .map(
                                                                (
                                                                    order_book,
                                                                    index,
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="flex gap-4"
                                                                    >
                                                                        <img
                                                                            src={`https://lh3.googleusercontent.com/d/${order_book.book.image}`}
                                                                            alt={
                                                                                order_book
                                                                                    .book
                                                                                    .title
                                                                            }
                                                                            className="w-28"
                                                                        />
                                                                        <div className="flex-1 flex flex-col justify-between">
                                                                            <h1 className="font-semibold line-clamp-2">
                                                                                {
                                                                                    order_book
                                                                                        .book
                                                                                        .title
                                                                                }
                                                                            </h1>
                                                                            <div className="flex items-center justify-between">
                                                                                <p className="font-semibold">
                                                                                    x
                                                                                    {
                                                                                        order_book.quantity
                                                                                    }
                                                                                </p>
                                                                                <p className="font-semibold">
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
                                    </CardContent>
                                    <CardFooter className="justify-between">
                                        <div className="flex justify-end">
                                            <h1 className="font-semibold">
                                                Total {orderTotalItem}{" "}
                                                {orderTotalItem === 1
                                                    ? "Item"
                                                    : "Items"}
                                                :{" "}
                                                {formatCurrency(
                                                    orderTotalAmount,
                                                )}
                                            </h1>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {["to_pay"].includes(
                                                order.status,
                                            ) && (
                                                <Button
                                                    onClick={() =>
                                                        handlePay(order.id)
                                                    }
                                                >
                                                    Pay
                                                    <MoveRight
                                                        strokeWidth={1.5}
                                                    />
                                                </Button>
                                            )}
                                            <Sheet>
                                                <SheetTrigger>
                                                    <Button>
                                                        More Details
                                                        <MoveRight
                                                            strokeWidth={1.5}
                                                        />
                                                    </Button>
                                                </SheetTrigger>
                                                <SheetContent className="flex flex-col overflow-y-auto">
                                                    <SheetHeader>
                                                        <SheetTitle className="text-sm">
                                                            Order ID:{" "}
                                                            {order.order_number}
                                                        </SheetTitle>
                                                        <SheetDescription>
                                                            <Badge
                                                                className={cn(
                                                                    "capitalize",
                                                                    order.status ===
                                                                        "to_pay"
                                                                        ? "bg-yellow-500 hover:bg-yellow-500/80"
                                                                        : order.status ===
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
                                                                {order.status ===
                                                                "to_pay"
                                                                    ? "To Pay"
                                                                    : order.status}
                                                            </Badge>
                                                        </SheetDescription>
                                                    </SheetHeader>
                                                    <div className="flex-1 space-y-3 mt-4 text-sm">
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
                                                                Shipping Address
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
                                                            .slice(0, 1)
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
                                                        {order.order_book
                                                            .length > 1 && (
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
                                                                {orderTotalItem}{" "}
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
                                                                    Paid by
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
                                                        {["to_pay"].includes(
                                                            order.status,
                                                        ) && (
                                                            <div className="flex items-center justify-between">
                                                                <SheetTitle className="text-sm">
                                                                    Payment:
                                                                </SheetTitle>
                                                                <p className="font-medium capitalize">
                                                                    {
                                                                        order
                                                                            .order_payment
                                                                            .status
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <SheetFooter>
                                                        {["to_pay"].includes(
                                                            order.status,
                                                        ) && (
                                                            <Button
                                                                onClick={() =>
                                                                    handleCancelOrder(
                                                                        order.id,
                                                                    )
                                                                }
                                                                variant="destructive"
                                                                className="w-full"
                                                            >
                                                                Cancel Order
                                                            </Button>
                                                        )}
                                                    </SheetFooter>
                                                </SheetContent>
                                            </Sheet>
                                        </div>
                                    </CardFooter>
                                </Card>
                            </TabsContent>
                        );
                    })}
                </Tabs>
            </div>
        </>
    );
}

MyOrder.layout = (page: ReactPortal) => (
    <StoreLayout>
        <ProfileLayout children={page} />
    </StoreLayout>
);
