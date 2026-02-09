import AppLayout from "@/layouts/app-layout";
import { ReactPortal, useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MoreHorizontal, Pencil, Plus, Trash } from "lucide-react";
import {
    Sheet,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { PageProps } from "@/types";
import { router, useForm, usePage } from "@inertiajs/react";
import { debounce } from "lodash";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import InputError from "@/components/input-error";
import { Textarea } from "@/components/ui/textarea";
import MultiSelect from "@/components/multi-select";
import DatePicker from "@/components/date-picker";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Option {
    value: string;
    label: string;
}

interface Author {
    id: number;
    name: string;
}

interface Category {
    id: number;
    name: string;
}

interface Book {
    id: number | null;
    isbn: string;
    image: File | null;
    title: string;
    description: string;
    price: string;
    published_at: Date | null;
    number_page: string;
    users: Author[];
    categories: Category[];
}

interface Props extends PageProps {
    search: string | undefined;
    authors: Option[];
    categories: Option[];
    books: {
        data: Book[];
        current_page: number;
        last_page: number;
    };
}

interface BookProps {
    id: number | null;
    isbn: string;
    image: File | null;
    title: string;
    description: string;
    price: string;
    published_at: Date | null;
    number_page: string;
    authors: Option[];
    categories: Option[];
}

export default function Book() {
    const { search, authors, categories, books } = usePage<Props>().props;
    const { data, setData, post, processing, errors, clearErrors } =
        useForm<BookProps>({
            id: null,
            isbn: "",
            image: null,
            title: "",
            description: "",
            price: "",
            published_at: null,
            number_page: "",
            authors: [],
            categories: [],
        });
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState(false);
    const [initialData, setInitialData] = useState<BookProps>();
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [showDelete, setShowDelete] = useState<{
        id: number | null;
        title: string;
        show: boolean;
    }>({
        id: null,
        title: "",
        show: false,
    });
    const [loadingDelete, setLoadingDelete] = useState(false);

    const handleOpen = (edit = false, book: Book | null = null) => {
        clearErrors();
        setEdit(edit);

        if (edit && book) {
            const currentData = {
                id: book.id,
                isbn: book.isbn,
                image: null,
                title: book.title,
                description: book.description,
                price: book.price,
                published_at: book.published_at
                    ? new Date(book.published_at)
                    : null,
                number_page: book.number_page,
                authors: book.users.map((a) => ({
                    value: String(a.id),
                    label: a.name,
                })),
                categories: book.categories.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                })),
            };
            setData(currentData);
            setInitialData(currentData);
        } else {
            const newData = {
                id: null,
                isbn: "",
                image: null,
                title: "",
                description: "",
                price: "",
                published_at: null,
                number_page: "",
                authors: [],
                categories: [],
            };
            setData(newData);
            setInitialData(newData);
        }

        setOpen(!open);
    };

    const handleSearch = debounce((value: string) => {
        router.get(
            "/admin/books",
            { search: value },
            {
                preserveState: true,
                replace: true,
            },
        );
    }, 1000);

    const hasUnsavedChanges = () => {
        return JSON.stringify(data) !== JSON.stringify(initialData);
    };

    const handleAdd = () => {
        clearErrors();
        post("/admin/books/add", {
            onSuccess: () => {
                handleOpen();
                toast.success("Book added successfully.");
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleUpdate = () => {
        clearErrors();
        post("/admin/books/update", {
            onSuccess: () => {
                handleOpen();
                toast.success("Book updated successfully.");
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        setLoadingDelete(true);
        clearErrors();
        router.post(
            "/admin/books/delete",
            { id: showDelete.id },
            {
                onSuccess: () => {
                    toast.success("Book deleted successfully.");
                },
                onFinish: () => {
                    setLoadingDelete(false);
                    setShowDelete({
                        id: null,
                        title: "",
                        show: false,
                    });
                },
                preserveState: true,
                preserveScroll: true,
            },
        );
    };

    return (
        <>
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                    <Input
                        defaultValue={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="max-w-xs"
                        placeholder="Search..."
                        type="search"
                    />
                    <Button onClick={() => handleOpen()}>
                        <Plus />
                        Add
                    </Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead></TableHead>
                            <TableHead>ISBN</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {books.data.map((book) => (
                            <TableRow key={book.id}>
                                <TableCell>
                                    <div className="size-14">
                                        <img
                                            src={`https://lh3.googleusercontent.com/d/${book.image}`}
                                            alt={book.title}
                                            className="size-full object-contain"
                                        />
                                    </div>
                                </TableCell>
                                <TableCell>{book.isbn}</TableCell>
                                <TableCell>{book.title}</TableCell>
                                <TableCell>{book.price}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
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
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    handleOpen(true, book)
                                                }
                                                className="text-primary"
                                            >
                                                <Pencil />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setShowDelete({
                                                        id: book.id,
                                                        title: book.title,
                                                        show: true,
                                                    })
                                                }
                                                className="text-destructive"
                                            >
                                                <Trash />
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Pagination className="justify-end">
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                className={cn(
                                    "cursor-default",
                                    books.current_page > 1
                                        ? ""
                                        : "pointer-events-none opacity-50",
                                )}
                                onClick={() =>
                                    books.current_page > 1 &&
                                    router.get(
                                        "/admin/books",
                                        {
                                            page: books.current_page - 1,
                                            search: search ?? "",
                                        },
                                        { preserveState: true },
                                    )
                                }
                            />
                        </PaginationItem>
                        {Array.from(
                            { length: books.last_page },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    isActive={page === books.current_page}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        router.get(
                                            "/admin/books",
                                            { page, search: search ?? "" },
                                            { preserveState: true },
                                        );
                                    }}
                                    className="cursor-default"
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        <PaginationItem>
                            <PaginationNext
                                className={cn(
                                    "cursor-default",
                                    books.current_page < books.last_page
                                        ? ""
                                        : "pointer-events-none opacity-50",
                                )}
                                onClick={() =>
                                    books.current_page < books.last_page &&
                                    router.get(
                                        "/admin/books",
                                        {
                                            page: books.current_page + 1,
                                            search: search ?? "",
                                        },
                                        { preserveState: true },
                                    )
                                }
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>

            <Sheet
                open={open}
                onOpenChange={(val) => {
                    if (!processing) {
                        if (!val && hasUnsavedChanges()) {
                            setShowConfirmClose(true);
                        } else {
                            setOpen(val);
                        }
                    }
                }}
            >
                <SheetContent className="flex flex-col">
                    <SheetHeader>
                        <SheetTitle>{edit ? "Edit" : "Add"} Book</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto space-y-4 p-2">
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label>Category</Label>
                            <MultiSelect
                                options={categories}
                                selected={data.categories}
                                onChange={(category) =>
                                    setData("categories", category)
                                }
                            />
                            <InputError message={errors.categories} />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label>Image</Label>
                            <Input
                                onChange={(e) => {
                                    const file = e.target.files?.[0] ?? null;
                                    setData("image", file);
                                }}
                                accept=".jpg,.jpeg,.png"
                                type="file"
                            />
                            <InputError message={errors.image} />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label>ISBN</Label>
                            <Input
                                value={data.isbn}
                                onChange={(e) =>
                                    setData("isbn", e.target.value)
                                }
                            />
                            <InputError message={errors.isbn} />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label>Title</Label>
                            <Input
                                value={data.title}
                                onChange={(e) =>
                                    setData("title", e.target.value)
                                }
                            />
                            <InputError message={errors.title} />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label>Authors</Label>
                            <MultiSelect
                                options={authors}
                                selected={data.authors}
                                onChange={(author) =>
                                    setData("authors", author)
                                }
                            />
                            <InputError message={errors.authors} />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label>Description</Label>
                            <Textarea
                                value={data.description}
                                onChange={(e) =>
                                    setData("description", e.target.value)
                                }
                            />
                            <InputError message={errors.description} />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label>Price</Label>
                            <Input
                                value={data.price}
                                onChange={(e) =>
                                    setData("price", e.target.value)
                                }
                            />
                            <InputError message={errors.price} />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label>Published at</Label>
                            <DatePicker
                                value={data.published_at ?? undefined}
                                onChange={(published_at) =>
                                    setData(
                                        "published_at",
                                        published_at ?? null,
                                    )
                                }
                            />
                            <InputError message={errors.published_at} />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label>Number of pages</Label>
                            <Input
                                value={data.number_page}
                                onChange={(e) =>
                                    setData("number_page", e.target.value)
                                }
                            />
                            <InputError message={errors.number_page} />
                        </div>
                    </div>
                    <SheetFooter>
                        <Button
                            onClick={() => {
                                if (!processing) {
                                    if (hasUnsavedChanges()) {
                                        setShowConfirmClose(true);
                                    } else {
                                        setOpen(false);
                                    }
                                }
                            }}
                            variant="ghost"
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={edit ? handleUpdate : handleAdd}
                            disabled={processing}
                        >
                            {processing && <Loader2 className="animate-spin" />}
                            {edit
                                ? processing
                                    ? "Updating"
                                    : "Update"
                                : processing
                                  ? "Saving"
                                  : "Save"}
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <AlertDialog open={showConfirmClose}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Discard changes?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You have unsaved changes. Are you sure you want to
                            cancel?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setShowConfirmClose(false)}
                        >
                            No, keep editing
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setShowConfirmClose(false);
                                setOpen(false);
                            }}
                        >
                            Yes, discard
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showDelete.show}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{showDelete.title}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to permanently delete? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() =>
                                setShowDelete({
                                    id: null,
                                    title: "",
                                    show: false,
                                })
                            }
                            disabled={loadingDelete}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={loadingDelete}
                        >
                            {loadingDelete && (
                                <Loader2 className="animate-spin" />
                            )}
                            {loadingDelete ? "Deleting" : "Delete"}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

Book.layout = (page: ReactPortal) => <AppLayout children={page} />;
