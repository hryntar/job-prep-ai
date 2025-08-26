import { UserButton, SignInButton } from "@clerk/nextjs";

export default function HomePage() {
   return (
      <div className="flex h-screen w-screen items-center justify-center">
         <SignInButton />
         <UserButton />
      </div>
   );
}