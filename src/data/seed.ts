import catSarees from "@/assets/cat-sarees.jpg";
import catKurtis from "@/assets/cat-kurtis.jpg";
import catLehengas from "@/assets/cat-lehengas.jpg";
import catDresses from "@/assets/cat-dresses.jpg";
import catDupattas from "@/assets/cat-dupattas.jpg";
import catKids from "@/assets/cat-kids.jpg";
import catWestern from "@/assets/cat-western.jpg";
import type { Category, Product } from "@/lib/types";

const now = "2026-01-05T10:00:00.000Z";

export const CATEGORY_IMAGES: Record<string, string> = {
  sarees: catSarees,
  kurtis: catKurtis,
  lehengas: catLehengas,
  dresses: catDresses,
  dupattas: catDupattas,
  "kids-wear": catKids,
  "western-wear": catWestern,
};

const cat = (
  name: string,
  slug: string,
  description: string,
  image: string,
): Category => ({
  id: slug,
  name,
  slug,
  description,
  image,
  isActive: true,
  createdAt: now,
  updatedAt: now,
});

export const seedCategories: Category[] = [
  cat("Sarees", "sarees", "Handwoven silks, georgettes and festive drapes.", catSarees),
  cat("Kurtis", "kurtis", "Everyday elegance in breathable fabrics.", catKurtis),
  cat("Lehengas", "lehengas", "Celebration-ready silhouettes with fine craft.", catLehengas),
  cat("Dresses", "dresses", "Flowing gowns and occasion dresses.", catDresses),
  cat("Dupattas", "dupattas", "Finishing touches in chiffon, organza and silk.", catDupattas),
  cat("Kids Wear", "kids-wear", "Festive ethnic charm for little ones.", catKids),
  cat("Western Wear", "western-wear", "Modern co-ords and relaxed tailoring.", catWestern),
];

let counter = 0;
const p = (
  name: string,
  category: string,
  price: number,
  compareAtPrice: number | undefined,
  description: string,
  opts: Partial<Product> = {},
): Product => {
  counter += 1;
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return {
    id: `p${counter}`,
    name,
    slug,
    description,
    price,
    compareAtPrice,
    category,
    images: [CATEGORY_IMAGES[category] ?? ""],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Rose", "Wine", "Cream"],
    rating: 4.4,
    reviewCount: 18,
    stock: 12,
    isFeatured: false,
    isNewArrival: false,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    ...opts,
  };
};

export const seedProducts: Product[] = [
  p("Embroidered Kurti", "kurtis", 899, 1299, "Fine thread embroidery on soft cotton blend, with a relaxed straight fit and side slits.", { isFeatured: true, isNewArrival: true, rating: 4.6, reviewCount: 42 }),
  p("Floral Kurti Set", "kurtis", 999, 1499, "Printed kurti with matching palazzo — an easy set for daytime occasions.", { isNewArrival: true, rating: 4.5, reviewCount: 31 }),
  p("Printed Cotton Kurti", "kurtis", 699, 899, "Breathable pure cotton with a hand-block inspired print.", { rating: 4.3, reviewCount: 24 }),
  p("Anarkali Kurti", "kurtis", 1299, 1799, "Floor-skimming Anarkali with a flared panelled hem.", { isFeatured: true, rating: 4.7, reviewCount: 56 }),
  p("Floral Printed Saree", "sarees", 1299, 1699, "Lightweight georgette saree with an unstitched blouse piece.", { isNewArrival: true, sizes: ["Free Size"], rating: 4.5, reviewCount: 39 }),
  p("Banarasi Silk Saree", "sarees", 2899, 3499, "Rich woven silk with a traditional gold zari border.", { isFeatured: true, sizes: ["Free Size"], stock: 6, rating: 4.8, reviewCount: 64 }),
  p("Designer Kurti Set", "kurtis", 999, 1399, "Three-piece set with kurti, bottom and dupatta.", { rating: 4.4, reviewCount: 27 }),
  p("Party Wear Gown", "dresses", 1499, 2199, "Flowing tulle gown with a fitted bodice and tie waist.", { isFeatured: true, isNewArrival: true, rating: 4.6, reviewCount: 33 }),
  p("Embroidered Lehenga", "lehengas", 2499, 3299, "Festive lehenga with sequin and zari work, blouse and dupatta included.", { isFeatured: true, stock: 5, rating: 4.7, reviewCount: 48 }),
  p("Bridal Velvet Lehenga", "lehengas", 5999, 7499, "Heavy velvet lehenga with hand embroidery for wedding occasions.", { stock: 3, rating: 4.9, reviewCount: 21 }),
  p("Organza Dupatta", "dupattas", 599, 799, "Sheer organza dupatta with a delicate embroidered border.", { sizes: ["Free Size"], isNewArrival: true, rating: 4.2, reviewCount: 15 }),
  p("Chiffon Zari Dupatta", "dupattas", 749, undefined, "Soft chiffon with fine zari butis all over.", { sizes: ["Free Size"], rating: 4.3, reviewCount: 11 }),
  p("Kids Festive Lehenga", "kids-wear", 1199, 1599, "Comfortable festive lehenga choli for children.", { sizes: ["2-3Y", "4-5Y", "6-7Y", "8-9Y"], rating: 4.5, reviewCount: 19 }),
  p("Kids Cotton Kurta Set", "kids-wear", 799, undefined, "Everyday cotton kurta set with easy pull-on pants.", { sizes: ["2-3Y", "4-5Y", "6-7Y"], isNewArrival: true, rating: 4.4, reviewCount: 9 }),
  p("Linen Co-ord Set", "western-wear", 1699, 2199, "Relaxed shirt and wide-leg trouser co-ord in washed linen.", { isNewArrival: true, rating: 4.5, reviewCount: 22 }),
  p("Satin Wrap Dress", "dresses", 1899, undefined, "Fluid satin wrap dress with a self tie belt.", { rating: 4.4, reviewCount: 17 }),
];
