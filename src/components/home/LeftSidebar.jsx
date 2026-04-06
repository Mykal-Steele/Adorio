import { Icons } from "./Icons";
import Image from "next/image";
import me from "@/assets/me.webp";
const NAV_ITEMS = ["Home", "About"];

const TECH_STACK = [
  { icon: "Hammer", hover: "group-hover:text-amber-400", label: "HTML/CSS" },
  { icon: "Code", hover: "group-hover:text-blue-400", label: "React" },
  { icon: "Next", hover: "group-hover:text-white", label: "Next.js" },
  { icon: "Wind", hover: "group-hover:text-sky-400", label: "Tailwind" },
  { icon: "Terminal", hover: "group-hover:text-green-400", label: "Node.js" },
  { icon: "Server", hover: "group-hover:text-gray-200", label: "Express" },
  { icon: "Flame", hover: "group-hover:text-orange-400", label: "Hono" },
  { icon: "Terminal", hover: "group-hover:text-yellow-300", label: "Python" },
  { icon: "Hash", hover: "group-hover:text-purple-400", label: "C#" },
  { icon: "Zap", hover: "group-hover:text-yellow-400", label: "Socket.io" },
  { icon: "Database", hover: "group-hover:text-green-500", label: "Mongo" },
  { icon: "Layers", hover: "group-hover:text-indigo-400", label: "Prisma" },
  { icon: "Whale", hover: "group-hover:text-blue-500", label: "Docker" },
  { icon: "RefreshCw", hover: "group-hover:text-emerald-400", label: "CI/CD" },
  { icon: "Globe", hover: "group-hover:text-green-600", label: "Nginx" },
  { icon: "Triangle", hover: "group-hover:text-white", label: "Vercel" },
  { icon: "Cloud", hover: "group-hover:text-blue-300", label: "Render" },
  { icon: "Compass", hover: "group-hover:text-rose-400", label: "Northflank" },
  {
    icon: "CloudLightning",
    hover: "group-hover:text-orange-400",
    label: "Cloudflare",
  },
  { icon: "Tag", hover: "group-hover:text-orange-600", label: "Namecheap" },
  { icon: "Sparkle", hover: "group-hover:text-blue-400", label: "Gemini" },
];

function TechItem({ icon, hover, label }) {
  const IconComponent = Icons[icon] ?? Icons.Code;

  return (
    <div className="flex flex-col items-center gap-1 group">
      <IconComponent
        className={`text-neutral-400 transition-colors ${hover}`}
      />
      <span className="text-[10px] text-neutral-700">{label}</span>
    </div>
  );
}

const LeftSidebar = () => {
  return (
    <aside className="w-full z-30 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.5)] overflow-y-auto h-auto md:h-screen md:sticky md:top-0 relative wood-pattern-dark row-start-1 col-start-1 ts-left-sidebar">
      <div className="p-8 flex flex-col gap-8">
        <div
          className="relative mx-auto group"
          style={{ perspective: "1000px" }}
        >
          <div className="w-40 h-40 bg-neutral-800 border-12 border-amber-900 shadow-2xl rounded-lg overflow-hidden relative rotate-1 transition-transform group-hover:rotate-0">
            <div className="absolute top-1 left-1 w-2 h-2 bg-amber-950 rounded-full shadow-inner"></div>
            <div className="absolute top-1 right-1 w-2 h-2 bg-amber-950 rounded-full shadow-inner"></div>
            <div className="absolute bottom-1 left-1 w-2 h-2 bg-amber-950 rounded-full shadow-inner"></div>
            <div className="absolute bottom-1 right-1 w-2 h-2 bg-amber-950 rounded-full shadow-inner"></div>
            <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400 overflow-hidden">
              <Image
                src={me}
                alt="Oakar Oo"
                width={160}
                height={160}
                priority
                fetchPriority="high"
                className="w-full h-full object-cover"
                sizes="160px"
              />
            </div>
            <div className="absolute top-0 right-0 w-full h-full bg-linear-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>
          </div>
          <div className="text-center mt-4">
            <h1 className="text-2xl font-black text-amber-100 drop-shadow-md font-poppins tracking-widest ">
              Oakar Oo
            </h1>
            <p className="text-amber-300 text-sm font-main">Student</p>
          </div>
        </div>

        <nav className="space-y-4">
          {NAV_ITEMS.map((item) => (
            <a href="#" key={item} className="block relative group">
              {item === "Home" && (
                <>
                  <div className="absolute -top-5 left-[1.15rem] w-2.5 h-2.5 bg-zinc-900 rounded-full z-20 -translate-x-[40%] shadow-sm"></div>
                  <div className="absolute -top-5 right-[1.15rem] w-2.5 h-2.5 bg-zinc-900 rounded-full z-20 translate-x-[40%] shadow-sm"></div>
                </>
              )}

              <div className="absolute -top-4 left-[1.15rem] w-0.5 h-6 bg-amber-800 z-0"></div>
              <div className="absolute -top-4 right-[1.15rem] w-0.5 h-6 bg-amber-800 z-0"></div>

              <div className="relative z-10 h-9 bg-[#3d1a10] border border-amber-950/50 rounded flex items-center justify-center text-amber-200/80 text-sm tracking-wider transition-colors group-hover:bg-[#4a2014]">
                {item}
              </div>
            </a>
          ))}

          <a href="#" className="block relative mt-5 group ">
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-1 h-8 bg-amber-800 z-0"></div>

            <div className="relative z-10  h-12 bg-linear-to-b from-amber-700 to-amber-900 border-2 border-amber-400/30 rounded-lg flex items-center justify-center text-white font-bold tracking-widest transition-opacity group-hover:opacity-90">
              My CV
            </div>
          </a>
        </nav>

        <div className="bg-black/20 p-4 rounded-lg border border-white/5">
          <h2 className="text-amber-500 text-xs  tracking-widest mb-4 border-b border-amber-500/30 pb-2">
            Tech Stack
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {TECH_STACK.map((item) => (
              <TechItem
                key={`${item.icon}-${item.label}`}
                icon={item.icon}
                hover={item.hover}
                label={item.label}
              />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default LeftSidebar;
