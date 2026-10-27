import { useState } from 'react';

export default function Productcard({ item, addToCart, addToDeck }) {
  const [quantity, setquantity] = useState(1);

  return (
    // 1. p-2 on mobile, p-4 on desktop. w-full ensures it fills the grid cell.
    <div className="border p-2 md:p-4 rounded shadow bg-white flex flex-col justify-between w-full">
      <div>
        <h3 className="line-clamp-2 text-balance text-xs md:text-sm lg:text-lg font-semibold min-h-[2.5rem] md:min-h-[3rem] mt-2">
          {item.name}
        </h3>
        <img
          src={item.img}
          alt={item.name}
          className="w-full aspect-[3/4] object-contain"
        />

        {/* 2. Smaller text on mobile so long names don't take up 4 lines */}

        <p className="font-bold text-blue-600 text-sm md:text-base">
          ${item.price}
        </p>
      </div>

      <div className="mt-2 md:mt-4">
        {/* 3. Centered quantity controls with smaller mobile buttons */}
        <div className="flex items-center justify-between mb-2 border rounded overflow-hidden">
          <button
            onClick={() => {
              if (quantity > 1) setquantity(quantity - 1);
            }}
            className="px-2 md:px-3 py-1 bg-gray-200 hover:bg-gray-300 font-bold"
          >
            -
          </button>

          <input
            type="number"
            value={quantity}
            onChange={(e) => setquantity(Number(e.target.value))}
            className="w-8 md:w-10 text-center text-sm md:text-base focus:outline-none"
            min="1"
          />

          <button
            onClick={() => {
              setquantity(quantity + 1);
            }}
            className="px-2 md:px-3 py-1 bg-gray-200 hover:bg-gray-300 font-bold"
          >
            +
          </button>
        </div>

        {/* 4. text-sm on mobile ensures "Add To Cart" doesn't overflow */}
        <div className="flex flex-row gap-2">
          <button
            onClick={() => addToCart(item, quantity)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1.5 md:py-2 rounded font-bold text-sm md:text-base transition"
          >
            Add To Cart
          </button>
          {addToDeck && (
            <button
              onClick={() => {
                addToDeck(item, quantity);
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1.5 md:py-2 rounded font-bold text-sm md:text-base transition"
            >
              add to deck
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
