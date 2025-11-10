import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Sheep } from "@shared/schema";
import { Percent } from "lucide-react";

interface ProductCardProps {
  sheep: Sheep;
}

export function ProductCard({ sheep }: ProductCardProps) {
  const discountedPrice = sheep.discountPercentage
    ? sheep.price * (1 - sheep.discountPercentage / 100)
    : null;

  return (
    <Link href={`/products/${sheep.id}`}>
      <Card 
        className="group overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-300 hover:-translate-y-1"
        data-testid={`card-product-${sheep.id}`}
      >
        <div className="relative aspect-square overflow-hidden">
          <img
            src={sheep.images[0]}
            alt={sheep.name}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          {sheep.discountPercentage && (
            <Badge 
              variant="destructive" 
              className="absolute top-2 left-2 gap-1"
              data-testid={`badge-discount-${sheep.id}`}
            >
              <Percent className="h-3 w-3" />
              {sheep.discountPercentage}-
            </Badge>
          )}
          <Badge 
            variant="secondary" 
            className="absolute bottom-2 right-2"
            data-testid={`badge-category-${sheep.id}`}
          >
            {sheep.category}
          </Badge>
        </div>
        
        <div className="p-4">
          <h3 
            className="font-semibold text-lg mb-2 line-clamp-1"
            data-testid={`text-name-${sheep.id}`}
          >
            {sheep.name}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <span>{sheep.age}</span>
            <span>•</span>
            <span>{sheep.weight}</span>
          </div>

          <div className="flex items-center gap-2">
            {discountedPrice ? (
              <>
                <span 
                  className="text-lg font-bold text-primary"
                  data-testid={`text-discounted-price-${sheep.id}`}
                >
                  {discountedPrice.toLocaleString('ar-DZ')} دج
                </span>
                <span 
                  className="text-sm text-muted-foreground line-through"
                  data-testid={`text-original-price-${sheep.id}`}
                >
                  {sheep.price.toLocaleString('ar-DZ')} دج
                </span>
              </>
            ) : (
              <span 
                className="text-lg font-bold text-primary"
                data-testid={`text-price-${sheep.id}`}
              >
                {sheep.price.toLocaleString('ar-DZ')} دج
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
