import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/header";
import WebsiteSearchWrapper from "@/components/website-search-wrapper";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  const { data: websites } = await supabase
    .from("websites")
    .select("*")
    .order("created_at", { ascending: false });

  const mockWebsites = [
    { id: "mock-1", name: "google.com", url: "https://google.com" },
    { id: "mock-2", name: "github.com", url: "https://github.com" },
    { id: "mock-3", name: "vercel.com", url: "https://vercel.com" },
    { id: "mock-4", name: "cloudflare.com", url: "https://cloudflare.com" },
  ];

  const sitesToShow = websites && websites.length > 0 ? websites : mockWebsites;
  const isDemo = !websites || websites.length === 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          {isDemo && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                No websites added yet. The sites below are demo data. Click &quot;+ Add Site&quot; to start monitoring your own websites.
              </p>
            </div>
          )}
          <WebsiteSearchWrapper websites={sitesToShow} isDemo={isDemo} />
        </div>
      </main>
    </div>
  );
}
