import Productcard from './Productcard';

export default function Accessories() {
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

  const accessoryData = [
    {
      id: 'acc-01',
      name: 'I:P Masquerena Card Case',
      price: 5.99,
      img: 'https://www.yugioh-card.com/eu/wp-content/uploads/2022/10/IPM-Accessories-Card-Case.webp',
    },
    {
      id: 'acc-02',
      name: 'Kuriboh Kollection Card Sleeves (50ct)',
      price: 4.99,
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQp-NgQ96TI2jIxRs0SZDjJEuoKTMOVodrtudUu7dX2fA&s=10',
    },
    {
      id: 'acc-03',
      name: 'Albaz - Ecclesia - Tri-Brigade Game Mat',
      price: 14.99,
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYboK7AEYTGB23Fp6_HbgOCw-BnWAAQKH9VHcW4qd6qA&s=10',
    },
    {
      id: 'acc-04',
      name: 'Dark Magician Girl Card Sleeves (50ct)',
      price: 4.99,
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOKc7rzihsVRHZknieF-LQUUMKGkq3llqGDzDn89eHAg&s=10',
    },
    {
      id: 'acc-05',
      name: '25th Anniversary Black and Gold Deck Box',
      price: 6.99,
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfJsQ4nM9TsL0I6CoR8ZfuJoRMUg2EGMSAMT8wuW30EQ&s=10',
    },
    {
      id: 'acc-06',
      name: '9-Pocket Duelist Portfolio: Dark Magician',
      price: 15.99,
      img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTn3g8fXBzBlJCH1F4WTgpIFFj8us5-SN6cqGTpeKMinQ&s',
    },
  ];

  return (
    <div className="grid  grid-cols-2 md:grid-cols-4 gap-4">
      {accessoryData.map((item) => {
        return <Productcard key={item.id} item={item} addToCart={addToCart} />;
      })}
    </div>
  );
}
