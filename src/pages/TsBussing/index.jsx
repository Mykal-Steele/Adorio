import React from "react";
import "./styles.css";
import { shelfItems } from "./data";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import Shelf from "./Shelf";
import AdSenseScript from "../../Components/AdSenseScript";

// Main Page Component
const TsBussing = () => {
  return (
    <div className='min-h-screen text-neutral-200 font-main selection:bg-amber-900 selection:text-white grid grid-cols-1 md:grid-cols-[320px_1fr] md:overflow-y-auto bg-[#2e2e2e] ts-bussing-layout'>
      <AdSenseScript />
      {/* Background Image */}
      <div
        className='fixed inset-0 pointer-events-none z-0'
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1585773818428-b50bebdc2344?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8d29vZCUyMHdhbGx8ZW58MHx8MHx8fDA%3D')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.55,
        }}
      ></div>

      {/* Left Sidebar */}
      <LeftSidebar />

      {/* Main Content */}
      <main className='h-auto overflow-visible overflow-x-hidden relative z-10 md:row-span-2 md:col-start-2 custom-scrollbar ts-main-content'>
        <div className='relative z-10 max-w-4xl mx-auto pt-12 pb-24 px-4 md:px-12'>
          <div className='mb-10 text-center md:text-left md:pl-4'>
            <h2 className='text-4xl md:text-[340%] font-main font-bold mt-4 text-amber-100 drop-shadow-[0_4px_0_rgba(0,0,0,1)]'>
              Projects
            </h2>
            <p className=' mt-3 font-main  text-amber-400/80 text-s tracking-wide'>
              Click on the card to go to the project page!
            </p>
          </div>

          {/* Shelves */}
          <Shelf
            category='Web Dev'
            iconName='Code'
            speed={0.5}
            items={shelfItems.web}
          />
          <Shelf
            category='Game Dev'
            iconName='Play'
            speed={0.65}
            items={shelfItems.games}
          />
          <Shelf
            category='Artworks'
            iconName='Hammer'
            speed={0.8}
            items={shelfItems.art}
          />
        </div>
      </main>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
};

export default TsBussing;
