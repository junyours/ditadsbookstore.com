import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    placeholder?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    placeholder = "Select date",
}) => {
    const [open, setOpen] = React.useState(false);
    const [internalDate, setInternalDate] = React.useState<Date | undefined>(
        value,
    );

    React.useEffect(() => {
        if (value !== undefined) {
            setInternalDate(value);
        }
    }, [value]);

    const handleSelect = (date: Date | undefined) => {
        setInternalDate(date);
        setOpen(false);
        onChange?.(date);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    className="justify-between font-normal"
                >
                    {internalDate
                        ? internalDate.toLocaleDateString()
                        : placeholder}
                    <ChevronDownIcon />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto overflow-hidden p-0"
                align="start"
            >
                <Calendar
                    mode="single"
                    selected={internalDate}
                    captionLayout="dropdown"
                    onSelect={handleSelect}
                />
            </PopoverContent>
        </Popover>
    );
};

export default DatePicker;
