import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";

export interface ItemType {
  id: string;
  title: string;
  price: number;
  quality: "New" | "Used";
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
        <Badge 
          variant={isFree ? "default" : "secondary"} 
          className="absolute top-3 right-3 shadow-sm bg-white/90 text-black backdrop-blur-sm hover:bg-white"
        >
          {isFree ? "FREE" : `฿${item.price.toLocaleString()}`}
        </Badge>
      </div>

      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
        </div>
        <div className="flex gap-2 text-sm text-muted-foreground mt-1">
          <Badge variant="outline" className="font-normal text-xs">{item.quality}</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 py-2 flex-grow mb-2">
        <div className="flex items-center gap-2 mt-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={item.sellerAvatar} />
            <AvatarFallback className="text-xs">{item.sellerName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="text-sm">
            <span className="font-medium">{item.sellerName}</span>
            <span className="text-xs text-muted-foreground ml-2">({item.department})</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
