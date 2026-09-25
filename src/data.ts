export const assetPathPrefix = "/assets";
export const imgBrisLogotipo = `${assetPathPrefix}/d992f.png`;
export const imgBrisLogotipoBlue = `${assetPathPrefix}/bee22.png`;
export const imgBrisBlue = `${assetPathPrefix}/e8597.png`;
export const imgProductBread = `https://res.cloudinary.com/dtxa1leih/image/upload/v1790333277/bread_fhk0vv.png`;
export const imgProductBrownie = `https://res.cloudinary.com/dtxa1leih/image/upload/v1790333276/brownie_opxfbt.png`;
export const imgProductBiscoitos = `https://res.cloudinary.com/dtxa1leih/image/upload/v1790333276/biscoito_n873sd.png`;
export const imgArrowDown = `${assetPathPrefix}/5059e.svg`;
export const imgMenu = `${assetPathPrefix}/f8103.svg`;
export const imgClose = `${assetPathPrefix}/b8e40.svg`;
export const imgInstagram = `${assetPathPrefix}/d548e.svg`;
export const imgFacebook = `${assetPathPrefix}/6e35c.svg`;
export const imgTiktok = `${assetPathPrefix}/cff23.svg`;
export const imgWhatsappMask = `${assetPathPrefix}/6a461.svg`;
export const imgWhatsappFill = `${assetPathPrefix}/937cc.svg`;
export const imgPhone = `${assetPathPrefix}/1da69.svg`;
export const imgHouse = `${assetPathPrefix}/6192c.svg`;
export const imgUser = `${assetPathPrefix}/e09d9.svg`;
export const imgBag = `${assetPathPrefix}/e730c.svg`;

export const BAKERY_BG =
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&h=1000&fit=crop&auto=format";

export interface Product {
  id: number;
  name: string;
  price: string;
  description: string;
  image: string;
  category: string;
  weight?: string;
  ingredients?: string[];
  recheios?: string[];
  allergens?: string[];
  shelf?: string;
  servings?: string;
}

export const ALL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "PÃO DOCE",
    price: "€10",
    description:
      "Leve como uma pena, macio como uma nuvem! pesando aproximadamente 700g, nosso pão doce caseiro foi feito pensando principalmente no pequeno almoço.",
    image: imgProductBread,
    category: "Pães",
    weight: "700g",
    ingredients: ["Leite", "Ovos", "Açúcar", "Fermento biológico", "Óleo", "Farinha de trigo", "Sal"],
    recheios: ["Coco", "Goiabada", "Leite em pó", "Açúcar", "Puro"],
    allergens: ["Glúten", "Lactose", "Ovos"],
    shelf: "2 dias à temperatura ambiente",
    servings: "1 unidade",
  },
  {
    id: 2,
    name: "BROWNIE",
    price: "€15",
    description:
      "Sabores variados, a teu gosto. Faz a tua escolha e desfrute do melhor brownie que já provaste.",
    image: imgProductBrownie,
    category: "Doces",
    weight: "300g (caixa 6 unidades)",
    ingredients: ["Chocolate negro 70%", "Manteiga", "Açúcar mascavado", "Ovos", "Farinha de trigo", "Cacau em pó", "Sal flor"],
    allergens: ["Glúten", "Lactose", "Ovos", "Soja"],
    shelf: "5 dias no frigorífico",
    servings: "6 unidades",
  },
  {
    id: 3,
    name: "Biscoitos",
    price: "€7",
    description:
      "Biscoitos amanteigados, crocante mas derrete na boca, perfeito para acompanhar um chá ou café.",
    image: imgProductBiscoitos,
    category: "Biscoitos",
    weight: "500g",
    ingredients: ["Manteiga", "Açúcar refinado", "Amido de milho", "Farinha de trigo", "Leite condensado"],
    recheios: ["Coco", "Goiabada", "Limão", "Açúcar", "Puro", "Baunilha"],
    allergens: ["Glúten", "Lactose"],
    shelf: "7 dias em recipiente hermético",
  },
  
];
