"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadCloud, Image as ImageIcon, X } from "lucide-react";
import { API_URL } from "@/lib/api-config";

export default function PostItemPage() {
  const router = useRouter();
  const t = useTranslations('Post');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setIsLoadingAuth(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setIsUploading(true);
    const newUrls = [...imageUrls];
    
    for (const file of e.target.files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "talad-items");
      
      try {
        const res = await fetch("https://api.cloudinary.com/v1_1/ds631lj1s/image/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) {
          newUrls.push(data.secure_url);
        }
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
      }
    }
    
    setImageUrls(newUrls);
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const firebaseUid = auth.currentUser?.uid;
    if (!firebaseUid) {
      alert("Please log in to post an item.");
      return;
    }

    setIsSubmitting(true);
    
    const payload = {
      firebaseUid,
      name: (document.getElementById('title') as HTMLInputElement).value,
      price: parseFloat((document.getElementById('price') as HTMLInputElement).value) || 0,
      quality: (document.getElementById('condition') as HTMLSelectElement).value,
      description: (document.getElementById('description') as HTMLTextAreaElement).value,
      photoUrls: imageUrls
    };

    try {
      const res = await fetch(`${API_URL}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to save post");
      
      setIsSubmitting(false);
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Failed to submit item, check console");
      setIsSubmitting(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="flex bg-muted/20 min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <div className="text-muted-foreground animate-pulse font-medium">{t('verifyingSession')}</div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 bg-muted/10 min-h-[calc(100vh-4rem)]">
      <Card className="shadow-lg border-muted/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{t('title')}</CardTitle>
          <CardDescription>
            {t('subtitle')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="title">{t('itemTitle')} <span className="text-red-500">*</span></Label>
              <Input id="title" placeholder={t('titlePlaceholder')} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">{t('price')}</Label>
                <Input id="price" type="number" placeholder={t('pricePlaceholder')} min="0" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">{t('condition')}</Label>
                <select 
                  id="condition" 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  defaultValue="Used"
                >
                  <option value="New">{t('new')}</option>
                  <option value="Used">{t('used')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea 
                id="description" 
                placeholder={t('descPlaceholder')} 
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-4">
              <Label>{t('itemPhotos')}</Label>
              
              {/* Uploaded Thumbnails Preview */}
              {imageUrls.length > 0 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {imageUrls.map((url, idx) => (
                    <div key={idx} className="relative h-24 w-24 shrink-0 rounded-md overflow-hidden border">
                      <img src={url} alt={`Upload ${idx}`} className="object-cover w-full h-full" />
                      <button 
                        type="button"
                        onClick={() => setImageUrls(imageUrls.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="relative border-2 border-dashed border-input rounded-lg p-8 flex flex-col items-center justify-center gap-2 bg-muted/10 hover:bg-muted/30 transition-colors">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                <div className="p-3 bg-muted rounded-full">
                  {isUploading ? (
                    <div className="h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UploadCloud className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="text-sm font-medium">
                  {isUploading ? t('uploading') : t('clickToUpload')}
                </div>
                <div className="text-xs text-muted-foreground">{t('formats')}</div>
              </div>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t p-6 bg-muted/10">
            <Button variant="outline" type="button" onClick={() => router.push("/")}>
              {t('cancel')}
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
              {isSubmitting ? t('posting') : t('postItem')}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
