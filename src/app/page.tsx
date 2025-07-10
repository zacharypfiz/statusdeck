import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/header";
import WebsiteCard from "@/components/website-card";

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

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
          {websites && websites.length === 0 && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800">
                No websites added yet. The sites below are demo data. Click "+ Add Site" to start monitoring your own websites.
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sitesToShow.map((site) => (
              <WebsiteCard 
                key={site.id} 
                website={site} 
                isDemo={!websites || websites.length === 0}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
