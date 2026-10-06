import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { seedCategories, seedProducts } from "@/data/seed";
import { BUSINESS } from "./config";

import catSarees from "@/assets/cat-sarees.jpg";
import catKurtis from "@/assets/cat-kurtis.jpg";
import catLehengas from "@/assets/cat-lehengas.jpg";
import catDresses from "@/assets/cat-dresses.jpg";
import catDupattas from "@/assets/cat-dupattas.jpg";
import catKids from "@/assets/cat-kids.jpg";
import catWestern from "@/assets/cat-western.jpg";

import type {
  CartItem,
  Category,
  Customer,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
} from "./types";

const KEY = "gfh.state.v1";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

function normalizeImageUrl(image: unknown) {
  if (typeof image !== "string" || !image) return "";

  if (image.startsWith("/uploads/")) {
    return `${API_ORIGIN}${image}`;
  }

  try {
    const parsed = new URL(image);
    if (parsed.pathname.startsWith("/uploads/")) {
      return `${API_ORIGIN}${parsed.pathname}`;
    }
  } catch {
    return image;
  }

  return image;
}

// Convert backend category names into frontend category slugs
function normalizeCategory(category: string | undefined) {
  const value = (category || "").toLowerCase().trim();

  const categoryMap: Record<string, string> = {
    saree: "sarees",
    sarees: "sarees",

    kurti: "kurtis",
    kurtis: "kurtis",

    lehenga: "lehengas",
    lehengas: "lehengas",

    dress: "dresses",
    dresses: "dresses",

    dupatta: "dupattas",
    dupattas: "dupattas",

    "kids wear": "kids-wear",
    "kids-wear": "kids-wear",

    "western wear": "western-wear",
    "western-wear": "western-wear",
  };

  return categoryMap[value] || value;
}

// Fallback image when MongoDB product has no image
function getCategoryImage(category: string | undefined) {
  const normalized = normalizeCategory(category);

  const categoryImages: Record<string, string> = {
    sarees: catSarees,
    kurtis: catKurtis,
    lehengas: catLehengas,
    dresses: catDresses,
    dupattas: catDupattas,
    "kids-wear": catKids,
    "western-wear": catWestern,
  };

  return categoryImages[normalized] || catSarees;
}

// Convert MongoDB product into frontend product
function convertProduct(product: any): Product {
  const slug =
    product.slug ||
    product.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return {
    id: product._id,
    name: product.name,
    slug,
    description: product.description || "",
    price: product.price || 0,
    compareAtPrice: product.compareAtPrice ?? undefined,
    category: normalizeCategory(product.category),

    images:
      product.images && product.images.length > 0
        ? product.images.map(normalizeImageUrl).filter(Boolean)
        : [getCategoryImage(product.category)],

    sizes:
      product.sizes && product.sizes.length > 0
        ? product.sizes
        : [],

    colors:
      product.colors && product.colors.length > 0
        ? product.colors
        : [],

    fabric: product.fabric ?? "Premium festive fabric",
    occasion: product.occasion ?? "Everyday styling",
    care: product.care ?? "Dry clean or gentle hand wash",
    fit: product.fit ?? "Standard fit",
    details: product.details ?? product.description ?? "",

    rating: product.rating ?? 0,
    reviewCount: product.reviewCount ?? 0,
    stock: product.stock ?? 0,
    isFeatured: product.featured ?? false,
    isNewArrival: product.isNewArrival ?? false,
    isOffer: product.isOffer ?? false,
    isActive: product.isActive ?? true,
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || new Date().toISOString(),
  };
}

type Persisted = {
  products: Product[];
  categories: Category[];
  orders: Order[];
  cart: CartItem[];
  wishlist: string[];
  customer: Customer | null;
  customerToken: string | null;
  adminEmail: string | null;
  adminToken: string | null;
};

const initial: Persisted = {
  products: seedProducts,
  categories: seedCategories,
  orders: [],
  cart: [],
  wishlist: [],
  customer: null,
  customerToken: null,
  adminEmail: null,
  adminToken: null,
};

type NewOrderInput = {
  customer: Order["customer"];
  shippingAddress: Order["shippingAddress"];
};

type CustomerAuthResult = {
  success: boolean;
  message?: string;
};

