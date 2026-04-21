"use client";

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { UploadCloud, X, Loader2, Star } from "lucide-react";

export default function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState(0);
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      }
    });

    async function fetchItem() {
      try {
        const res = await fetch(`http://127.0.0.1:4000/items/${unwrappedParams.id}`);
        if (res.ok) {
          const data = await res.json();
          setTitle(data.name || "");
          setPrice(data.price || 0);
          setDescription(data.description || "");
          setImageUrls(data.photoUrls || []);
        } else {
          router.push("/my-listings");
        }
      } catch (err) {
        console.error("Failed to fetch item", err);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchItem();
    return () => unsubscribe();
  }, [unwrappedParams.id, router]);

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

  const setAsMainImage = (index: number) => {
    if (index === 0) return;
    const newUrls = [...imageUrls];
    const [selectedImage] = newUrls.splice(index, 1);
    newUrls.unshift(selectedImage);
    setImageUrls(newUrls);
  };

  const removeImage = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const payload = {
      name: title,
      price: price,
      description: description,
      photoUrls: imageUrls
    };

    try {
      const res = await fetch(`http://127.0.0.1:4000/items/${unwrappedParams.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to save updates");
      
      router.push("/my-listings");
    } catch (err) {
      console.error(err);
      alert("Failed to update item, check console");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex bg-muted/10 min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-10 px-4 bg-muted/10 min-h-[calc(100vh-4rem)]">
      <Card className="shadow-lg border-muted/50">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Edit Listing</CardTitle>
          <CardDescription>
            Update the details of your item.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="title">Item Title <span className="text-red-500">*</span></Label>
              <Input 
                id="title" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g. Ergonomic Office Chair" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (THB)</Label>
              <Input 
                id="price" 
                type="number" 
                value={price} 
                onChange={(e) => setPrice(Number(e.target.value))} 
                min="0" 
                required 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Include any relevant details like brand, age, or reason for selling." 
                className="min-h-[100px]"
              />
            </div>

            <div className="space-y-4">
              <Label>Item Photos</Label>
              <p className="text-sm text-muted-foreground mt-0 mb-3">The first image is the main cover photo for your listing.</p>
              
              {/* Uploaded Thumbnails Preview */}
              {imageUrls.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-2">
                  {imageUrls.map((url, idx) => (
                    <div key={`${url}-${idx}`} className={`relative aspect-square rounded-md overflow-hidden border-2 group ${idx === 0 ? 'border-amber-400 shadow-sm' : 'border-slate-200'}`}>
                      <img src={url} alt={`Upload ${idx}`} className="object-cover w-full h-full" />
                      
                      {/* Top right delete button */}
                      <button 
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-80 hover:opacity-100 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>

                      {/* Main Image Banner / Action */}
                      {idx === 0 ? (
                        <div className="absolute bottom-0 inset-x-0 bg-amber-400/90 text-amber-950 text-[10px] font-bold text-center py-1 flex justify-center items-center gap-1 backdrop-blur-sm">
                          <Star className="h-3 w-3 fill-amber-950" /> Main Image
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <Button 
                             type="button"
                             size="sm"
                             variant="secondary"
                             onClick={() => setAsMainImage(idx)}
                             className="h-7 text-xs font-medium cursor-pointer shadow-md w-10/12"
                           >
                             Set as Main
                           </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="relative border-2 border-dashed border-input rounded-lg p-8 flex flex-col items-center justify-center gap-2 bg-muted/10 hover:bg-muted/30 transition-colors mt-2">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                <div className="p-3 bg-muted rounded-full pointer-events-none">
                  {isUploading ? (
                    <div className="h-6 w-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UploadCloud className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="text-sm font-medium pointer-events-none">
                  {isUploading ? "Uploading to Cloudinary..." : "Click to upload or drag and drop"}
                </div>
                <div className="text-xs text-muted-foreground pointer-events-none">PNG, JPG, WEBP</div>
              </div>
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t p-6 bg-muted/10">
            <Button variant="outline" type="button" onClick={() => router.push("/my-listings")}>
              Cancel
            </Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting || isUploading}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
