import { useOutletContext } from 'react-router-dom';

export default function Cart() {
  const { cart, setcart } = useOutletContext();
  const handleprice = cart
    .reduce((total, item) => {
      return total + Number(item.price * item.quantity);
    }, 0)
    .toFixed(2);

  const increasequantity = (id) => {
    const updatecart = cart.map((item) => {
      if (item.id === id) {
        return { ...item, quantity: item.quantity + 1 };
      }
      return item;
    });
    setcart(updatecart);
  };

  const decreasequantity = (id) => {
    const updatecart = cart.map((item) => {
      if (item.id === id) {
        if (item.quantity > 1) {
          return { ...item, quantity: item.quantity - 1 };
        }
      }
      return item;
    });
    setcart(updatecart);
  };

  return (
    <div>
      <div className="grid  grid-cols-2  md:grid-cols-4 gap-4 ">
        {cart.map((item, index) => {
          return (
            <div
              className="border p-2 md:p-4 rounded shadow bg-white flex flex-col justify-between w-full"
              key={index}
            >
              <h3 className="line-clamp-2 text-balance text-xs md:text-sm lg:text-lg font-semibold min-h-[2.5rem] md:min-h-[3rem] mt-2">
                {item.name}
              </h3>
              <img
                src={item.img}
                alt={item.name}
                className="w-full aspect-[59/86] object-contain"
              />
              <p>{item.id}</p>
              <p>type : {item.type}</p>
              <p> price : {item.price} $</p>
              <p>quantity : {item.quantity}</p>
              <p>
                total price : {Number(item.price * item.quantity).toFixed(2)}
              </p>

              <div>
                <button
                  onClick={() => {
                    increasequantity(item.id);
                  }}
                >
                  +
                </button>
                <button>remove</button>
                <button
                  onClick={() => {
                    decreasequantity(item.id);
                  }}
                >
                  -
                </button>
              </div>
              <button
                onClick={() => {
                  console.log(item);
                }}
              >
                card
              </button>
            </div>
          );
        })}
      </div>
      <h2>total price :{handleprice} $</h2>
      <h2>Cart Page</h2>
    </div>
  );
}
