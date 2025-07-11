"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AddSiteModal({
  isOpen,
  onClose,
  onSiteAdded,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSiteAdded?: () => void;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  const validateUrl = (input: string): { valid: boolean; url?: string; error?: string } => {
    const trimmed = input.trim();
    
    let urlToTest = trimmed;
    if (!urlToTest.startsWith("http://") && !urlToTest.startsWith("https://")) {
      urlToTest = "https://" + urlToTest;
    }

    // Use URL.canParse if available, otherwise fallback to try/catch
    const isValid = typeof URL.canParse === 'function' 
      ? URL.canParse(urlToTest)
      : (() => {
          try {
            new URL(urlToTest);
            return true;
          } catch {
            return false;
          }
        })();

    if (!isValid) {
      return { valid: false, error: "Please enter a valid URL" };
    }

    // Check if the URL has a valid domain structure
    const url = new URL(urlToTest);
    if (!url.hostname.includes('.')) {
      return { valid: false, error: "Please enter a complete domain (e.g., example.com)" };
    }

    return { valid: true, url: urlToTest };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!name.trim() || !url.trim()) {
      setError("Please fill in both fields");
      setLoading(false);
      return;
    }

    const urlValidation = validateUrl(url);
    if (!urlValidation.valid) {
      setError(urlValidation.error || "Invalid URL");
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("You must be logged in to add a website");
        setLoading(false);
        return;
      }

      const processedUrl = urlValidation.url!;

      const { error: insertError } = await supabase
        .from("websites")
        .insert([
          {
            name: name.trim(),
            url: processedUrl,
            user_id: user.id,
          },
        ]);

      if (insertError) {
        setError("Failed to add website. Please try again.");
        console.error("Insert error:", insertError);
        return;
      }

      setName("");
      setUrl("");
      onClose();
      onSiteAdded?.();
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setUrl("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new site</DialogTitle>
          <DialogDescription>
            Enter the details of the site you want to monitor.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Site Name
              </label>
              <Input
                id="name"
                placeholder="My Website"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="url" className="block text-sm font-medium mb-1">
                URL
              </label>
              <Input
                id="url"
                placeholder="example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "+ Add Site"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 