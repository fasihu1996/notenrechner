import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <Image
        className="mb-5 rounded-2xl"
        src="/notfound.gif"
        width={500}
        height={500}
        alt="not found gif"
        unoptimized
      />
      <p className="text-foreground mb-8 text-4xl font-bold">
        The page you are looking for does not exist.
      </p>
      <Link href="/" className="text-primary underline">
        Go back home
      </Link>
    </div>
  );
}
