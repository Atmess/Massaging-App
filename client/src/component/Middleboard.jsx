import { Outlet } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react'
import home from '../assets/picture/live-twin-home.png'
import image from '../assets/picture/live-twin-image.jpg'









export default function MiddleboardLayout() {

  return (
      <div className="flex flex-col h-screen min-w-0 flex-1 w-full bg-[#efeae2]"
 >
        <Outlet />{' '}
        {/* 👈 Child routes (Dashboard, Profile, Posts, etc.) render right here */}
      </div>
    
  );
}
