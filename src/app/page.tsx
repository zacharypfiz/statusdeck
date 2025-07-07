import Header from "@/components/header";
import WebsiteCard from "@/components/website-card";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 bg-gray-50/50">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <WebsiteCard siteName="google.com" />
            <WebsiteCard siteName="github.com" />
            <WebsiteCard siteName="vercel.com" />
            <WebsiteCard siteName="cloudflare.com" />
          </div>
        </div>
      </main>
    </div>
  );
}
