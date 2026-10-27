import { type } from '@testing-library/user-event/dist/cjs/utility/type.js';
import Productcard from './Productcard';
import { useOutletContext } from 'react-router-dom';

export default function SealedProduct() {
  const { cart, setcart } = useOutletContext();

  const addToCart = (item, newquantity) => {
    const existcard = cart.find((cartitem) => cartitem.id === item.id);

    if (existcard) {
      const updatecart = cart.map((cartmap) => {
        if (cartmap.id === item.id) {
          return { ...cartmap, quantity: cartmap.quantity + newquantity };
        }
        return cartmap;
      });
      setcart(updatecart);
    } else {
      setcart([...cart, { ...item, quantity: newquantity }]);
      console.log(item);
      console.log(newquantity);
    }
  };
  // Paste this into your Sealed.jsx file!
  const sealedData = [
    {
      id: 'seal-01',
      type: 'sealedpack',
      name: 'Phantom Nightmare Booster Box',
      price: 79.99,
      img: 'https://ms.yugipedia.com//thumb/4/41/PHNI-BoosterEN.png/257px-PHNI-BoosterEN.png',
    },
    {
      id: 'seal-02',
      type: 'sealedpack',
      name: 'Legacy of Destruction Booster Box',
      price: 84.99,
      img: 'https://ms.yugipedia.com//thumb/a/ac/LEDE-BoosterEN.png/257px-LEDE-BoosterEN.png',
    },
    {
      id: 'seal-03',
      type: 'sealedpack',
      name: 'Age of Overlord Booster Box',
      price: 110.0,
      img: 'https://ms.yugipedia.com//thumb/6/60/AGOV-BoosterEN.png/257px-AGOV-BoosterEN.png',
    },
    {
      id: 'seal-04',
      type: 'sealedpack',
      name: '25th Anniversary Rarity Collection Box',
      price: 130.0,
      img: 'https://www.yugioh-card.com/eu/wp-content/uploads/2023/10/RA01_Display_Mockup-EN-768x791.webp',
    },
    {
      id: 'seal-05',
      type: 'sealedpack',
      name: '25th Anniversary Tin: Dueling Heroes',
      price: 19.99,
      img: 'https://ms.yugipedia.com//thumb/7/7e/TN23-PromoEN.png/257px-TN23-PromoEN.png',
    },
    {
      id: 'seal-06',
      type: 'sealedpack',
      name: 'Battles of Legend: Terminal Revenge',
      price: 89.99,
      img: 'https://ms.yugipedia.com//thumb/4/4a/BLTR-BoosterEN.png/257px-BLTR-BoosterEN.png',
    },
  ];

  return (
    <div className="grid  grid-cols-2 md:grid-cols-4 gap-4">
      {sealedData.map((item) => {
        return <Productcard key={item.id} item={item} addToCart={addToCart} />;
      })}
    </div>
  );
}
