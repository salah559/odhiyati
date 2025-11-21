import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Sheep } from "@shared/schema";
import { Percent, Star, Eye } from "lucide-react";

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
        className="group overflow-hidden hover-elevate active-elevate-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 border-2"
        data-testid={`card-product-${sheep.id}`}
      >
        <div className="relative aspect-square overflow-hidden bg-muted">
          {/* Image */}
          <img
            src={sheep.images?.[0] || '/placeholder.png'}
            alt={sheep.name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
          />
          
          {/* Gradient Overlay on Hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {sheep.discountPercentage && (
              <Badge 
                variant="destructive" 
                className="gap-1 shadow-lg"
                data-testid={`badge-discount-${sheep.id}`}
              >
                <Percent className="h-3 w-3" />
                خصم {sheep.discountPercentage}%
              </Badge>
            )}
            {sheep.isFeatured && (
              <Badge 
                className="gap-1 bg-accent text-accent-foreground shadow-lg"
                data-testid={`badge-featured-${sheep.id}`}
              >
                <Star className="h-3 w-3 fill-current" />
                مميز
              </Badge>
            )}
          </div>
          
          <Badge 
            variant="secondary" 
            className="absolute bottom-3 right-3 shadow-lg backdrop-blur-sm bg-background/80"
            data-testid={`badge-category-${sheep.id}`}
          >
            {sheep.category}
          </Badge>
          
          {/* View Details Button - Appears on Hover */}
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <Button 
              className="w-full gap-2" 
              size="sm"
              data-testid={`button-view-details-${sheep.id}`}
            >
              <Eye className="h-4 w-4" />
              عرض التفاصيل
            </Button>
          </div>
        </div>
        
        <div className="p-5">
          <h3 
            className="font-bold text-xl mb-2 line-clamp-1 group-hover:text-primary transition-colors"
            data-testid={`text-name-${sheep.id}`}
          >
            {sheep.name}
          </h3>
          
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <span className="font-medium">العمر:</span>
              <span>{sheep.age}</span>
            </div>
            <span className="text-border">•</span>
            <div className="flex items-center gap-1">
              <span className="font-medium">الوزن:</span>
              <span>{sheep.weight}</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2 flex-wrap">
            {discountedPrice ? (
              <>
                <span 
                  className="text-2xl font-bold text-primary"
                  data-testid={`text-discounted-price-${sheep.id}`}
                >
                  {discountedPrice.toLocaleString('ar-DZ')}
                </span>
                <span className="text-sm font-medium">دج</span>
                <span 
                  className="text-sm text-muted-foreground line-through"
                  data-testid={`text-original-price-${sheep.id}`}
                >
                  {sheep.price.toLocaleString('ar-DZ')} دج
                </span>
              </>
            ) : (
              <>
                <span 
                  className="text-2xl font-bold text-primary"
                  data-testid={`text-price-${sheep.id}`}
                >
                  {sheep.price.toLocaleString('ar-DZ')}
                </span>
                <span className="text-sm font-medium">دج</span>
              </>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
