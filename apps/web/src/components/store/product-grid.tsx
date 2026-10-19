import { PackageSearch } from "lucide-react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./product-card";
import { EmptyState } from "@/components/ui/empty-state";

/** Responsive grid of product cards. */
export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={<PackageSearch className="h-6 w-6" />}
        title="No products found"
        description="Try adjusting your search or filters."
      />
    );
  }
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
