import { useState } from 'react';
import { Outlet } from 'react-router-dom';

export default function Mainpage() {
  const [cart, setcart] = useState([]);

  return (
    <main className="flex flex-1 w-full h-full">
      <Outlet context={{ cart, setcart }} />
    </main>
  );
}
