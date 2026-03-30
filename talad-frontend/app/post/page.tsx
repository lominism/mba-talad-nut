"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadCloud, Image as ImageIcon } from "lucide-react";

export default function PostItemPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    // Mock user session verification
    const user = localStorage.getItem("mbs_user");
    if (!user) {
      router.push("/login");
    } else {
      setIsLoadingAuth(false);
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/");
    }, 1000);
  };

  if (isLoadingAuth) {
    return (
      <div className="flex bg-muted/20 min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="text-muted-foreground animate-pulse font-medium">Verifying session...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 bg-muted/10 min-h-[calc(100vh-4rem)]">
      <Card className="shadow-lg border-muted/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Post a new item</CardTitle>
          <CardDescription>
            List an item for sale or give it away for free to your MBS colleagues.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="title">Item Title <span className="text-red-500">*</span></Label>
              <Input id="title" placeholder="e.g. Ergonomic Office Chair" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (THB)</Label>
                <Input id="price" type="number" placeholder="Enter 0 if free" min="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <select 
                  id="condition" 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue="Used"
                >
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Used">Used</option>
                  <option value="Free">Free / Giveaway</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                placeholder="Include any relevant details like brand, age, or reason for selling." 
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-2">
              <Label>Item Photo</Label>
              <div className="border-2 border-dashed border-input rounded-lg p-8 flex flex-col items-center justify-center gap-2 bg-muted/10 hover:bg-muted/30 transition-colors cursor-pointer">
                <div className="p-3 bg-muted rounded-full">
                  <UploadCloud className="h-6 w-6 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium">Click to upload or drag and drop</div>
                <div className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 5MB</div>
              </div>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t p-6 bg-muted/10">
            <Button variant="outline" type="button" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? "Posting..." : "Post Item"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
