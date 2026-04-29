import { ItemCard, ItemType } from "@/components/market/ItemCard";
import { Link } from "@/i18n/routing";
import { PackageOpen } from "lucide-react";
import { API_URL } from "@/lib/api-config";

import { getTranslations } from "next-intl/server";

export const revalidate = 0; // Turn off static caching for instant feed updates

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const itemsPerPage = 8;
  const t = await getTranslations('Home');
  let items: any[] = [];
  
  try {
    const res = await fetch(`${API_URL}/items`, { cache: "no-store" });
    if (res.ok) {
      items = await res.json();
    }
  } catch (err) {
    console.error("Failed to connect to backend", err);
  }

  // Map backend logic over to the UI strictly-typed struct
  const mappedItems: ItemType[] = items.map((item) => ({
    id: item.id,
    title: item.name,
    price: Number(item.price),
    quality: item.quality,
    status: item.status,
    sellerName: item.seller ? (item.seller.nickname || item.seller.firstName) : "Guest",
    sellerAvatar: item.seller?.photoUrl,
    imageUrls: item.photoUrls || [],
    department: item.seller?.department || "General",
  }));

  const totalPages = Math.ceil(mappedItems.length / itemsPerPage);
  const paginatedItems = mappedItems.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t('title')}</h1>
          <p className="text-muted-foreground mt-1 text-lg">{t('subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 hover:cursor-pointer">
        {paginatedItems.map((item) => (
          <Link href={`/item/${item.id}`} key={item.id} className="block transition group">
            <ItemCard item={item} />
          </Link>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-12 gap-3">
          {page > 1 ? (
            <Link href={`/?page=${page - 1}`} className="px-4 py-2 border rounded-md hover:bg-muted text-sm font-medium transition-colors">
              {t('previousPage', { fallback: "Previous" })}
            </Link>
          ) : (
            <div className="px-4 py-2 border rounded-md bg-muted/50 text-muted-foreground text-sm font-medium opacity-50 cursor-not-allowed">
              {t('previousPage', { fallback: "Previous" })}
            </div>
          )}
          <span className="px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-md text-sm flex items-center border border-blue-100">
            {page} / {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={`/?page=${page + 1}`} className="px-4 py-2 border rounded-md hover:bg-muted text-sm font-medium transition-colors">
              {t('nextPage', { fallback: "Next" })}
            </Link>
          ) : (
            <div className="px-4 py-2 border rounded-md bg-muted/50 text-muted-foreground text-sm font-medium opacity-50 cursor-not-allowed">
              {t('nextPage', { fallback: "Next" })}
            </div>
          )}
        </div>
      )}
      
      {/* Empty State Overlay */}
      {mappedItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-xl border border-dashed text-center min-h-[400px]">
          <div className="bg-muted p-4 rounded-full mb-4">
            <PackageOpen className="h-10 w-10 text-muted-foreground opacity-60" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">{t('noItemsTitle')}</h2>
          <p className="text-muted-foreground mt-2 text-md max-w-sm">{t('noItemsSubtitle')}</p>
        </div>
      )}
    </div>
  );
}
