"use client";

import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { useTranslations } from "next-intl";
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Edit, Trash2, Phone, User as UserIcon, X, Loader2 } from 'lucide-react';
import { API_URL } from '@/lib/api-config';

interface UserEntity {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  department?: string;
  photoUrl?: string;
}

interface Item {
  id: string;
  name: string;
  photoUrls: string[];
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  reservedBy: UserEntity | null;
}

export default function MyListingsPage() {
  const t = useTranslations('MyListings');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
  const [buyerInfo, setBuyerInfo] = useState<UserEntity | null>(null);
  const [isBuyerModalOpen, setIsBuyerModalOpen] = useState(false);
  const [isLoadingBuyer, setIsLoadingBuyer] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatingStatusTo, setUpdatingStatusTo] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(false);
      setUser(currentUser);
      if (currentUser) {
        fetchItems(currentUser.uid);
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchItems = async (uid: string) => {
    try {
      const res = await fetch(`${API_URL}/items/user/${uid}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error("Failed to fetch listings", err);
    }
  };

  if (loading) {
    return <div className="flex justify-center mt-20">{t('loading')}</div>;
  }
  if (!user) return null;

  const handleStatusBadgeClick = (item: Item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const updateStatus = async (newStatus: string) => {
    if (!selectedItem) return;
    setIsUpdating(true);
    setUpdatingStatusTo(newStatus);
    try {
      const res = await fetch(`${API_URL}/items/${selectedItem.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        // optimistically update UI or re-fetch
        fetchItems(user.uid);
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setIsUpdating(false);
      setUpdatingStatusTo(null);
    }
  };

  const handleDeleteClick = (item: Item) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/items/${itemToDelete.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
        if (user) fetchItems(user.uid);
      }
    } catch (err) {
      console.error("Failed to delete item", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBuyerClick = async (reservedBy: UserEntity) => {
    setIsBuyerModalOpen(true);
    setIsLoadingBuyer(true);
    setBuyerInfo(null);
    try {
      const res = await fetch(`${API_URL}/users`);
      if (res.ok) {
        const allUsers: UserEntity[] = await res.json();
        const found = allUsers.find(u => u.id === reservedBy.id);
        setBuyerInfo(found || reservedBy);
      } else {
        setBuyerInfo(reservedBy);
      }
    } catch {
      setBuyerInfo(reservedBy);
    }
    setIsLoadingBuyer(false);
  };

  const renderBadge = (status: string) => {
    if (status === 'AVAILABLE') {
      return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors shadow-sm cursor-pointer border-emerald-300 px-3 py-1 text-xs uppercase tracking-wider">{t('listed')}</Badge>;
    }
    if (status === 'RESERVED') {
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors shadow-sm cursor-pointer border-amber-300 px-3 py-1 text-xs uppercase tracking-wider">{t('pending')}</Badge>;
    }
    return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 transition-colors shadow-sm cursor-pointer border-gray-300 px-3 py-1 text-xs uppercase tracking-wider">{t('sold')}</Badge>;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
      </div>
      
      <Card className="shadow-sm border-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 border-b">
                <tr>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wide text-xs">{t('colImage')}</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wide text-xs">{t('colName')}</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wide text-xs">{t('colStatus')}</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wide text-xs">{t('colReservedBy')}</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wide text-xs text-right">{t('colActions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y relative bg-white">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center">
                        <p className="text-lg font-medium text-slate-600">{t('noListings')}</p>
                        <p className="text-sm mt-1 mb-4">{t('noListingsDesc')}</p>
                        <Button onClick={() => router.push('/post')}>{t('postAnItem')}</Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map(item => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4 w-24">
                        <Link href={`/item/${item.id}`} className="block group/img cursor-pointer">
                          <div className="relative h-16 w-16 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                            {item.photoUrls && item.photoUrls.length > 0 ? (
                              <img src={item.photoUrls[0]} alt={item.name} className="object-cover w-full h-full group-hover/img:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="bg-muted w-full h-full flex items-center justify-center text-xs text-muted-foreground font-medium">{t('none')}</div>
                            )}
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-medium text-base text-slate-800 truncate max-w-xs">
                        <Link href={`/item/${item.id}`} className="hover:text-blue-600 hover:underline transition-colors">
                          {item.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <div onClick={() => handleStatusBadgeClick(item)} className="inline-block relative">
                          <div className="absolute inset-0 bg-white/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                          {renderBadge(item.status)}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">{t('clickToEdit')}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {item.reservedBy ? (
                          <button
                            onClick={() => handleBuyerClick(item.reservedBy!)}
                            className="flex items-center gap-2 hover:underline hover:text-blue-700 transition-colors group/buyer cursor-pointer"
                          >
                            <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {item.reservedBy.firstName[0]}{item.reservedBy.lastName[0]}
                            </div>
                            <span className="font-medium">{item.reservedBy.firstName} {item.reservedBy.lastName}</span>
                            <Phone className="h-3 w-3 text-blue-400 opacity-0 group-hover/buyer:opacity-100 transition-opacity" />
                          </button>
                        ) : (
                          <span className="text-slate-400 italic">{t('none')}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-slate-400 transition-colors cursor-pointer">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4 text-slate-600" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/my-listings/edit/${item.id}`)} className="cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" />
                              <span>{t('edit')}</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(item)} className="cursor-pointer text-red-600 focus:text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              <span>{t('delete')}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">{t('updateStatusTitle')}</DialogTitle>
            <DialogDescription className="text-sm pt-2">
              {selectedItem ? (
                <span>
                  {t('updateStatusDesc', { name: selectedItem.name })}
                </span>
              ) : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 py-6">
            {selectedItem?.status === 'RESERVED' && (
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  disabled={isUpdating}
                  onClick={() => updateStatus('SOLD')} 
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                >
                  {isUpdating && updatingStatusTo === 'SOLD' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t('confirmSale')}
                </Button>
                <div className="flex items-center gap-4 text-sm text-slate-400 my-2">
                  <div className="flex-1 h-[1px] bg-slate-200"></div>
                  <span>{t('or')}</span>
                  <div className="flex-1 h-[1px] bg-slate-200"></div>
                </div>
                <Button 
                  size="lg" 
                  variant="outline" 
                  disabled={isUpdating}
                  onClick={() => updateStatus('AVAILABLE')} 
                  className="w-full text-amber-700 border-amber-200 hover:bg-amber-50 hover:text-amber-800 font-medium"
                >
                  {isUpdating && updatingStatusTo === 'AVAILABLE' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t('cancelReservation')}
                </Button>
              </div>
            )}
            
            {selectedItem?.status === 'AVAILABLE' && (
              <div className="space-y-4">
                <Button 
                  size="lg" 
                  disabled={isUpdating}
                  onClick={() => updateStatus('SOLD')} 
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                >
                  {isUpdating && updatingStatusTo === 'SOLD' ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t('markAsSold')}
                </Button>
              </div>
            )}

            {selectedItem?.status === 'SOLD' && (
              <div className="text-sm text-center text-slate-500 bg-slate-50 p-4 rounded-md border border-slate-100">
                {t('alreadySold')}
              </div>
            )}
          </div>
          
          <DialogFooter className="sm:justify-center border-t pt-4">
            <Button variant="ghost" className="text-slate-500" onClick={() => setIsModalOpen(false)}>{t('cancel')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600">{t('confirmDeleteTitle')}</DialogTitle>
            <DialogDescription className="text-sm pt-2">
              {t('confirmDeleteDesc', { name: itemToDelete?.name || '' })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end border-t pt-4 mt-4">
             <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)} disabled={isDeleting}>{t('cancel')}</Button>
             <Button 
               variant="destructive" 
               onClick={confirmDelete} 
               className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
               disabled={isDeleting}
             >
                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isDeleting ? t('deleting') : t('deleteListing')}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Buyer Info Modal */}
      <Dialog open={isBuyerModalOpen} onOpenChange={setIsBuyerModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-blue-600" />
              {t('buyerInfoTitle')}
            </DialogTitle>
            <DialogDescription className="text-sm pt-1">
              {t('buyerInfoDesc')}
            </DialogDescription>
          </DialogHeader>

          {isLoadingBuyer ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin h-6 w-6 border-2 border-blue-500 rounded-full border-t-transparent" />
            </div>
          ) : buyerInfo ? (
            <div className="py-4 space-y-4">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4 pb-4 border-b">
                <div className="h-14 w-14 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold flex-shrink-0 shadow-sm">
                  {buyerInfo.photoUrl ? (
                    <img src={buyerInfo.photoUrl} alt="" className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <>{buyerInfo.firstName[0]}{buyerInfo.lastName[0]}</>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-base">{buyerInfo.firstName} {buyerInfo.lastName}</p>
                  {buyerInfo.department && (
                    <p className="text-xs text-slate-500 mt-0.5">{buyerInfo.department}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{t('phone')}</p>
                  {buyerInfo.phoneNumber ? (
                    <a
                      href={`tel:${buyerInfo.phoneNumber}`}
                      className="text-sm font-semibold text-emerald-700 hover:underline"
                    >
                      {buyerInfo.phoneNumber}
                    </a>
                  ) : (
                    <p className="text-sm text-slate-400 italic">{t('notProvided')}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              {buyerInfo.email && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{t('email')}</p>
                    <a
                      href={`mailto:${buyerInfo.email}`}
                      className="text-sm font-semibold text-blue-700 hover:underline"
                    >
                      {buyerInfo.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter className="border-t pt-4">
            <Button variant="ghost" className="text-slate-500" onClick={() => setIsBuyerModalOpen(false)}>
              {t('close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
