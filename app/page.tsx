import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import Link from "next/link";
export default function Home() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-8xl font-extrabold">Filmadžija</h1>
        <p className="text-lg text-yellow-600">Mesto za ljubitelje filmova.</p>
        <Link href="/search" className="hover:cursor-pointer">
          <Button variant="outline" className="text-2xl py-10 my-8 hover:cursor-pointer">
            Pretrazi filmove u ponudi! <Search className="text-yellow-600" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
