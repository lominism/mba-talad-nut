"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";

export default function MyAccountPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      
      setCurrentUser(user);
      
      try {
        const res = await fetch(`http://localhost:4000/users/${user.uid}`);
        if (res.ok) {
          const profile = await res.json();
          setFirstName(profile.firstName || "");
          setLastName(profile.lastName || "");
          setNickname(profile.nickname || "");
          setDepartment(profile.department || "");
          setEmail(profile.email || "");
          setPhotoUrl(profile.photoUrl || "");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "talad-items"); // Reusing your existing Cloudinary preset
    
    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/ds631lj1s/image/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.secure_url) {
        setPhotoUrl(data.secure_url);
      }
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
    }
    setIsUploading(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);
    
    try {
      const res = await fetch(`http://localhost:4000/users/${currentUser.uid}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          nickname,
          department,
          photoUrl
        })
      });
      
      if (!res.ok) throw new Error("Failed to update profile");
      alert("Profile successfully updated!");
    } catch (err) {
      console.error(err);
      alert("Something went wrong saving the profile.");
    }
    setIsSaving(false);
  };

  const getInitials = () => {
    if (firstName && lastName) return (firstName[0] + lastName[0]).toUpperCase();
    return "MB";
  };

  if (isLoadingAuth) {
    return (
      <div className="flex bg-muted/20 min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="text-muted-foreground animate-pulse font-medium">Loading your profile...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-xl mx-auto py-10 px-4 bg-muted/10 min-h-[calc(100vh-4rem)]">
      <Card className="shadow-lg border-muted/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">My Account</CardTitle>
          <CardDescription>
            Manage your personal profile details and avatar.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSaveProfile}>
          <CardContent className="space-y-6">
            
            {/* Avatar Upload Box */}
            <div className="flex flex-col items-center justify-center space-y-3 mb-6">
              <div className="relative group cursor-pointer">
                <Avatar className="h-32 w-32 border-4 border-background shadow-md group-hover:opacity-80 transition-opacity">
                  <AvatarImage src={photoUrl || undefined} className="object-cover" />
                  <AvatarFallback className="text-3xl bg-blue-100 text-blue-700 font-bold">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploading ? (
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  ) : (
                    <Camera className="h-8 w-8 text-white" />
                  )}
                </div>
                
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </div>
              <p className="text-xs text-muted-foreground">Click the circle to upload a new profile picture</p>
            </div>

            {/* Email (Disabled) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-muted-foreground font-normal">(Cannot be changed)</span></Label>
              <Input id="email" type="email" value={email} disabled className="bg-muted cursor-not-allowed" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname (Optional)</Label>
                <Input id="nickname" value={nickname} onChange={e => setNickname(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={department} onChange={e => setDepartment(e.target.value)} required />
              </div>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t p-6 bg-muted/10">
            <Button variant="outline" type="button" onClick={() => router.push("/")}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSaving || isUploading}>
              {isSaving ? "Saving..." : "Save Profile"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
