import Container from "@/components/container";
import Link from "next/link";

export default function NotFound() {
  return (
    <Container>
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The post you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Back to Home
        </Link>
      </div>
    </Container>
  );
}
