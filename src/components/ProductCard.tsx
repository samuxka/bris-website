import { Product } from "../data";

export function ProductCard({
  product,
  onDetails,
}: {
  product: Product;
  onDetails: (p: Product) => void;
}) {
  return (
    <div className="bg-white rounded-[15px] overflow-hidden flex flex-col w-full h-full p-1">
      <div className="bg-[#d9d9d9] rounded-t-[12px] rounded-b-[7px] flex items-center justify-center">
        <img
          src={product.image}
          alt={product.name}
          className="h-40 w-40 object-contain"
        />
      </div>
      <div className="p-3 flex flex-col gap-1 flex-1">
        <div className="flex justify-between items-baseline ">
          <span className="font-semibold text-[#242424] text-md">
            {product.name}
          </span>
          <span className="font-semibold text-[#242424] text-md">
            {product.price}
          </span>
        </div>
        <p className="text-[#aaa] text-[15px] leading-[1.3] line-clamp-3 mb-4">
          {product.description}
        </p>
        <button
          onClick={() => onDetails(product)}
          className="mt-auto bg-[#0d4380] text-white text-[14px] font-semibold rounded-[10px] py-3 w-full hover:bg-[#092d58] transition-colors"
        >
          Ver detalhes
        </button>
      </div>
    </div>
  );
}
