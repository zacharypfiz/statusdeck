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
          <div className="flex gap-4 items-center">
            <Button onClick={() => setIsModalOpen(true)}>+ Add Site</Button>
            <Button variant="outline">Docs</Button>
            <Link 
              href="/profile" 
              className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg
                className="h-6 w-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </Link>
          </div>
        </div>
      </header>
      <AddSiteModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
} 