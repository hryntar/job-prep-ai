"use client";

import { BrainCircuit, User, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatar } from "@/components/UserAvatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";

export function Navbar({ user }: { user: { name: string; imageUrl: string } }) {
   const { openUserProfile, signOut } = useClerk();

   const handleProfileClick = () => {
      openUserProfile();
   };

   const handleSignOut = () => {
      signOut();
   };

   return (
      <nav className="w-full h-[var(--spacing-header)] border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
         <div className="container mx-auto px-4 h-full flex items-center justify-between">
            {/* Left side - Logo and App Name */}
            <Link href="/app" className="flex items-center gap-2">
               <BrainCircuit className="h-8 w-8 text-primary" />
               <span className="text-xl font-semibold text-foreground">Landr</span>
            </Link>

            {/* Right side - Theme Toggle and User Menu */}
            <div className="flex items-center gap-2">
               <ThemeToggle />

               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                     <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <UserAvatar user={user} />
                     </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                     <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                     </DropdownMenuItem>
                     <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                     </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
            </div>
         </div>
      </nav>
   );
}
