import { useEffect, useState } from 'react';

export default function useLoadcard() {
  const [card, setcard] = useState([]);
  const [allcard, setallcard] = useState([]);
  const [loading, setloading] = useState(true);
  const [error, seterror] = useState(null);

  useEffect(() => {
    fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php')
      .then((response) => response.json())
      .then((data) => {
        const formatdata = data.data.map((item) => {
          return {
            id: item.id,
            name: item.name,
            img: item.card_images[0].image_url_small,
            price: item.card_prices[0].cardmarket_price,
            desc: item.desc,
            type: item.type,
            frametype: item.frameType,
            sets: item.card_sets
              ? item.card_sets[
                  Math.floor(Math.random() * item.card_sets.length)
                ]
              : 'promo / No Set',
          };
        });

        const twinCards = formatdata.filter((card) => {
          return (
            card.name.includes('Evil★Twin') || card.name.includes('Live☆Twin')
          );
        });

        const sufflecard = formatdata.sort(() => Math.random() - 0.5);
        setallcard(sufflecard);
        setcard(sufflecard.slice(0, 20));
      })
      .catch((error) => seterror(error))
      .finally(() => setloading(false));
  }, []);
  return { card, allcard, error, loading };
}
