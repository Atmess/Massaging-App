import { useOutletContext } from 'react-router-dom';

export default function MyDeck() {
  // Grab both decks from context
  const { maindeck, extradeck } = useOutletContext();

  // Calculate live totals for both
  const currentMainSize = maindeck.reduce(
    (total, card) => total + card.quantity,
    0
  );
  const currentExtraSize = extradeck.reduce(
    (total, card) => total + card.quantity,
    0
  );

  // Expand both arrays
  const expandedMain = maindeck.flatMap((card) =>
    Array(card.quantity).fill(card)
  );
  const expandedExtra = extradeck.flatMap((card) =>
    Array(card.quantity).fill(card)
  );

  return (
    <div className="p-4 max-w-7xl mx-auto bg-white ">
      {/* ===================================== */}
      {/* MAIN DECK SECTION                     */}
      {/* ===================================== */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 border-b-2 border-gray-300 pb-2">
          <h2 className="text-2xl font-bold">Main Deck</h2>
          <div
            className={`text-xl font-bold ${currentMainSize === 60 ? 'text-red-500' : 'text-blue-600'}`}
          >
            {currentMainSize} / 60
          </div>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {expandedMain.map((card, index) => (
            <img
              key={`main-${card.id}-${index}`}
              src={card.img}
              alt={card.name}
              className="w-full aspect-[3/4] object-contain hover:scale-105 transition"
            />
          ))}
        </div>
      </div>

      {/* ===================================== */}
      {/* EXTRA DECK SECTION                    */}
      {/* ===================================== */}
      <div>
        <div className="flex items-center justify-between mb-4 border-b-2 border-purple-300 pb-2">
          <h2 className="text-2xl font-bold text-purple-800">Extra Deck</h2>
          <div
            className={`text-xl font-bold ${currentExtraSize === 15 ? 'text-red-500' : 'text-purple-600'}`}
          >
            {currentExtraSize} / 15
          </div>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 gap-2">
          {expandedExtra.map((card, index) => (
            <img
              key={`extra-${card.id}-${index}`}
              src={card.img}
              alt={card.name}
              className="w-full aspect-[3/4] object-contain hover:scale-105 transition"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
