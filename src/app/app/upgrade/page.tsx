import { BackLink } from "@/components/BackLink";
import { Alert } from "@/components/ui/alert";
import { PricingTable } from "@/services/clerk/components/PricingTable";
import { AlertTriangle } from "lucide-react";


export default function UpgradePage() {
   return (
      <div className="container mx-auto py-4 max-w-6xl">
         <div className="mb-4">
            <BackLink href="/app">Dashboard</BackLink>
         </div>

         <div className="space-y-16">
            <Alert variant="warning">
               <AlertTriangle className="size-6" />
               <span className="ml-2">
                  You have reached the limit of your current plan. Please upgrade to continue using all features.
               </span>
            </Alert>

            <PricingTable />
         </div>
      </div>
   )
}