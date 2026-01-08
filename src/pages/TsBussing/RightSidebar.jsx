import React from "react";
import { Icons } from "./Icons";
import CalendarWidget from "./CalendarWidget";

// Right Sidebar Component
const RightSidebar = () => {
  return (
    <aside className='w-full z-30 shadow-[-4px_0_24px_rgba(0,0,0,0.5)] h-auto md:h-auto overflow-y-auto border-l-0 md:border-l-0 border-t-8 md:border-t-8 border-amber-900 cork-pattern md:col-start-1 md:row-start-2 ts-right-sidebar'>
      <div className='p-6 flex flex-col gap-6 relative'>
        {/* Note */}
        <div className='bg-yellow-100 text-yellow-900 p-4 shadow-md rotate-[2.5deg] transform relative'>
          <div className='absolute -top-3 mt-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-500 shadow-md'></div>
          <p className='font-poppins text-base leading-relaxed'>
            Currently Learning
            <br />
            <span className='text-amber-700 font-bold'>Golang!</span>
          </p>
          <p className='text-[10px] font-main text-yellow-700/60 mt-2 -rotate-1'>
            — pinned Jan 7 2026
          </p>
        </div>

        <div className='grid grid-cols-1 gap-3 mt-4'>
          <a
            href='https://github.com/Mykal-Steele/'
            className='bg-neutral-100 text-neutral-900 p-4 shadow-lg rotate-[2.5deg] hover:rotate-[0.5deg] hover:scale-[1.02] transition-all duration-300 relative group ml-2'
          >
            <div className='absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-yellow-500 shadow-md z-10'></div>
            <div className='flex items-center gap-3'>
              <Icons.Github />
              <span className='font-poppins font-bold hover:underline'>
                Mykal-Steele
              </span>
            </div>
            <span className='text-[10px] text-neutral-500 font-main mt-1 block'>
              - check my codes here
            </span>
          </a>
          <a
            href='mailto:oakar@adorio.space'
            className='bg-amber-50 text-amber-900 p-3 shadow-md -rotate-[3deg] hover:-rotate-[1deg] transition-all duration-200 relative group mr-4 mt-4'
          >
            <div className='absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-500 shadow-sm z-10'></div>
            <div className='flex items-center gap-2'>
              <Icons.Mail />
              <span className='font-poppins font-bold text-sm hover:underline'>
                oakar@adorio.space
              </span>
            </div>
            <span className='text-[10px] text-neutral-500 font-main mt-1 block'>
              - sadly, i can't email you back with this email, but i WILL reply
              you back!
            </span>
          </a>
        </div>

        {/* Calendar */}
        <CalendarWidget />

        {/* Hint Sticky Note */}
        <div className='bg-amber-50 p-4 shadow-md rotate-[-1.5deg] transform relative mt-4 hover:rotate-[0.5deg] transition-all duration-300'>
          <div className='absolute -top-3 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 shadow-md'></div>
          <p className='font-poppins text-neutral-800 text-sm leading-relaxed'>
            There is an easier egg! :D
            <br />
            <span className='text-neutral-500 text-xs font-main ml-2'>
              (hint: tilt)
            </span>
          </p>
        </div>
      </div>
    </aside>
  );
};

export default RightSidebar;
