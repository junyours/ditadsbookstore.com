import { AlertDialog, AlertDialogContent } from "@/components/ui/alert-dialog";
import { Loader } from "lucide-react";

export default function Loading({ open }: { open: boolean }) {
    return (
        <AlertDialog open={open}>
            <AlertDialogContent className="p-0 border-none bg-transparent shadow-none justify-center">
                <Loader className="size-14 animate-spin text-green-500" />
            </AlertDialogContent>
        </AlertDialog>
    );
}
