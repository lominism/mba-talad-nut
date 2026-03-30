import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";

export interface ItemType {
  id: string;
  title: string;
  price: number;
  condition: "New" | "Like New" | "Used" | "Free";
  sellerName: string;
  sellerAvatar?: string;
  imageUrl: string;
  department: string;
}

export function ItemCard({ item }: { item: ItemType }) {
  const isFree = item.condition === "Free" || item.price === 0;

  return (
    <Card className="overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
      {/* Image Placeholder */}
      <div className="relative aspect-square w-full bg-muted/30">
        <img 
          src={item.imageUrl} 
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
        <div className="flex gap-2 text-sm text-muted-foreground">
          <Badge variant="outline" className="font-normal text-xs">{item.condition}</Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4 py-2 flex-grow">
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

      <CardFooter className="p-4 pt-4 border-t bg-muted/10">
        <Button className="w-full bg-blue-600 hover:bg-blue-700 font-medium">
          <MessageCircle className="mr-2 h-4 w-4" />
          Reserve / Message
        </Button>
      </CardFooter>
    </Card>
  );
}
