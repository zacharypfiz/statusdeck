import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function ConfirmEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const params = await searchParams;
  const email = params.email;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="h-6 w-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription className="text-base">
            We've sent a confirmation link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {email && (
            <div className="p-3 bg-gray-50 rounded-md text-center">
              <p className="text-sm text-gray-600">Email sent to:</p>
              <p className="font-medium text-gray-900">{email}</p>
            </div>
          )}
          
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <strong>Next steps:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Check your email inbox</li>
              <li>Look for an email from StatusDeck</li>
              <li>Click the confirmation link in the email</li>
              <li>Return here to sign in</li>
            </ol>
          </div>

          <div className="pt-4 space-y-3">
            <p className="text-xs text-gray-500 text-center">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <Link href="/create-account" className="text-primary hover:underline">
                try again
              </Link>
            </p>
            
            <div className="flex justify-center">
              <Button asChild variant="outline">
                <Link href="/login">Return to Sign In</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 