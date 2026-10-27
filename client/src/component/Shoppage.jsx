import { Link, Outlet, useOutletContext } from 'react-router-dom';
import useLoadcard from './Loadcard';
import { useState } from 'react';

export default function Shop() {
  const { cart, setcart } = useOutletContext();
  const { card, allcard, error, loading } = useLoadcard();
  const [maindeck, setmain] = useState([]);
  const [extradeck, setextra] = useState([]);
  return (
    <div>
      <nav className="flex justify-center gap-2 p-1 flex-wrap md:gap-4 p-4">
        <Link
          to="/shop/"
          className=" bg-blue-500 text-white rounded hover:bg-blue-800 transition px-1 py-1 md:px-4 md:py-2 "
        >
          Single
        </Link>
        <Link
          to="/shop/struckture"
          className=" bg-blue-500 text-white rounded hover:bg-blue-800 transition px-1 py-1 md:px-4 md:py-2"
        >
          struckture
        </Link>
        <Link
          to="/shop/sealed"
          className=" bg-blue-500 text-white rounded hover:bg-blue-800 transition px-1 py-1 md:px-4 md:py-2"
        >
          sealed product
        </Link>
        <Link
          to="/shop/accessories"
          className=" bg-blue-500 text-white rounded hover:bg-blue-800 transition px-1 py-1 md:px-4 md:py-2"
        >
          accessories
        </Link>
        <Link
          to="/shop/mydeck"
          className=" bg-blue-500 text-white rounded hover:bg-blue-800 transition px-1 py-1 md:px-4 md:py-2"
        >
          My Deck
        </Link>
      </nav>
      <Outlet
        context={{
          cart,
          setcart,
          card,
          allcard,
          error,
          loading,
          maindeck,
          setmain,
          extradeck,
          setextra,
        }}
      />
    </div>
  );
}
