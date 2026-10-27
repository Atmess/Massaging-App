import { useState } from 'react';
import { Outlet } from 'react-router-dom';

export default function Mainpage() {
  const [cart, setcart] = useState([]);

  return (
    <main className="flex justify-center">
      <Outlet context={{ cart, setcart }} />
    </main>
  );
}
