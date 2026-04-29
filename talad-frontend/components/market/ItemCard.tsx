import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface ItemType {
  id: string;
  title: string;
  price: number;
  quality: "New" | "Used";
  status?: "AVAILABLE" | "RESERVED" | "SOLD";
  sellerName: string;
  sellerAvatar?: string;
  imageUrls: string[];
  department: string;
}

export function ItemCard({ item }: { item: ItemType }) {
  const isFree = item.price === 0;

  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
      {/* Image Placeholder */}
      <div className="relative h-56 w-full bg-muted/30 shrink-0">
        <img 
          src={item.imageUrls?.[0] || "/api/placeholder/600/600"} 
          alt={item.title}
          className="object-cover w-full h-full"
        />
      </div>

      {/* Status Strip */}
      <div className={`w-full px-4 py-1.5 flex items-center justify-center ${
        item.status === "AVAILABLE"
          ? "bg-emerald-50 border-y border-emerald-100"
          : item.status === "RESERVED"
          ? "bg-blue-50 border-y border-blue-100"
          : "bg-slate-50 border-y border-slate-100"
      }`}>
        <span className={`text-xs font-semibold tracking-wide ${
          item.status === "AVAILABLE" ? "text-emerald-700"
          : item.status === "RESERVED" ? "text-blue-700"
          : "text-slate-500"
        }`}>
          {item.status === "AVAILABLE" ? "● Available" : item.status === "RESERVED" ? "● Reserved" : "● Sold"}
        </span>
      </div>

      <CardHeader className="p-4 pb-2 text-center">
        <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
        <div className="mt-1">
          <span className={`text-xl font-bold ${isFree ? "text-emerald-600" : "text-blue-600"}`}>
            {isFree ? "FREE" : `฿ ${item.price.toLocaleString()}`}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-4 py-2 flex-grow mb-2">
        <div className="flex items-center justify-between mt-2">
          {/* Seller info left */}
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={item.sellerAvatar} />
              <AvatarFallback className="text-xs">{item.sellerName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <span className="font-medium text-xs">{item.sellerName}</span>
              <span className="text-[10px] text-muted-foreground ml-1">({item.department})</span>
            </div>
          </div>
          {/* Tag right */}
          <Badge variant="outline" className="font-normal text-[10px] h-5 px-1.5">{item.quality}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

