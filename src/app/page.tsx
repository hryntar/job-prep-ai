import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { UserButton, SignInButton } from "@clerk/nextjs";

export default function HomePage() {
   return (
      <div className="h-screen w-screen">
         <SignInButton />
         <UserButton />
         <ThemeToggle />
      </div>
   );
}