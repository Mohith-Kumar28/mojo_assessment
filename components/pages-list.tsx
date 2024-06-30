"use client";

import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
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
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
const pagesData: PagesData = {
  data: [
    {
      access_token:
        "EABuacXANtYUBO0b9pXKikMkTwV1F9kmTJPRGN75nMC4scEwLbAYM1TumXfTbeQVcrk2qMIGJWoS4VFl36UNDmOJ7MyajBLraUCIpBpfZC2j2du28ry877yHtTt5g336oHXCDZAgfBUSwmKPg3NQfhzG4LIAtpuOTZCFgkj8L8NGKRUuvJf5SkZCWZAKhQr4UlNpqeeYejApTa6o6UCSZCZBoxa9OTnp0y3vyQZDZD",
      category: "Teens & Kids Website",
      category_list: [
        {
          id: "2716",
          name: "Teens & Kids Website",
        },
      ],
      name: "Test1",
      id: "298712583335639",
      tasks: [
        "ADVERTISE",
        "ANALYZE",
        "CREATE_CONTENT",
        "MESSAGING",
        "MODERATE",
        "MANAGE",
      ],
    },
  ],
  paging: {
    cursors: {
      before:
        "QVFIUm52aTcycEtPTGpoU0VtNWpWWm5SR1FzZAFE0TnlPaTFaTVhFWXZApUUg5cE1SM0t4Si01ZAnV0NmtNSFQ5RFdkZAG0zNXJBM0tnQUw1eHk5WUpGbVN0a2NR",
      after:
        "QVFIUm52aTcycEtPTGpoU0VtNWpWWm5SR1FzZAFE0TnlPaTFaTVhFWXZApUUg5cE1SM0t4Si01ZAnV0NmtNSFQ5RFdkZAG0zNXJBM0tnQUw1eHk5WUpGbVN0a2NR",
    },
  },
};

const convertPagesData = (pagesData: PagesData): ConvertedPage[] => {
  return pagesData.data.map((page) => ({
    value: page.name, // Assuming you want to use the category as both value and label
    label: page.name,
  }));
};

const formattedPages = convertPagesData(pagesData);

export default function PagesList() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const { data: session }: any = useSession();
  const accessToken = session.accessToken;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v20.0/me/accounts?access_token=${accessToken}`
        );

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const pagesData: PagesData = await response.json();
        const convertedData = convertPagesData(pagesData);
        // setData(convertedData);
        localStorage.setItem("pagesData", JSON.stringify(convertedData)); // Save data to local storage
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? formattedPages.find((page) => page.value === value)?.label
            : "Select page..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search page..." />
          <CommandList>
            <CommandEmpty>No page found.</CommandEmpty>
            <CommandGroup>
              {formattedPages.map((page) => (
                <CommandItem
                  key={page.value}
                  value={page.value}
                  onSelect={(currentValue) => {
                    setValue(currentValue === value ? "" : currentValue);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === page.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {page.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
