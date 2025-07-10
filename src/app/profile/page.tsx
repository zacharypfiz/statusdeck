import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import SignOutButton from "@/components/sign-out-button";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 p-6 bg-gray-50/50">
        <div className="container mx-auto max-w-2xl">
          <h1 className="text-3xl font-bold mb-6">Profile</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Manage your account settings and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Account Created
                </label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-gray-900">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email Confirmed
                </label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-gray-900">
                    {user.email_confirmed_at ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex flex-col space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">
                    Account Actions
                  </h3>
                  <SignOutButton />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 