import Container from "@/components/container";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <Container>
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The post you're looking for doesn't exist or has been removed.
        </p>
        <Link href="/">
          <Button>
            Back to Home
          </Button>
        </Link>
      </div>
    </Container>
  );
}
