export const assetPathPrefix = "/assets";
export const imgBrisLogotipo = `${assetPathPrefix}/d992f.png`;
export const imgBrisLogotipoBlue = `${assetPathPrefix}/bee22.png`;
export const imgBrisBlue = `${assetPathPrefix}/e8597.png`;
export const imgProductBread = `https://res.cloudinary.com/dtxa1leih/image/upload/v1790333277/bread_fhk0vv.png`;
export const imgProductPudim = `https://res.cloudinary.com/dtxa1leih/image/upload/v1795391843/file_00000000187481f48f43f8dfbf81dd22_w6sbop.png`
export const imgProductPanetone = `https://res.cloudinary.com/dtxa1leih/image/upload/v1795391842/file_00000000f67882108cde4a0d0a4b5d80_grego2.png`
export const imgProductTravessa = `https://res.cloudinary.com/dtxa1leih/image/upload/v1795391843/file_00000000d3508210bba98c7c8ea7f916_ikv4li.png`
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
    price: "€8",
    description:
      "Sabores variados, a teu gosto. Faz a tua escolha e desfrute do melhor brownie que já provaste.",
    image: imgProductBrownie,
    category: "Doces",
    weight: "250g",
    ingredients: ["Chocolate negro 70%", "Manteiga", "Açúcar mascavado", "Ovos", "Farinha de trigo", "Cacau em pó", "Sal flor"],
    allergens: ["Glúten", "Lactose", "Ovos", "Soja"],
    shelf: "5 dias no frigorífico",
  },
  {
    id: 3,
    name: "Biscoitos",
    price: "€6",
    description:
      "Biscoitos amanteigados, crocante mas derrete na boca, perfeito para acompanhar um chá ou café.",
    image: imgProductBiscoitos,
    category: "Biscoitos",
weight: "400g",
    ingredients: ["Manteiga", "Açúcar refinado", "Amido de milho", "Farinha de trigo", "Leite condensado"],
    recheios: ["Coco", "Goiabada", "Limão", "Açúcar", "Puro", "Baunilha"],
    allergens: ["Glúten", "Lactose"],
    shelf: "30 dias em recipiente hermético",
  },
{
    id: 4,
    name: "Pudim",
    price: "€20",
    description:
      "Pudim delicioso pra comer acompanhado com quem você ama! se delicie e aproveite cada colherada desse clássico da culinária.",
    image: imgProductPudim,
    category: "Doces",
    ingredients: ["Leite condensado", "Leite", "Ovos", "Açúcar"],
    allergens: ["Lactose"],
  },
{
    id: 5,
    name: "Panetone Trufado",
    price: "€26",
    description:
      "Macio, Leve e Saboroso tudo isso em uma única receita! Nesse natal leve o seu para dividir com quem você ama!.",
    image: imgProductPanetone,
    category: "Pães",
    ingredients: ["Farinha de trigo", "Fermento", "Ovos", "Açúcar", "Manteiga", "Sal", "Essência de Baunilha", "Leite"],
    allergens: ["Lactose", "Glúten"],
  },
  
];
