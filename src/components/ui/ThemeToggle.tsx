"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "./button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";
import { Sun, Moon, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
   const [mounted, setMounted] = useState(false);
   const { setTheme, theme } = useTheme();

   useEffect(() => {
      setMounted(true);
   }, []);

   if (!mounted) return null;

   return (
      <DropdownMenu>
         <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Toggle theme">
               {theme === "dark" ? <Moon className="h-5 w-5" /> : theme === "light" ? <Sun className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}
            </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end">
            <DropdownMenuItem
               onClick={() => setTheme("light")}
               className={cn(theme === "light" && "bg-accent text-accent-foreground", "cursor-pointer")}
            >
               <Sun className="mr-2 h-4 w-4" /> Light
            </DropdownMenuItem>
            <DropdownMenuItem
               onClick={() => setTheme("dark")}
               className={cn(theme === "dark" && "bg-accent text-accent-foreground", "cursor-pointer")}
            >
               <Moon className="mr-2 h-4 w-4" /> Dark
            </DropdownMenuItem>
            <DropdownMenuItem
               onClick={() => setTheme("system")}
               className={cn(theme === "system" && "bg-accent text-accent-foreground", "cursor-pointer")}
            >
               <Laptop className="mr-2 h-4 w-4" /> System
            </DropdownMenuItem>
         </DropdownMenuContent>
      </DropdownMenu>
   );
}
