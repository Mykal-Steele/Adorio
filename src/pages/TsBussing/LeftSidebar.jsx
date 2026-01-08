import React from "react";
import { Icons } from "./Icons";

// Left Sidebar Component
const LeftSidebar = () => {
  return (
    <aside className='w-full z-30 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.5)] overflow-y-auto h-auto md:h-auto relative wood-pattern-dark row-start-1 col-start-1 ts-left-sidebar'>
      <div className='p-8 flex flex-col gap-8'>
        {/* Profile Frame */}
        <div
          className='relative mx-auto group'
          style={{ perspective: "1000px" }}
        >
          <div className='w-40 h-40 bg-neutral-800 border-[12px] border-amber-900 shadow-2xl rounded-lg overflow-hidden relative rotate-1 transition-transform group-hover:rotate-0'>
            <div className='absolute top-1 left-1 w-2 h-2 bg-amber-950 rounded-full shadow-inner'></div>
            <div className='absolute top-1 right-1 w-2 h-2 bg-amber-950 rounded-full shadow-inner'></div>
            <div className='absolute bottom-1 left-1 w-2 h-2 bg-amber-950 rounded-full shadow-inner'></div>
            <div className='absolute bottom-1 right-1 w-2 h-2 bg-amber-950 rounded-full shadow-inner'></div>
            <div className='w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400 overflow-hidden'>
              <img
                src='https://i.ibb.co/KxH3wXDS/download-3.png'
                alt='Oakar Oo'
                className='w-full h-full object-cover'
              />
            </div>
            <div className='absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none'></div>
          </div>
          <div className='text-center mt-4'>
            <h1 className='text-2xl font-black text-amber-100 drop-shadow-md font-handwriting tracking-widest '>
              Oakar Oo
            </h1>
            <p className='text-amber-400/80 text-sm font-main'>Student</p>
          </div>
        </div>

        {/* Navigation - with clear hierarchy */}
        <nav className='space-y-4'>
          {["Home", "About"].map((item) => (
            <a href='#' key={item} className='block relative group'>
              {item === "Home" && (
                <>
                  {/* Centered on the ropes using the same left/right values */}
                  <div className='absolute -top-5 left-[1.15rem] w-2.5 h-2.5 bg-zinc-900 rounded-full z-20 -translate-x-[40%] shadow-sm'></div>
                  <div className='absolute -top-5 right-[1.15rem] w-2.5 h-2.5 bg-zinc-900 rounded-full z-20 translate-x-[40%] shadow-sm'></div>
                </>
              )}

              <div className='absolute -top-4 left-[1.15rem] w-0.5 h-6 bg-amber-800 z-0'></div>
              <div className='absolute -top-4 right-[1.15rem] w-0.5 h-6 bg-amber-800 z-0'></div>

              <div className='relative z-10 h-9 bg-[#3d1a10] border border-amber-950/50 rounded flex items-center justify-center text-amber-200/80 text-sm tracking-wider transition-colors group-hover:bg-[#4a2014]'>
                {item}
              </div>
            </a>
          ))}

          {/* CV BUTTON */}
          <a href='#' className='block relative mt-8 group '>
            <div className='absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-8 bg-amber-800 z-0'></div>

            <div className='relative z-10  h-12 bg-gradient-to-b from-amber-700 to-amber-900 border-2 border-amber-400/30 rounded-lg flex items-center justify-center text-white font-bold tracking-widest transition-opacity group-hover:opacity-90'>
              My CV
            </div>
          </a>
        </nav>

        {/* Tool Rack */}
        <div className='bg-black/20 p-4 rounded-lg border border-white/5'>
          <h2 className='text-amber-500 text-xs  tracking-widest mb-4 border-b border-amber-500/30 pb-2'>
            Tech Stack
          </h2>
          <div className='grid grid-cols-3 gap-3'>
            <div className='flex flex-col items-center gap-1 group'>
              <Icons.Hammer className='text-neutral-400 group-hover:text-amber-400 transition-colors' />
              <span className='text-[10px] text-neutral-500'>HTML/CSS</span>
            </div>
            <div className='flex flex-col items-center gap-1 group'>
              <Icons.Code className='text-neutral-400 group-hover:text-blue-400 transition-colors' />
              <span className='text-[10px] text-neutral-500'>React</span>
            </div>
            <div className='flex flex-col items-center gap-1 group'>
              <Icons.Next className='text-neutral-400 group-hover:text-white transition-colors' />
              <span className='text-[10px] text-neutral-500'>Next.js</span>
            </div>
            <div className='flex flex-col items-center gap-1 group'>
              <Icons.Wind className='text-neutral-400 group-hover:text-sky-400 transition-colors' />
              <span className='text-[10px] text-neutral-500'>Tailwind</span>
            </div>

            <div className='flex flex-col items-center gap-1 group'>
              <Icons.Terminal className='text-neutral-400 group-hover:text-green-400 transition-colors' />
              <span className='text-[10px] text-neutral-500'>Node.js</span>
            </div>
            <div className='flex flex-col items-center gap-1 group'>
              <Icons.Server className='text-neutral-400 group-hover:text-gray-200 transition-colors' />
              <span className='text-[10px] text-neutral-500'>Express</span>
            </div>
            <div className='flex flex-col items-center gap-1 group'>
              <Icons.Flame className='text-neutral-400 group-hover:text-orange-400 transition-colors' />
              <span className='text-[10px] text-neutral-500'>Hono</span>
            </div>

            <div className='flex flex-col items-center gap-1 group'>
              <Icons.Terminal className='text-neutral-400 group-hover:text-yellow-300 transition-colors' />
              <span className='text-[10px] text-neutral-500'>Python</span>
            </div>
            <div className='flex flex-col items-center gap-1 group'>
              <Icons.Hash className='text-neutral-400 group-hover:text-purple-400 transition-colors' />
              <span className='text-[10px] text-neutral-500'>C#</span>
            </div>
            <div className='flex flex-col items-center gap-1 group'>
              <Icons.Zap className='text-neutral-400 group-hover:text-yellow-400 transition-colors' />
              <span className='text-[10px] text-neutral-500'>Socket.io</span>
            </div>

            <div className='flex flex-col items-center gap-1 group'>
              <Icons.Database className='text-neutral-400 group-hover:text-green-500 transition-colors' />
              <span className='text-[10px] text-neutral-500'>Mongo</span>
            </div>
            <div className='flex flex-col items-center gap-1 group'>
              <Icons.Layers className='text-neutral-400 group-hover:text-indigo-400 transition-colors' />
              <span className='text-[10px] text-neutral-500'>Prisma</span>
            </div>
            <div className='flex flex-col items-center gap-1 group'>
              <Icons.Whale className='text-neutral-400 group-hover:text-blue-500 transition-colors' />
              <span className='text-[10px] text-neutral-500'>Docker</span>
            </div>

            <div className='flex flex-col items-center gap-1 group'>
              <Icons.RefreshCw className='text-neutral-400 group-hover:text-emerald-400 transition-colors' />
              <span className='text-[10px] text-neutral-500'>CI/CD</span>
            </div>
            <div className='flex flex-col items-center gap-1 group'>
              <Icons.Globe className='text-neutral-400 group-hover:text-green-600 transition-colors' />
              <span className='text-[10px] text-neutral-500'>Nginx</span>
            </div>
            <div className='flex flex-col items-center gap-1 group'>
              <Icons.Triangle className='text-neutral-400 group-hover:text-white transition-colors' />
              <span className='text-[10px] text-neutral-500'>Vercel</span>
            </div>

            <div className='flex flex-col items-center gap-1 group'>
              <Icons.Cloud className='text-neutral-400 group-hover:text-blue-300 transition-colors' />
              <span className='text-[10px] text-neutral-500'>Render</span>
            </div>
            <div className='flex flex-col items-center gap-1 group'>
              <Icons.Compass className='text-neutral-400 group-hover:text-rose-400 transition-colors' />
              <span className='text-[10px] text-neutral-500'>Northflank</span>
            </div>
            <div className='flex flex-col items-center gap-1 group'>
              <Icons.CloudLightning className='text-neutral-400 group-hover:text-orange-400 transition-colors' />
              <span className='text-[10px] text-neutral-500'>Cloudflare</span>
            </div>

            <div className='flex flex-col items-center gap-1 group'>
              <Icons.Tag className='text-neutral-400 group-hover:text-orange-600 transition-colors' />
              <span className='text-[10px] text-neutral-500'>Namecheap</span>
            </div>
            <div className='flex flex-col items-center gap-1 group'>
              <Icons.Sparkle className='text-neutral-400 group-hover:text-blue-400 transition-colors' />
              <span className='text-[10px] text-neutral-500'>Gemini</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;
