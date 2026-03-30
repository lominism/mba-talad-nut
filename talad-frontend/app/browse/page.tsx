import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function BrowsePage() {
  const sellers = [
    {
      id: "1",
      name: "Sarah M.",
      department: "Design",
      itemCount: 4,
      avatar: "https://i.pravatar.cc/150?u=sarah",
      joined: "2023",
    },
    {
      id: "2",
      name: "Mike T.",
      department: "Engineering",
      itemCount: 2,
      avatar: "https://i.pravatar.cc/150?u=mike",
      joined: "2022",
    },
    {
      id: "3",
      name: "Alex R.",
      department: "Engineering",
      itemCount: 5,
      avatar: "https://i.pravatar.cc/150?u=alex",
      joined: "2024",
    },
    {
      id: "4",
      name: "Jane D.",
      department: "Product",
      itemCount: 1,
      avatar: "https://i.pravatar.cc/150?u=jane",
      joined: "2021",
    },
    {
      id: "5",
      name: "Chris W.",
      department: "IT",
      itemCount: 7,
      avatar: "https://i.pravatar.cc/150?u=chris",
      joined: "2020",
    },
  ];

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Browse Sellers</h1>
        <p className="text-muted-foreground mt-1 text-lg">See what your colleagues are offering.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sellers.map((seller) => (
          <Link href={`/browse/${seller.id}`} key={seller.id} className="block group">
            <Card className="hover:shadow-md transition-all duration-300 border-muted group-hover:border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                    <AvatarImage src={seller.avatar} />
                    <AvatarFallback>{seller.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-semibold text-lg leading-none">{seller.name}</h3>
                    <p className="text-sm text-muted-foreground">{seller.department}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-colors" />
                </div>
                
                <div className="mt-6 flex items-center justify-between border-t pt-4 border-muted/50">
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                    {seller.itemCount} items listed
                  </Badge>
                  <span className="text-xs text-muted-foreground">Joined {seller.joined}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