type Ctx = {
  hydrated: boolean;
  products: Product[];
  categories: Category[];
  orders: Order[];
  cart: CartItem[];
  wishlist: string[];
  customer: Customer | null;
  customerToken: string | null;
  adminEmail: string | null;

  // Catalog
  refreshProducts: () => Promise<void>;
  saveProduct: (
    p: Product,
    imageFiles?: File[],
  ) => Promise<boolean>;

  deleteProduct: (id: string) => Promise<boolean>;

  saveCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;

  // Cart
  addToCart: (item: CartItem) => void;
  removeFromCart: (index: number) => void;
  updateQuantity: (index: number, qty: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  shippingFee: number;
  cartTotal: number;

  // Wishlist
  toggleWishlist: (id: string) => boolean;
  isWishlisted: (id: string) => boolean;

  // Orders
  createOrder: (input: NewOrderInput) => Order | null;
  updateOrder: (id: string, patch: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  setPaymentStatus: (id: string, status: PaymentStatus) => void;

  // Customer auth
  registerCustomer: (payload: {
    name: string;
    email: string;
    password: string;
    phone: string;
  }) => Promise<CustomerAuthResult>;
  loginCustomer: (payload: {
    email: string;
    password: string;
  }) => Promise<boolean>;
  loginGoogleCustomer: (payload: {
    name: string;
    email: string;
  }) => Promise<boolean>;
  logoutCustomer: () => void;

  // Admin
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
};

const ShopContext = createContext<Ctx | null>(null);

export function ShopProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [state, setState] = useState<Persisted>(initial);
  const [hydrated, setHydrated] = useState(false);

  // Load local data
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);

      if (raw) {
        const savedState = JSON.parse(raw) as Persisted;

        setState({
          ...initial,
          ...savedState,
        });
      }
    } catch {
      console.error("Could not load saved data");
    }

    setHydrated(true);
  }, []);

  // Fetch products from MongoDB
  useEffect(() => {
    if (!hydrated) return;

    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/products`);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();

        console.log("MongoDB API Response:", data);

        if (data.success && Array.isArray(data.products)) {
          const mongoProducts: Product[] =
            data.products.map(convertProduct);

          console.log("Converted products:", mongoProducts);

          setState((previous) => ({
            ...previous,
            products: mongoProducts,
          }));
        }
      } catch (error) {
        console.error(
          "Error fetching MongoDB products:",
          error,
        );
      }
    };

    fetchProducts();
  }, [hydrated]);

  // Save local state
  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      console.error("Could not save local data");
    }
  }, [state, hydrated]);

  const patch = useCallback(
    (fn: (s: Persisted) => Partial<Persisted>) =>
      setState((s) => ({
        ...s,
        ...fn(s),
      })),
    [],
  );

  const cartSubtotal = state.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const shippingFee =
    state.cart.length === 0 ||
    cartSubtotal >= BUSINESS.freeShippingThreshold
      ? 0
      : BUSINESS.shippingFee;

  const value = useMemo<Ctx>(() => {
    const findProduct = (id: string) =>
      state.products.find(
        (product) => product.id === id,
      );

    return {
      hydrated,
      ...state,

      // =========================
      // PRODUCT MANAGEMENT
      // =========================

      refreshProducts: async () => {
        try {
          const response = await fetch(`${API_URL}/products`);
          if (!response.ok) {
            throw new Error("Failed to fetch products");
          }

          const data = await response.json();
          if (data.success && Array.isArray(data.products)) {
            const mongoProducts = data.products.map(convertProduct);
            patch(() => ({
              products: mongoProducts,
            }));
          }
        } catch (error) {
          console.error("Error refreshing MongoDB products:", error);
        }
      },

      // Add new product or update existing product
      // Supports image upload using FormData
      saveProduct: async (
        p,
        imageFiles = [],
      ) => {
        try {
          const isExistingProduct =
            state.products.some(
              (product) => product.id === p.id,
            );

          const formData = new FormData();

          formData.append("name", p.name);

          formData.append(
            "slug",
            p.slug ||
              p.name
                .toLowerCase()
                .trim()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, ""),
          );

          formData.append(
            "description",
            p.description,
          );

          formData.append(
            "fabric",
            p.fabric ?? "Premium fabric",
          );

          formData.append(
            "occasion",
            p.occasion ?? "Everyday styling",
          );

          formData.append(
            "care",
            p.care ?? "Dry clean or gentle hand wash",
          );

          formData.append(
            "fit",
            p.fit ?? "Standard fit",
          );

          formData.append(
            "details",
            p.details ?? p.description,
          );

          formData.append(
            "price",
            String(p.price),
          );

          if (
            p.compareAtPrice !== undefined &&
            p.compareAtPrice !== null
          ) {
            formData.append(
              "compareAtPrice",
              String(p.compareAtPrice),
            );
          }

          formData.append(
            "category",
            p.category,
          );

          formData.append(
            "sizes",
            JSON.stringify(p.sizes),
          );

          formData.append(
            "colors",
            JSON.stringify(p.colors),
          );

          formData.append(
            "rating",
            String(p.rating),
          );

          formData.append(
            "reviewCount",
            String(p.reviewCount),
          );

          formData.append(
            "stock",
            String(p.stock),
          );

          // Backend schema uses "featured"
          formData.append(
            "featured",
            String(p.isFeatured),
          );

          formData.append(
            "isNewArrival",
            String(p.isNewArrival),
          );

          formData.append(
            "isOffer",
            String(p.isOffer),
          );

          formData.append(
            "isActive",
            String(p.isActive),
          );

          // Handle Cloudinary images if product has images array (Cloudinary public IDs)
          if (p.images && p.images.length > 0 && imageFiles.length === 0) {
            // Product has Cloudinary public IDs - send as JSON
            formData.append(
              "cloudinaryImages",
              JSON.stringify(p.images),
            );
          } else {
            // Upload images selected from PC/mobile (legacy multer upload)
            imageFiles.forEach((file) => {
              formData.append(
                "images",
                file,
              );
            });
          }

          let response: Response;

          // UPDATE PRODUCT
          if (isExistingProduct) {
            response = await fetch(
              `${API_URL}/products/${p.id}`,
              {
                method: "PUT",
                headers: { Authorization: `Bearer ${state.adminToken}` },
                body: formData,
              },
            );
          } else {
            // CREATE PRODUCT
            response = await fetch(
              `${API_URL}/products`,
              {
                method: "POST",
                headers: { Authorization: `Bearer ${state.adminToken}` },
                body: formData,
              },
            );
          }

          const data = await response.json();

          if (!response.ok || !data.success) {
            console.error(
              "Error saving product:",
              data.message,
            );

            return false;
          }

          const convertedProduct =
            convertProduct(data.product);

          // Immediately update Admin + normal website
          patch((s) => ({
            products: isExistingProduct
              ? s.products.map((product) =>
                  product.id ===
                  convertedProduct.id
                    ? convertedProduct
                    : product,
                )
              : [
                  convertedProduct,
                  ...s.products,
                ],
          }));

          return true;
        } catch (error) {
          console.error(
            "Error connecting to product API:",
            error,
          );

          return false;
        }
      },

      // Delete product from MongoDB
      deleteProduct: async (id) => {
        try {
          const response = await fetch(
            `${API_URL}/products/${id}`,
            {
              method: "DELETE",
              headers: { Authorization: `Bearer ${state.adminToken}` },
            },
          );

          const data = await response.json();

          if (!response.ok || !data.success) {
            console.error(
              "Error deleting product:",
              data.message,
            );

            return false;
          }

          // Remove product immediately from frontend
          patch((s) => ({
            products: s.products.filter(
              (product) => product.id !== id,
            ),
          }));

          return true;
        } catch (error) {
          console.error(
            "Error connecting to product API:",
            error,
          );

          return false;
        }
      },

      // =========================
      // CATEGORY MANAGEMENT
      // =========================

      saveCategory: (c) => {
        if (!state.adminToken) return;

        patch((s) => ({
          categories: s.categories.some(
            (x) => x.id === c.id,
          )
            ? s.categories.map((x) =>
                x.id === c.id ? c : x,
              )
            : [...s.categories, c],
        }));
      },

      deleteCategory: (id) => {
        if (!state.adminToken) return;

        patch((s) => ({
          categories: s.categories.filter(
            (c) => c.id !== id,
          ),
        }));
      },

      // =========================
      // CART
      // =========================

      addToCart: (item) =>
        patch((s) => {
          const idx = s.cart.findIndex(
            (i) =>
              i.productId === item.productId &&
              i.size === item.size &&
              i.color === item.color,
          );

          if (idx === -1) {
            return {
              cart: [...s.cart, item],
            };
          }

          const cart = [...s.cart];
          const existing = cart[idx]!;

          cart[idx] = {
            ...existing,
            quantity:
              existing.quantity + item.quantity,
          };

          return { cart };
        }),

      removeFromCart: (index) =>
        patch((s) => ({
          cart: s.cart.filter(
            (_, i) => i !== index,
          ),
        })),

      updateQuantity: (index, qty) =>
        patch((s) => ({
          cart: s.cart.map(
            (item, itemIndex) =>
              itemIndex === index
                ? {
                    ...item,
                    quantity: Math.max(
                      1,
                      Math.min(99, qty),
                    ),
                  }
                : item,
          ),
        })),

      clearCart: () =>
        patch(() => ({
          cart: [],
        })),

      cartCount: state.cart.reduce(
        (total, item) =>
          total + item.quantity,
        0,
      ),

      cartSubtotal,
      shippingFee,
      cartTotal:
        cartSubtotal + shippingFee,

      // =========================
      // WISHLIST
      // =========================

      toggleWishlist: (id) => {
        const has =
          state.wishlist.includes(id);

        patch((s) => ({
          wishlist: has
            ? s.wishlist.filter(
                (w) => w !== id,
              )
            : [...s.wishlist, id],
        }));

        return !has;
      },

      isWishlisted: (id) =>
        state.wishlist.includes(id),

      // =========================
      // ORDERS
      // =========================

      createOrder: (input) => {
        if (state.cart.length === 0)
          return null;

        const items = state.cart.map(
          (item) => {
            const product = findProduct(
              item.productId,
            );

            return {
              ...item,
              price: product
                ? product.price
                : item.price,
            };
          },
        );

        const subtotal = items.reduce(
          (sum, item) =>
            sum + item.price * item.quantity,
          0,
        );

        const fee =
          subtotal >=
          BUSINESS.freeShippingThreshold
            ? 0
            : BUSINESS.shippingFee;

        const seq = String(
          state.orders.length + 1,
        ).padStart(5, "0");

        const stamp =
          new Date().toISOString();

        const order: Order = {
          id: `ord_${Date.now()}`,
          orderNumber: `GFH-${new Date().getFullYear()}-${seq}`,
          customerId: state.customer?.id,
          customer: input.customer,
          items,
          shippingAddress:
            input.shippingAddress,
          subtotal,
          shippingFee: fee,
          discount: 0,
          totalAmount: subtotal + fee,

          payment: {
            provider: "razorpay",
            status: "pending",
          },

          orderStatus: "pending",

          shipping: {
            status: "not_shipped",
          },

          createdAt: stamp,
          updatedAt: stamp,
        };

        patch((s) => {
          const quantitiesByProduct = state.cart.reduce(
            (acc, item) => {
              acc[item.productId] =
                (acc[item.productId] ?? 0) +
                item.quantity;
              return acc;
            },
            {} as Record<string, number>,
          );

          return {
            orders: [
              order,
              ...s.orders,
            ],
            cart: [],
            products: s.products.map(
              (product) => {
                const quantitySold =
                  quantitiesByProduct[
                    product.id
                  ] ?? 0;

                if (!quantitySold) {
                  return product;
                }

                return {
                  ...product,
                  stock: Math.max(
                    0,
                    product.stock -
                      quantitySold,
                  ),
                };
              },
            ),
          };
        });

        return order;
      },

      updateOrder: (id, patchData) => {
        if (!state.adminToken) {
          return;
        }

        const backendPayload: Record<string, unknown> = {};
        if (patchData.orderStatus) {
          backendPayload.orderStatus = patchData.orderStatus;
        }
        if (patchData.payment?.status) {
          backendPayload.paymentStatus = patchData.payment.status;
        }
        if (patchData.shipping?.trackingNumber) {
          backendPayload.trackingNumber = patchData.shipping.trackingNumber;
        }

        if (Object.keys(backendPayload).length > 0) {
          fetch(`${API_URL}/orders/${id}/status`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${state.adminToken}`,
            },
            body: JSON.stringify(backendPayload),
          }).catch((error) => {
            console.error("Error syncing order status to backend:", error);
          });
        }

        patch((s) => ({
          orders: s.orders.map((order) =>
            order.id === id
              ? {
                  ...order,
                  ...patchData,
                  updatedAt: new Date().toISOString(),
                }
              : order,
          ),
        }));
      },

      deleteOrder: (id) =>
        patch((s) => ({
          orders: s.orders.filter(
            (order) => order.id !== id,
          ),
        })),

      setOrderStatus: (id, status) => {
        if (!state.adminToken) {
          return;
        }

        fetch(`${API_URL}/orders/${id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.adminToken}`,
          },
          body: JSON.stringify({ orderStatus: status }),
        }).catch((error) => {
          console.error("Error syncing order status to backend:", error);
        });

        patch((s) => ({
          orders: s.orders.map((order) =>
            order.id === id
              ? {
                  ...order,
                  orderStatus: status,
                  updatedAt: new Date().toISOString(),
                }
              : order,
          ),
        }));
      },

      setPaymentStatus: (id, status) => {
        if (!state.adminToken) {
          return;
        }

        fetch(`${API_URL}/orders/${id}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.adminToken}`,
          },
          body: JSON.stringify({ paymentStatus: status }),
        }).catch((error) => {
          console.error("Error syncing payment status to backend:", error);
        });

        patch((s) => ({
          orders: s.orders.map((order) =>
            order.id === id
              ? {
                  ...order,
                  payment: {
                    ...order.payment,
                    status,
                  },
                  updatedAt: new Date().toISOString(),
                }
              : order,
          ),
        }));
      },

      // =========================
      // CUSTOMER AUTH
      // =========================

      registerCustomer: async (
        payload,
      ) => {
        try {
          const response = await fetch(
            `${API_URL}/users/register`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            },
          );

          const data = await response.json();
          if (!response.ok || !data.success || !data.token || !data.user) {
            console.error(data.message ?? "Customer registration failed");
            return {
              success: false,
              message: data.message ?? "Unable to create account.",
            };
          }

          patch(() => ({
            customer: {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              phone: payload.phone,
            },
            customerToken: data.token,
          }));

          return { success: true };
        } catch (error) {
          console.error("Error registering customer:", error);
          return {
            success: false,
            message: "Unable to connect to the account service.",
          };
        }
      },

      loginCustomer: async (
        payload,
      ) => {
        try {
          const response = await fetch(
            `${API_URL}/users/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(payload),
            },
          );

          const data = await response.json();
          if (!response.ok || !data.success || !data.token || !data.user) {
            console.error(data.message ?? "Customer login failed");
            return false;
          }

          patch(() => ({
            customer: {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              phone: data.user.phone ?? "",
            },
            customerToken: data.token,
          }));

          return true;
        } catch (error) {
          console.error("Error logging customer in:", error);
          return false;
        }
      },

      loginGoogleCustomer: async (payload) => {
        try {
          const response = await fetch(`${API_URL}/users/google`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          const data = await response.json();
          if (!response.ok || !data.success || !data.token || !data.user) {
            console.error(data.message ?? "Google login failed");
            return false;
          }

          patch(() => ({
            customer: {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              phone: data.user.phone ?? "",
            },
            customerToken: data.token,
          }));

          return true;
        } catch (error) {
          console.error("Error logging in with Google email:", error);
          return false;
        }
      },

      logoutCustomer: () =>
        patch(() => ({
          customer: null,
          customerToken: null,
        })),

      // =========================
      // ADMIN LOGIN
      // =========================

      login: async (username, password) => {
        try {
          const response = await fetch(`${API_URL}/users/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username.trim(), password }),
          });
          const data = await response.json();

          if (!response.ok || !data.success || !data.token) return false;

          patch(() => ({
            adminEmail: data.username,
            adminToken: data.token,
          }));
          return true;
        } catch {
          return false;
        }
      },

      logout: () =>
        patch(() => ({
          adminEmail: null,
          adminToken: null,
        })),
    };
  }, [
    state,
    hydrated,
    patch,
    cartSubtotal,
    shippingFee,
  ]);

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopContext);

  if (!ctx) {
    throw new Error(
      "useShop must be used inside ShopProvider",
    );
  }

  return ctx;
}