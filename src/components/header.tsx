"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import AddSiteModal from "./add-site-modal";
import Link from "next/link";

export default function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="py-4 px-6 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <h1 className="text-xl font-bold">StatusDeck</h1>
          </Link>
          <div className="flex gap-4">
            <Button onClick={() => setIsModalOpen(true)}>+ Add Site</Button>
            <Button variant="outline">Docs</Button>
          </div>
        </div>
      </header>
      <AddSiteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
} 