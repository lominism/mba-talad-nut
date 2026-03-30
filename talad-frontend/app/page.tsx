import { ItemCard, ItemType } from "@/components/market/ItemCard";

const mockItems: ItemType[] = [
  {
    id: "1",
    title: "Ergonomic Office Chair",
    price: 50,
    condition: "Used",
    sellerName: "Sarah M.",
    department: "Design",
    imageUrl: "https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "2",
    title: "Apple Magic Keyboard",
    price: 30,
    condition: "Like New",
    sellerName: "Mike T.",
    department: "Engineering",
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "3",
    title: "Monstera Plant (Moving out)",
    price: 0,
    condition: "Free",
    sellerName: "Admin Team",
    department: "HR",
    imageUrl: "https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "4",
    title: "Dual Monitor Arm",
    price: 45,
    condition: "Like New",
    sellerName: "Alex R.",
    department: "Engineering",
    imageUrl: "https://m.media-amazon.com/images/I/617NYHnRQQL._AC_UF1000,1000_QL80_.jpg",
  },
  {
    id: "5",
    title: "Sony WH-1000XM4 Headphones",
    price: 150,
    condition: "Used",
    sellerName: "Jane D.",
    department: "Product",
    imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "6",
    title: "Logitech C920 Webcam",
    price: 0,
    condition: "Free",
    sellerName: "Chris W.",
    department: "IT",
    imageUrl: "https://image.makewebcdn.com/makeweb/0/jxlPpOYv8/4Products/Logitech_C920e_HD_Webcam_08.jpg",
  }
];

export default function Home() {
  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Market Feed</h1>
          <p className="text-muted-foreground mt-1 text-lg">Discover items posted by your colleagues.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {mockItems.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
      
      {mockItems.length === 0 && (
        <div className="text-center py-20 bg-muted/30 rounded-lg border border-dashed">
          <p className="text-xl text-muted-foreground font-medium">No items listed yet!</p>
          <p className="text-sm text-muted-foreground mt-2">Check back later or post your own item.</p>
        </div>
      )}
    </div>
  );
}
