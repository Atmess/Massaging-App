import { useOutletContext } from 'react-router-dom';
import Productcard from './Productcard';

export default function StructureDeck() {
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

  const Structure = [
    {
      id: 'sd-01',
      type: 'struckture deck',
      name: 'Structure Deck: Beware of Traptrix',
      price: 11.99,
      img: 'https://ms.yugipedia.com//thumb/f/fe/SDBT-DeckEN.png/257px-SDBT-DeckEN.png',
    },
    {
      id: 'sd-02',
      type: 'struckture deck',
      name: 'Structure Deck: Dark World',
      price: 10.5,
      img: 'https://ms.yugipedia.com//thumb/3/37/SR13-DeckEN.png/257px-SR13-DeckEN.png',
    },
    {
      id: 'sd-03',
      type: 'struckture deck',
      name: 'Structure Deck: Albaz Strike',
      price: 14.99,
      img: 'https://ms.yugipedia.com//thumb/a/af/SDAZ-DeckEN.png/257px-SDAZ-DeckEN.png',
    },
    {
      id: 'sd-04',
      type: 'struckture deck',
      name: 'Structure Deck: Cyber Strike',
      price: 12.99,
      img: 'https://ms.yugipedia.com//thumb/4/4c/SDCS-DeckEN.png/257px-SDCS-DeckEN.png',
    },
  ];
  return (
    <div className="grid  grid-cols-2 md:grid-cols-4 gap-4">
      {Structure.map((item) => {
        return <Productcard key={item.id} item={item} addToCart={addToCart} />;
      })}
    </div>
  );
}
