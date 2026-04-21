"use client";

import React, { useState, useEffect, use } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ShoppingBag, Loader2, PackageX, Lock, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/api-config";

export default function ItemDetail({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [displayItem, setDisplayItem] = useState<any>(null);
  const [mainImage, setMainImage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchItem() {
      try {
        const res = await fetch(`${API_URL}/items/${unwrappedParams.id}`);
        if (res.ok) {
          const data = await res.json();
          setDisplayItem(data);
          setMainImage(data.photoUrls?.[0] || "/api/placeholder/600/600");
        }
      } catch (err) {
        console.error("Failed to fetch item", err);
      } finally {
        setLoading(false);
      }
    }
    fetchItem();
  }, [unwrappedParams.id]);

  const handleReserve = async () => {
    if (!user) return;
    setIsConfirmModalOpen(false);
    setReserving(true);
    setReserveError(null);
    try {
      const res = await fetch(`${API_URL}/items/${unwrappedParams.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'RESERVED', firebaseUid: user.uid }),
      });
      if (!res.ok) throw new Error('Failed to reserve item.');
      const updated = await res.json();
      setDisplayItem(updated);
    } catch (err: any) {
      setReserveError(err.message || 'Something went wrong.');
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex bg-muted/10 min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (!displayItem) {
    return (
      <div className="flex flex-col bg-muted/10 min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <PackageX className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
        <p className="text-xl font-bold text-foreground">Item not found</p>
        <p className="text-muted-foreground">This item may have been deleted or is no longer available.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Product Image Gallery */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl overflow-hidden border border-muted-foreground/20 shadow-sm bg-muted/30 aspect-[4/3] w-full">
            <img 
              src={mainImage} 
              alt={displayItem.name}
              className="w-full h-full object-cover transition-all hover:scale-105 duration-500"
            />
          </div>
          
          {/* Thumbnails */}
          {displayItem.photoUrls && displayItem.photoUrls.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {displayItem.photoUrls.map((url: string, idx: number) => (
                <button 
                  key={idx}
                  onClick={() => setMainImage(url)}
                  className={`relative rounded-md overflow-hidden h-20 w-24 shrink-0 border-2 transition-all ${mainImage === url ? 'border-blue-600 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={url} alt={`Thumbnail ${idx}`} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col space-y-6 relative">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground pr-8">{displayItem.name}</h1>
            
            {/* Seller Info (Matching ItemCard Format) */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Avatar className="h-6 w-6 border shadow-sm">
                <AvatarImage src={displayItem.seller?.photoUrl || undefined} />
                <AvatarFallback className="text-xs bg-slate-200 text-slate-700">
                  {displayItem.seller ? (displayItem.seller.nickname || displayItem.seller.firstName).slice(0, 2).toUpperCase() : "??"}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <span className="font-medium text-foreground">
                  {displayItem.seller ? (displayItem.seller.nickname || displayItem.seller.firstName) : "Unknown"}
                </span>
                <span className="text-xs ml-2">({displayItem.seller?.department || "General"})</span>
              </div>
            </div>

            {/* Price in Baht or FREE */}
            <p className="text-4xl font-bold text-blue-600 tracking-tight">
              {displayItem.price === 0 ? (
                "FREE"
              ) : (
                <>
                  <span className="text-2xl mr-1 font-medium opacity-80">฿</span>
                  {displayItem.price.toLocaleString()}
                </>
              )}
            </p>

             {/* Reserve Button */}
            <div className="pt-2 space-y-2">
              {!user ? (
                <Button size="lg" className="w-full text-lg h-14 bg-slate-800 hover:bg-slate-700 transition" onClick={() => router.push('/login')}>
                  <Lock className="mr-3 h-5 w-5" />
                  Login to Reserve
                </Button>
              ) : user.uid === displayItem.seller?.firebaseUid ? (
                <Button size="lg" className="w-full text-lg h-14" variant="outline" disabled>
                  <ShoppingBag className="mr-3 h-6 w-6" />
                  This is your listing
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full text-lg h-14 bg-blue-600 hover:bg-blue-700 transition"
                  disabled={displayItem.status !== 'AVAILABLE' || reserving}
                  onClick={() => setIsConfirmModalOpen(true)}
                >
                  {reserving ? (
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                  ) : (
                    <ShoppingBag className="mr-3 h-6 w-6" />
                  )}
                  {reserving ? 'Reserving...' : displayItem.status === 'AVAILABLE' ? 'Reserve Item' : 'Reserved'}
                </Button>
              )}
              {reserveError && (
                <p className="text-sm text-destructive font-medium text-center">{reserveError}</p>
              )}
            </div>
          </div>

          <Separator className="bg-muted-foreground/20" />

          {/* Description Area */}
          <div className="space-y-4">
            <h3 className="font-semibold text-xl text-foreground">Description</h3>
            <p className="text-muted-foreground leading-relaxed text-md whitespace-pre-line">
              {displayItem.description}
            </p>
          </div>
        </div>
      </div>

      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Confirm Reservation
            </DialogTitle>
            <DialogDescription className="text-sm pt-2">
              Are you sure you want to reserve <strong>{displayItem.name}</strong>? 
              This will notify the seller.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end border-t pt-4 mt-4">
            <Button variant="ghost" onClick={() => setIsConfirmModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleReserve}
            >
              Confirm Reservation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
