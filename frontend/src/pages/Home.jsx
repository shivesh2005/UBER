
import React from 'react';
import {Link} from 'react-router-dom';

const Home = () => {
  return (
    <div
      className="h-screen w-full bg-cover bg-center bg-no-repeat pt-8 flex flex-col justify-between"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1527603815363-e79385e0747e?q=80&w=1200&auto=format&fit=crop')",
      }}
    >
      <img
        className="w-16 ml-8"
        src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png"
        alt="Uber"
      />

      <div className="bg-white py-5 px-4">
        <h2 className="text-2xl font-bold">
          Get Started with Uber
        </h2>

        <Link to ='/login' className="flex items-center justify-center w-full bg-black text-white py-3 rounded mt-5">
          Continue
        </Link>
      </div>
    </div>
  );
};

export default Home; 
