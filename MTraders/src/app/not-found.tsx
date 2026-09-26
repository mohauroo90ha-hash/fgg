import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-x flex flex-col items-center justify-center py-24 text-center">
      <p className="text-6xl font-black text-zinc-200">404</p>
      <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-zinc-500">
        The page you're looking for doesn't exist or was moved.
      </p>
      <Link href="/" className="mt-6">
        <Button size="lg">Back to home</Button>
      </Link>
    </div>
  );
}
