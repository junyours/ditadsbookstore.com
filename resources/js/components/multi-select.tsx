import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface Option {
    value: string;
    label: string;
}

interface MultiSelectProps {
    options: Option[];
    selected: Option[];
    onChange: (selected: Option[]) => void;
    placeholder?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
    options,
    selected,
    onChange,
    placeholder = "Select...",
}) => {
    const [open, setOpen] = useState(false);

    const toggleValue = (value: string) => {
        value = String(value);

        const exists = selected.find((s) => String(s.value) === value);
        if (exists) {
            onChange(selected.filter((s) => String(s.value) !== value));
        } else {
            const option = options.find((o) => String(o.value) === value);
            if (option)
                onChange([
                    ...selected,
                    { ...option, value: String(option.value) },
                ]);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    aria-expanded={open}
                    className="w-full justify-between h-auto min-h-9"
                    role="combobox"
                    variant="outline"
                >
                    <div className="flex flex-wrap gap-1">
                        {selected.length > 0 ? (
                            selected.map((s) => (
                                <Badge
                                    key={s.value}
                                    variant="secondary"
                                    className="mr-1 flex items-center"
                                >
                                    {s.label}
                                    <button
                                        className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleValue(s.value);
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter")
                                                toggleValue(s.value);
                                        }}
                                    >
                                        <X className="size-3 text-muted-foreground hover:text-foreground" />
                                    </button>
                                </Badge>
                            ))
                        ) : (
                            <span className="text-muted-foreground">
                                {placeholder}
                            </span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                        <CommandEmpty>No options found.</CommandEmpty>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    value={option.value}
                                    onSelect={() => toggleValue(option.value)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 size-4",
                                            selected.some(
                                                (s) =>
                                                    String(s.value) ===
                                                    String(option.value),
                                            )
                                                ? "opacity-100"
                                                : "opacity-0",
                                        )}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default MultiSelect;
