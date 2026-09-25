import { useState } from "react";
import { Product } from "./data";
import { LandingPage } from "./pages/LandingPage";
import { CatalogPage } from "./pages/CatalogPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";

export type Page = "landing" | "catalog" | "product";

export default function App() {
  const [page, setPage] = useState<Page>("landing");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [previousPage, setPreviousPage] = useState<Page>("landing");

  function openProduct(p: Product, from: Page) {
    setSelectedProduct(p);
    setPreviousPage(from);
    setPage("product");
  }

  if (page === "product" && selectedProduct) {
    return (
      <ProductDetailPage
        product={selectedProduct}
        onBack={() => setPage(previousPage)}
      />
    );
  }

  if (page === "catalog") {
    return (
      <CatalogPage
        onBack={() => setPage("landing")}
        onDetails={(p) => openProduct(p, "catalog")}
      />
    );
  }

  return (
    <LandingPage
      onViewAll={() => setPage("catalog")}
      onDetails={(p) => openProduct(p, "landing")}
    />
  );
}
