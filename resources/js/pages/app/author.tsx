import AppLayout from "@/layouts/app-layout";
import { ReactPortal, useEffect, useState } from "react";
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
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Author {
    id: number | null;
    name: string;
    email: string;
}

interface Props extends PageProps {
    search: string | undefined;
    authors: {
        data: Author[];
        current_page: number;
        last_page: number;
    };
}

export default function Author() {
    const { search, authors } = usePage<Props>().props;
    const { data, setData, post, processing, errors, clearErrors } =
        useForm<Author>({
            id: null,
            name: "",
            email: "",
        });
    const [open, setOpen] = useState(false);
    const [edit, setEdit] = useState(false);
    const [initialData, setInitialData] = useState<Author>();
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [showDelete, setShowDelete] = useState<{
        id: number | null;
        name: string;
        show: boolean;
    }>({
        id: null,
        name: "",
        show: false,
    });
    const [loadingDelete, setLoadingDelete] = useState(false);

    const handleOpen = (edit = false, author: Author | null = null) => {
        clearErrors();
        setEdit(edit);

        if (edit && author) {
            const currentData = {
                id: author.id,
                name: author.name,
                email: author.email,
            };
            setData(currentData);
            setInitialData(currentData);
        } else {
            const newData = {
                id: null,
                name: "",
                email: "",
            };
            setData(newData);
            setInitialData(newData);
        }

        setOpen(!open);
    };

    const handleSearch = debounce((value: string) => {
        router.get(
            "/admin/authors",
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
        post("/admin/authors/add", {
            onSuccess: () => {
                handleOpen();
                toast.success("Author added successfully.");
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleUpdate = () => {
        clearErrors();
        post("/admin/authors/update", {
            onSuccess: () => {
                handleOpen();
                toast.success("Author updated successfully.");
            },
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleDelete = () => {
        setLoadingDelete(true);
        clearErrors();
        router.post(
            "/admin/authors/delete",
            { id: showDelete.id },
            {
                onSuccess: () => {
                    toast.success("Author deleted successfully.");
                },
                onFinish: () => {
                    setLoadingDelete(false);
                    setShowDelete({
                        id: null,
                        name: "",
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
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {authors.data.map((author) => (
                            <TableRow key={author.id}>
                                <TableCell>{author.name}</TableCell>
                                <TableCell>{author.email}</TableCell>
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
                                                    handleOpen(true, author)
                                                }
                                                className="text-primary"
                                            >
                                                <Pencil />
                                                Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    setShowDelete({
                                                        id: author.id,
                                                        name: author.name,
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
                                    authors.current_page > 1
                                        ? ""
                                        : "pointer-events-none opacity-50",
                                )}
                                onClick={() =>
                                    authors.current_page > 1 &&
                                    router.get(
                                        "/admin/authors",
                                        {
                                            page: authors.current_page - 1,
                                            search: search ?? "",
                                        },
                                        { preserveState: true },
                                    )
                                }
                            />
                        </PaginationItem>
                        {Array.from(
                            { length: authors.last_page },
                            (_, i) => i + 1,
                        ).map((page) => (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    isActive={page === authors.current_page}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        router.get(
                                            "/admin/authors",
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
                                    authors.current_page < authors.last_page
                                        ? ""
                                        : "pointer-events-none opacity-50",
                                )}
                                onClick={() =>
                                    authors.current_page < authors.last_page &&
                                    router.get(
                                        "/admin/authors",
                                        {
                                            page: authors.current_page + 1,
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
                        <SheetTitle>{edit ? "Edit" : "Add"} Author</SheetTitle>
                    </SheetHeader>
                    <div className="flex-1 overflow-y-auto space-y-4 p-2">
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label>Name</Label>
                            <Input
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                            />
                            <InputError message={errors.name} />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-2">
                            <Label>Email</Label>
                            <Input
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                            />
                            <InputError message={errors.email} />
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
                        <AlertDialogTitle>{showDelete.name}</AlertDialogTitle>
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
                                    name: "",
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

Author.layout = (page: ReactPortal) => <AppLayout children={page} />;
