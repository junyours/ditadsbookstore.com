import StoreLayout from "@/layouts/store-layout";
import { ReactPortal, useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { PageProps } from "@/types";
import { usePage } from "@inertiajs/react";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import InputError from "@/components/input-error";
import Loading from "@/components/loading";

interface Book {
    image: string;
    title: string;
    price: number;
}

interface Item {
    id: number;
    user_id: number;
    book_id: number;
    quantity: number;
    book: Book;
}

interface Address {
    region: string;
    province: string;
    municipality: string;
    barangay: string;
    street: string;
    postal_code: string;
    phone_number: string;
}

interface Props extends PageProps {
    items: Item[];
    address: Address;
}

export default function Checkout() {
    const { items, address } = usePage<Props>().props;
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "PHP",
        }).format(amount);
    const [regions, setRegions] = useState<any[]>([]);
    const [provinces, setProvinces] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [barangays, setBarangays] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const shippingSchema = z.object({
        region: z.string().nonempty("Region is required"),
        province: z.string().nonempty("Province is required"),
        municipality: z.string().nonempty("City/Municipality is required"),
        barangay: z.string().nonempty("Barangay is required"),
        street: z.string().nonempty("Street is required"),
        postal_code: z.string().nonempty("Zip code is required"),
        phone_number: z
            .string()
            .nonempty("Phone number is required")
            .min(11, "Phone number is invalid"),
        save_address: z.boolean().optional(),
    });

    type ShippingForm = z.infer<typeof shippingSchema>;

    const form = useForm<ShippingForm>({
        resolver: zodResolver(shippingSchema),
        defaultValues: {
            region: "",
            province: "",
            municipality: "",
            barangay: "",
            street: "",
            postal_code: "",
            phone_number: "",
            save_address: true,
        },
    });

    const {
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = form;

    const region = watch("region");
    const province = watch("province");
    const municipality = watch("municipality");
    const barangay = watch("barangay");

    const totalAmount = items.reduce((total, cart) => {
        return total + cart.book.price * cart.quantity;
    }, 0);

    const totalItem = items.reduce((total, cart) => {
        return total + cart.quantity;
    }, 0);

    const fetchRegions = async () => {
        const { data } = await axios.get("https://psgc.cloud/api/v2/regions");
        setRegions(data.data);
    };

    const fetchProvinces = async (regionCode: string) => {
        const { data } = await axios.get(
            `https://psgc.cloud/api/v2/regions/${regionCode}/provinces`,
        );
        setProvinces(data.data);
    };

    const fetchCities = async (regionCode: string, provinceCode: string) => {
        const { data } = await axios.get(
            `https://psgc.cloud/api/v2/regions/${regionCode}/provinces/${provinceCode}/cities-municipalities`,
        );
        setCities(data.data);
    };

    const fetchBarangays = async (
        regionCode: string,
        provinceCode: string,
        cityCode: string,
    ) => {
        const { data } = await axios.get(
            `https://psgc.cloud/api/v2/regions/${regionCode}/provinces/${provinceCode}/cities-municipalities/${cityCode}/barangays`,
        );
        setBarangays(data.data);
    };

    useEffect(() => {
        fetchRegions();
    }, []);

    useEffect(() => {
        if (!region) return;

        fetchProvinces(region);
        setValue("province", "");
        setValue("municipality", "");
        setValue("barangay", "");
        setProvinces([]);
        setCities([]);
        setBarangays([]);
    }, [region]);

    useEffect(() => {
        if (!province) return;

        fetchCities(region, province);
        setValue("municipality", "");
        setValue("barangay", "");
        setCities([]);
        setBarangays([]);
    }, [province]);

    useEffect(() => {
        if (!municipality) return;

        fetchBarangays(region, province, municipality);
        setValue("barangay", "");
        setBarangays([]);
    }, [municipality]);

    const onSubmit = async (data: ShippingForm) => {
        setLoading(true);
        try {
            const res = await axios.post("/pay/checkout", { data, items });
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
            <form onSubmit={handleSubmit(onSubmit)} className="flex gap-6">
                <div className="flex-1">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Shipping Address</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="p-4 space-y-4">
                                    <div className="grid w-full items-center gap-2">
                                        <Label>Region</Label>
                                        <Select
                                            value={region}
                                            onValueChange={(value) =>
                                                setValue("region", value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select Region" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {regions.map((r) => (
                                                    <SelectItem
                                                        key={r.code}
                                                        value={r.name}
                                                    >
                                                        {r.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.region?.message}
                                        />
                                    </div>
                                    <div className="grid w-full items-center gap-2">
                                        <Label>Province</Label>
                                        <Select
                                            value={province}
                                            onValueChange={(value) =>
                                                setValue("province", value)
                                            }
                                        >
                                            <SelectTrigger disabled={!region}>
                                                <SelectValue placeholder="Select Province" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {provinces.map((p) => (
                                                    <SelectItem
                                                        key={p.code}
                                                        value={p.name}
                                                    >
                                                        {p.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.province?.message}
                                        />
                                    </div>
                                    <div className="grid w-full items-center gap-2">
                                        <Label>City/Municipality</Label>
                                        <Select
                                            value={municipality}
                                            onValueChange={(value) =>
                                                setValue("municipality", value)
                                            }
                                        >
                                            <SelectTrigger disabled={!province}>
                                                <SelectValue placeholder="Select City/Municipality" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cities.map((c) => (
                                                    <SelectItem
                                                        key={c.code}
                                                        value={c.name}
                                                    >
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={
                                                errors.municipality?.message
                                            }
                                        />
                                    </div>
                                    <div className="grid w-full items-center gap-2">
                                        <Label>Barangay</Label>
                                        <Select
                                            value={barangay}
                                            onValueChange={(value) =>
                                                setValue("barangay", value)
                                            }
                                        >
                                            <SelectTrigger
                                                disabled={!municipality}
                                            >
                                                <SelectValue placeholder="Select Barangay" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {barangays.map((b) => (
                                                    <SelectItem
                                                        key={b.code}
                                                        value={b.name}
                                                    >
                                                        {b.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={errors.barangay?.message}
                                        />
                                    </div>
                                    <div className="grid w-full items-center gap-2">
                                        <Label>Street</Label>
                                        <Input
                                            onChange={(e) =>
                                                setValue(
                                                    "street",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={errors.street?.message}
                                        />
                                    </div>
                                    <div className="grid w-full items-center gap-2">
                                        <Label>Zip Code</Label>
                                        <Input
                                            onChange={(e) =>
                                                setValue(
                                                    "postal_code",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors.postal_code?.message
                                            }
                                        />
                                    </div>
                                    <div className="grid w-full items-center gap-2">
                                        <Label>Phone Number</Label>
                                        <Input
                                            onChange={(e) =>
                                                setValue(
                                                    "phone_number",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={
                                                errors.phone_number?.message
                                            }
                                        />
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                    {/* <div className="flex items-center gap-2 p-4">
                        <Checkbox
                            id="checked"
                            checked={watch("save_address")}
                            onCheckedChange={(val) =>
                                setValue("save_address", Boolean(val))
                            }
                        />
                        <Label htmlFor="checked">
                            Save this shipping address
                        </Label>
                    </div> */}
                </div>
                <div className="flex-1 space-y-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order Summary</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="p-4 space-y-4">
                                    <Accordion
                                        type="single"
                                        collapsible
                                        defaultValue="item-1"
                                    >
                                        <AccordionItem value="item-1">
                                            <AccordionTrigger className="pt-0 pb-4 font-semibold">
                                                Items
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-2">
                                                {items.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="flex gap-2"
                                                    >
                                                        <img
                                                            src={`https://lh3.googleusercontent.com/d/${item.book.image}`}
                                                            alt={
                                                                item.book.title
                                                            }
                                                            className="w-28"
                                                        />
                                                        <div className="flex flex-col justify-between">
                                                            <h1 className="font-semibold line-clamp-2">
                                                                {
                                                                    item.book
                                                                        .title
                                                                }
                                                            </h1>
                                                            <div className="flex items-center justify-between">
                                                                <p className="font-semibold">
                                                                    x
                                                                    {
                                                                        item.quantity
                                                                    }
                                                                </p>
                                                                <p className=" font-semibold">
                                                                    {formatCurrency(
                                                                        item
                                                                            .book
                                                                            .price,
                                                                    )}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>
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
                    <Button className="w-full">Place Order</Button>
                </div>
            </form>
        </>
    );
}

Checkout.layout = (page: ReactPortal) => <StoreLayout children={page} />;
