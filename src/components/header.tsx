import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="py-4 px-6 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">StatusDeck</h1>
        <div className="flex gap-4">
          <Button>Add Site</Button>
          <Button variant="outline">Docs</Button>
        </div>
      </div>
    </header>
  );
} 