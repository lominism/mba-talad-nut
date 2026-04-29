import { ItemCard, ItemType } from "@/components/market/ItemCard";
import Link from "next/link";
import { PackageOpen, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { API_URL } from "@/lib/api-config";

import { Metadata, ResolvingMetadata } from 'next';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

async function getSellerData(id: string) {
  try {
    const res = await fetch(`${API_URL}/users`, { cache: "no-store" });
    if (res.ok) {
      const allUsers = await res.json();
      return allUsers.find((u: any) => u.id === id);
    }
  } catch (err) {
    console.error("Failed to fetch seller for metadata", err);
  }
  return null;
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const user = await getSellerData(id);

  if (!user) {
    return {
      title: 'Seller Not Found | MBS Talad Nut',
    };
  }

  const name = user.nickname || user.firstName;
  const previousImages = (await parent).openGraph?.images || [];
  const userImage = user.photoUrl;

  return {
    title: `${name}'s Shop | MBS Talad Nut`,
    description: `Browse items listed by ${name} from ${user.department || 'MBS'} on MBS Talad Nut.`,
    openGraph: {
      title: `${name}'s Shop | MBS Talad Nut`,
      description: `Browse items listed by ${name} on MBS Talad Nut.`,
      images: userImage ? [userImage, ...previousImages] : previousImages,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${name}'s Shop | MBS Talad Nut`,
      description: `Browse items listed by ${name} on MBS Talad Nut.`,
      images: userImage ? [userImage] : [],
    },
  };
}

export default async function SellerPage({ params }: Props) {

  const { id } = await params;
  let items: any[] = [];
  let user: any = null;
  
  try {
    const [usersRes, itemsRes] = await Promise.all([
      fetch(`${API_URL}/users`, { cache: "no-store" }),
      fetch(`${API_URL}/items`, { cache: "no-store" })
    ]);

    if (usersRes.ok && itemsRes.ok) {
      const allUsers = await usersRes.json();
      const allItems = await itemsRes.json();

      user = allUsers.find((u: any) => u.id === id);
      items = allItems.filter((i: any) => i.seller?.id === id);
    }
  } catch (err) {
    console.error("Failed to fetch seller data", err);
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Seller not found</h1>
        <p className="text-muted-foreground mt-4 mb-8">This seller may not exist or the data could not be retrieved.</p>
        <Link href="/browse" className="text-blue-500 hover:underline">
          &larr; Back to Browse
        </Link>
      </div>
    );
  }

  const mappedItems: ItemType[] = items.map((item) => ({
    id: item.id,
    title: item.name,
    price: Number(item.price),
    quality: item.quality,
    status: item.status,
    sellerName: user.nickname || user.firstName,
    sellerAvatar: user.photoUrl,
    imageUrls: item.photoUrls || [],
    department: user.department || "General",
  }));

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Link href="/browse" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Sellers
      </Link>

      <div className="flex flex-col md:flex-row items-center gap-6 mb-10 p-6 bg-card rounded-xl border border-muted shadow-sm">
        <Avatar className="h-24 w-24 border-4 border-background shadow-md">
          <AvatarImage src={user.photoUrl} alt={`${user.firstName} ${user.lastName}`} />
          <AvatarFallback className="text-2xl outline-none">{(user.nickname || user.firstName).slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="text-center md:text-left space-y-2 flex-1">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{user.nickname || user.firstName}</h1>
          <p className="text-muted-foreground text-lg">{user.department}</p>
        </div>
        <div className="flex flex-col gap-2 items-center md:items-end">
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-sm px-3 py-1">
            {items.length} items listed
          </Badge>
          <span className="text-sm text-muted-foreground">Joined {new Date(user.createdAt).getFullYear()}</span>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Listings</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 hover:cursor-pointer">
        {mappedItems.map((item) => (
          <Link href={`/item/${item.id}`} key={item.id} className="block transition group">
            <ItemCard item={item} />
          </Link>
        ))}
      </div>
      
      {/* Empty State Overlay */}
      {mappedItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border border-dashed text-center min-h-[300px]">
          <div className="bg-muted p-4 rounded-full mb-4">
            <PackageOpen className="h-10 w-10 text-muted-foreground opacity-60" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">No Items To Display</h2>
          <p className="text-muted-foreground mt-2 text-md max-w-sm">{user.nickname || user.firstName} hasn't listed any items.</p>
        </div>
      )}
    </div>
  );
}
