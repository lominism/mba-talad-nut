"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api-config";

export default function RegisterPage() {
  const router = useRouter();
  
  // Registration data
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // UI states
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    /* 
    if (!email.toLowerCase().endsWith("@magicboxsolution.com")) {
      setError("Only employees with a @magicboxsolution.com email can register.");
      return;
    }
    */

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create the user in Firebase to act as our Security Bouncer
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUid = userCredential.user.uid;

      // 2. Map their Firebase UID to their actual company profile inside PostgreSQL
      const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebaseUid,
          email,
          firstName,
          lastName,
          nickname: nickname || undefined,
          department: department || 'General'
        })
      });

      if (!response.ok) {
        throw new Error("Failed to create PostgreSQL profile.");
      }

      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to create an account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex bg-muted/20 min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg border-muted/50 my-8">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription>
            Register using your Magic Box Solutions email address.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRegister}>
          <CardContent className="space-y-4 pb-6">
            {error && (
              <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm font-medium">
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  type="text" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  type="text" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname (Optional)</Label>
                <Input 
                  id="nickname" 
                  type="text" 
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input 
                  id="department" 
                  type="text" 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="space-y-2 border-t pt-4 mt-2">
              <Label htmlFor="email">Work Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@magicboxsolution.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                placeholder="Minimum 6 characters"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Verify Password</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
                placeholder="Confirm your password"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 pt-4 border-t bg-muted/10">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Sign up"}
            </Button>
            <div className="text-center text-sm text-muted-foreground w-full">
              Already have an account?{" "}
              <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-500">
                Sign in here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
