"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";
import {
  AnimatePresence,
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  ArrowUp,
  Box,
  ChevronDown,
  ExternalLink,
  Eye,
  MessageSquare,
  Shield,
} from "lucide-react";

type ProjectItem = {
  id: number;
  title: string;
  depth: number;
  tagline: string;
  desc: string;
  tech: string[];
  color: string;
  icon: ReactNode;
  liveUrl: string;
  sourceUrl: string;
};

const PROJECTS: ProjectItem[] = [
  {
    id: 1,
    title: "Adorio Social",
    depth: 1500,
    tagline: "Community Board",
    desc: "A social board for sharing useful updates with text, photos, PDFs, and docs. It supports posts, comments, votes, attachments, and theme switching.",
    tech: ["Next.js", "Prisma", "TypeScript"],
    color: "#0ea5e9",
    icon: <MessageSquare className="h-5 w-5 md:h-6 md:w-6" />,
    liveUrl: "https://social.adorio.space",
    sourceUrl: "https://github.com/Mykal-Steele",
  },
  {
    id: 2,
    title: "Echo Shell",
    depth: 3500,
    tagline: "Distributed Terminal",
    desc: "Encrypted peer-to-peer workspace syncing. Operating in the shadows where privacy and speed intersect.",
    tech: ["Go", "WebRTC", "SQLite"],
    color: "#38bdf8",
    icon: <Shield className="h-5 w-5 md:h-6 md:w-6" />,
    liveUrl: "#",
    sourceUrl: "#",
  },
  {
    id: 3,
    title: "Loom Protocol",
    depth: 5500,
    tagline: "Immutable Identity",
    desc: "Decentralized identity layer for automated supply chains. Deep-level security and high-pressure verification.",
    tech: ["Solidity", "TypeScript", "IPFS"],
    color: "#818cf8",
    icon: <Box className="h-5 w-5 md:h-6 md:w-6" />,
    liveUrl: "#",
    sourceUrl: "#",
  },
  {
    id: 4,
    title: "Abyss Visualizer",
    depth: 7500,
    tagline: "Real-time Telemetry",
    desc: "Bioluminescent data mapping for deep-sea sensor arrays. Visualizing the invisible in the deepest trenches.",
    tech: ["React", "Three.js", "Python"],
    color: "#6366f1",
    icon: <Eye className="h-5 w-5 md:h-6 md:w-6" />,
    liveUrl: "#",
    sourceUrl: "#",
  },
];

const MAX_PROJECT_DEPTH = Math.max(...PROJECTS.map((project) => project.depth));
const TOTAL_DEPTH = MAX_PROJECT_DEPTH + 1500;
const SCROLL_FACTOR = Math.max(PROJECTS.length * 280, 700);
const DEPTH_BUFFER = 400;
const FINAL_DEPTH_END = 8900;
const TOP_DEPTH_THRESHOLD = 100;
const BOTTOM_DEPTH_THRESHOLD = 8910;
const LOADER_MIN_VISIBLE_MS = 900;
const LOADER_EXIT_DELAY_MS = 280;
const LOADER_PROGRESS_INTERVAL_MS = 120;
const LOADER_PROGRESS_CEILING = 94;
const SCENE_WARMUP_FRAMES = 24;

const EASE_SMOOTH: [number, number, number, number] = [0.22, 1, 0.36, 1];

function findProjectByDepth(depth: number): ProjectItem | null {
  for (let index = 0; index < PROJECTS.length; index += 1) {
    const startThreshold = PROJECTS[index].depth - DEPTH_BUFFER;
    const endThreshold =
      index < PROJECTS.length - 1
        ? PROJECTS[index + 1].depth - DEPTH_BUFFER
        : FINAL_DEPTH_END;

    if (depth >= startThreshold && depth < endThreshold) {
      return PROJECTS[index];
    }
  }

  return null;
}

function scrollTopForDepth(depth: number): number {
  return (
    (depth / TOTAL_DEPTH) *
    (document.documentElement.scrollHeight - window.innerHeight)
  );
}

type DepthReadoutProps = {
  value: MotionValue<number>;
};

function DepthReadout({ value }: DepthReadoutProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const unsubscribe = value.on("change", (nextValue) => {
      setDisplayValue(Math.floor(nextValue));
    });

    return () => unsubscribe();
  }, [value]);

  return (
    <div className="text-right">
      <span className="block text-2xl leading-none tracking-tighter text-white/90 md:text-4xl font-mono font-light">
        {displayValue.toLocaleString()}
      </span>
      <span className="mt-1 block text-[8px] font-bold uppercase tracking-widest opacity-30 md:mt-2 md:text-[9px]">
        Meters
      </span>
    </div>
  );
}

export default function Projects() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const loadingStartRef = useRef(0);
  const [activeProject, setActiveProject] = useState<ProjectItem>(PROJECTS[0]);
  const [showProjectCard, setShowProjectCard] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const [windowLoaded, setWindowLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(8);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);

  const { scrollYProgress } = useScroll();

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 60,
    mass: 0.4,
    restDelta: 0.0001,
  });

  const depthValue = useTransform(smoothProgress, [0, 1], [0, TOTAL_DEPTH]);
  const meterFill = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    loadingStartRef.current = performance.now();
  }, []);

  useEffect(() => {
    const markLoaded = () => {
      setWindowLoaded(true);
    };

    if (document.readyState === "complete") {
      markLoaded();
      return;
    }

    window.addEventListener("load", markLoaded, { once: true });

    return () => {
      window.removeEventListener("load", markLoaded);
    };
  }, []);

  useEffect(() => {
    if (!isLoading) {
      return;
    }

    const timer = window.setInterval(() => {
      setLoadingProgress((current) => {
        if (current >= LOADER_PROGRESS_CEILING) {
          return current;
        }

        return Math.min(
          LOADER_PROGRESS_CEILING,
          current + Math.random() * 6 + 1.5,
        );
      });
    }, LOADER_PROGRESS_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [isLoading]);

  useEffect(() => {
    if (!sceneReady || !windowLoaded) {
      return;
    }

    const elapsed = performance.now() - loadingStartRef.current;
    const waitForMinimum = Math.max(0, LOADER_MIN_VISIBLE_MS - elapsed);

    const completeTimer = window.setTimeout(() => {
      setLoadingProgress(100);
    }, waitForMinimum);

    const hideTimer = window.setTimeout(() => {
      setIsLoading(false);
    }, waitForMinimum + LOADER_EXIT_DELAY_MS);

    return () => {
      window.clearTimeout(completeTimer);
      window.clearTimeout(hideTimer);
    };
  }, [sceneReady, windowLoaded]);

  useEffect(() => {
    const unsubscribe = depthValue.on("change", (depth) => {
      const hit = findProjectByDepth(depth);

      if (hit) {
        setActiveProject((current) => (current.id === hit.id ? current : hit));
      }
      setShowProjectCard((current) => {
        const next = Boolean(hit);
        return current === next ? current : next;
      });

      const bottomStatus = depth > BOTTOM_DEPTH_THRESHOLD;
      const topStatus = depth < TOP_DEPTH_THRESHOLD;
      setIsAtBottom((current) =>
        current === bottomStatus ? current : bottomStatus,
      );
      setIsAtTop((current) => (current === topStatus ? current : topStatus));
    });

    return () => unsubscribe();
  }, [depthValue]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
        return;
      }

      event.preventDefault();
      const currentDepth = smoothProgress.get() * TOTAL_DEPTH;
      let target: ProjectItem | undefined;

      if (event.key === "ArrowDown") {
        target = PROJECTS.find(
          (project) => project.depth > currentDepth + DEPTH_BUFFER,
        );
      } else {
        for (let index = PROJECTS.length - 1; index >= 0; index -= 1) {
          if (PROJECTS[index].depth < currentDepth - DEPTH_BUFFER) {
            target = PROJECTS[index];
            break;
          }
        }
      }

      if (target) {
        const scrollTarget = scrollTopForDepth(target.depth);

        window.scrollTo({ top: scrollTarget, behavior: "smooth" });
        return;
      }

      if (event.key === "ArrowUp" && currentDepth < PROJECTS[0].depth) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [smoothProgress],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000,
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const snowCount = 2500;
    const snowPos = new Float32Array(snowCount * 3);
    const snowVel = new Float32Array(snowCount);

    for (let index = 0; index < snowCount; index += 1) {
      snowPos[index * 3] = (Math.random() - 0.5) * 40;
      snowPos[index * 3 + 1] = (Math.random() - 0.5) * 60;
      snowPos[index * 3 + 2] = (Math.random() - 0.5) * 20;
      snowVel[index] = Math.random() * 0.01 + 0.005;
    }

    const snowGeo = new THREE.BufferGeometry();
    const snowAttr = new THREE.BufferAttribute(snowPos, 3);
    snowAttr.setUsage(THREE.DynamicDrawUsage);
    snowGeo.setAttribute("position", snowAttr);
    const snowMat = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xffffff,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    });
    const snowPoints = new THREE.Points(snowGeo, snowMat);
    scene.add(snowPoints);

    const bubbleCount = 180;
    const bubblePos = new Float32Array(bubbleCount * 3);
    const bubbleVel = new Float32Array(bubbleCount);
    const bubbleSway = new Float32Array(bubbleCount);

    for (let index = 0; index < bubbleCount; index += 1) {
      bubblePos[index * 3] = (Math.random() - 0.5) * 30;
      bubblePos[index * 3 + 1] = (Math.random() - 0.5) * 50;
      bubblePos[index * 3 + 2] = (Math.random() - 0.5) * 15;
      bubbleVel[index] = Math.random() * 0.05 + 0.03;
      bubbleSway[index] = Math.random() * 10;
    }

    const bubbleGeo = new THREE.BufferGeometry();
    const bubbleAttr = new THREE.BufferAttribute(bubblePos, 3);
    bubbleAttr.setUsage(THREE.DynamicDrawUsage);
    bubbleGeo.setAttribute("position", bubbleAttr);
    const bubbleMat = new THREE.PointsMaterial({
      size: 0.3,
      color: 0xffffff,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    });
    const bubblePoints = new THREE.Points(bubbleGeo, bubbleMat);
    scene.add(bubblePoints);

    const rayGroup = new THREE.Group();
    const rayMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.03,
      side: THREE.DoubleSide,
    });

    for (let index = 0; index < 3; index += 1) {
      const rayGeo = new THREE.PlaneGeometry(0.8, 40);
      const ray = new THREE.Mesh(rayGeo, rayMat);
      ray.position.set(
        (Math.random() - 0.5) * 15,
        10,
        (Math.random() - 0.5) * 10,
      );
      ray.rotation.z = (Math.random() - 0.5) * 0.3;
      rayGroup.add(ray);
    }

    scene.add(rayGroup);

    // Pre-compile and pre-render once so shader setup happens behind the loader.
    renderer.compile(scene, camera);
    renderer.render(scene, camera);

    const snowPositions = snowAttr.array as Float32Array;
    const bubblePositions = bubbleAttr.array as Float32Array;
    const rays = rayGroup.children as THREE.Mesh[];

    let lastProgress = 0;
    let requestId = 0;
    let warmupFrames = 0;
    let markedSceneReady = false;

    const animate = () => {
      requestId = requestAnimationFrame(animate);

      const progress = smoothProgress.get();
      const velocity = (progress - lastProgress) * 100;
      lastProgress = progress;
      const time = performance.now() * 0.001;

      for (let index = 0; index < snowCount; index += 1) {
        snowPositions[index * 3 + 1] += snowVel[index] + velocity * 0.08;

        if (snowPositions[index * 3 + 1] > 30) {
          snowPositions[index * 3 + 1] = -30;
        } else if (snowPositions[index * 3 + 1] < -30) {
          snowPositions[index * 3 + 1] = 30;
        }
      }
      snowAttr.needsUpdate = true;

      for (let index = 0; index < bubbleCount; index += 1) {
        bubblePositions[index * 3 + 1] += bubbleVel[index] + velocity * 0.35;
        bubblePositions[index * 3] +=
          Math.sin(time * 2 + bubbleSway[index]) * 0.01;

        if (bubblePositions[index * 3 + 1] > 25) {
          bubblePositions[index * 3 + 1] = -25;
        } else if (bubblePositions[index * 3 + 1] < -25) {
          bubblePositions[index * 3 + 1] = 25;
        }
      }
      bubbleAttr.needsUpdate = true;

      snowPoints.position.y = progress * 15;
      bubblePoints.position.y = progress * 25;
      rayGroup.position.y = progress * 8;
      for (let index = 0; index < rays.length; index += 1) {
        const material = rays[index].material as THREE.MeshBasicMaterial;
        material.opacity = Math.max(0, 0.05 - progress * 0.12);
      }

      camera.position.x = Math.sin(time * 0.5) * 0.2;
      camera.rotation.z = Math.sin(time * 0.3) * 0.005;

      renderer.render(scene, camera);

      if (!markedSceneReady) {
        warmupFrames += 1;
        if (warmupFrames >= SCENE_WARMUP_FRAMES) {
          markedSceneReady = true;
          setSceneReady(true);
        }
      }
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(requestId);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      renderer.dispose();
      snowGeo.dispose();
      snowMat.dispose();
      bubbleGeo.dispose();
      bubbleMat.dispose();
      rayMat.dispose();
      rayGroup.children.forEach((child) => {
        const mesh = child as THREE.Mesh;
        mesh.geometry.dispose();
      });
    };
  }, [smoothProgress]);

  const bgGradient = useTransform(
    smoothProgress,
    [0, 0.3, 0.7, 1],
    [
      "linear-gradient(to bottom, #7dd3fc 0%, #0ea5e9 100%)",
      "linear-gradient(to bottom, #0ea5e9 0%, #0c4a6e 100%)",
      "linear-gradient(to bottom, #0c4a6e 0%, #020617 100%)",
      "linear-gradient(to bottom, #020617 0%, #000000 100%)",
    ],
  );

  return (
    <div className="relative w-full overflow-x-hidden text-white selection:bg-white/20">
      <motion.div
        style={{ background: bgGradient }}
        className="fixed inset-0 z-0"
      />
      <div
        ref={containerRef}
        className="pointer-events-none fixed inset-0 z-10"
      />
      <div
        className="relative z-20 pointer-events-none"
        style={{ height: `${SCROLL_FACTOR}vh` }}
      />

      <div className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-between p-6 md:p-16">
        <AnimatePresence>
          {isAtTop ? (
            <motion.div
              initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
              transition={{ duration: 0.45, ease: EASE_SMOOTH }}
              className="pointer-events-none absolute inset-0 mx-auto flex items-center justify-center px-6 text-center"
            >
              <div>
                <h2 className="text-5xl leading-[0.88] tracking-tight text-white uppercase drop-shadow-[0_10px_30px_rgba(0,0,0,0.45)] sm:text-7xl md:text-8xl font-black">
                  My Projects
                </h2>
                <p className="mt-4 text-xs tracking-[0.28em] text-white/80 uppercase md:text-sm font-bold">
                  Scroll down to proceed
                </p>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="absolute top-5 right-4 z-40 flex flex-col items-end gap-2 lg:hidden">
          <div className="rounded-2xl border border-white/25 bg-white/10 p-2.5 shadow-[0_0_20px_rgba(255,255,255,0.08)] backdrop-blur-xl">
            <DepthReadout value={depthValue} />
          </div>
          <div className="h-1 w-24 overflow-hidden rounded-full bg-white/20">
            <motion.div
              className="h-full rounded-full bg-white"
              style={{ width: meterFill }}
            />
          </div>
        </div>

        <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col items-end gap-4 lg:flex lg:right-12">
          <div className="relative h-48 w-px rounded-full bg-white/10 md:h-64 md:w-0.5">
            {PROJECTS.map((project) => (
              <div
                key={`marker-${project.id}`}
                className="absolute right-0 h-0.5 w-2 bg-white/40 md:w-3"
                style={{ top: `${(project.depth / TOTAL_DEPTH) * 100}%` }}
              />
            ))}
            <motion.div
              className="absolute top-0 left-0 w-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.6)]"
              style={{ height: meterFill }}
            />
          </div>
          <DepthReadout value={depthValue} />
        </div>

        <div className="flex flex-1 items-center justify-center p-2">
          <motion.div
            initial={false}
            animate={showProjectCard ? "visible" : "hidden"}
            variants={{
              visible: { opacity: 1, y: 0, filter: "blur(0px)" },
              hidden: { opacity: 0, y: 30, filter: "blur(10px)" },
            }}
            transition={{ duration: 0.5, ease: EASE_SMOOTH }}
            className={`relative w-full max-w-6xl overflow-hidden rounded-[2.5rem] border border-white/30 bg-white/10 p-6 shadow-[0_0_50px_rgba(255,255,255,0.1)] backdrop-blur-3xl will-change-[transform,opacity,filter] md:rounded-[3.5rem] md:p-16 ${showProjectCard ? "pointer-events-auto" : "pointer-events-none"}`}
          >
            <motion.div
              key={`sonar-${activeProject.id}`}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeOut" }}
              className="pointer-events-none absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 md:h-64 md:w-64"
            />

            <div className="relative z-10 flex flex-col items-center gap-8 md:flex-row md:gap-16">
              <div className="flex-1 space-y-4 text-center md:space-y-8 md:text-left">
                <div className="flex items-center justify-center gap-3 md:justify-start md:gap-4">
                  <div className="rounded-xl border border-white/30 bg-white/20 p-3 text-white shadow-inner md:rounded-2xl md:p-4">
                    {activeProject.icon}
                  </div>
                  <div className="hidden h-px flex-1 bg-linear-to-r from-white/40 to-transparent md:block" />
                </div>

                <div>
                  <h2 className="mb-2 text-3xl leading-[0.9] tracking-tighter text-white uppercase drop-shadow-xl sm:text-4xl md:mb-6 md:text-8xl font-black">
                    {activeProject.title}
                  </h2>
                  <p className="text-sm leading-none tracking-tight text-white/60 uppercase italic md:text-2xl font-medium">
                    {activeProject.tagline}
                  </p>
                </div>

                <p className="max-w-2xl text-sm leading-snug text-white/90 md:text-xl md:leading-relaxed font-medium">
                  {activeProject.desc}
                </p>

                <div className="flex flex-wrap justify-center gap-2 pt-2 md:justify-start md:gap-2.5">
                  {activeProject.tech.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-lg border border-white/30 bg-white/20 px-3 py-1 text-[8px] tracking-widest text-white uppercase backdrop-blur-md md:px-5 md:py-2 md:text-[10px] font-bold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex w-full flex-col gap-3 md:w-64 md:gap-4">
                <a
                  href={activeProject.liveUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center justify-between rounded-xl bg-white p-4 text-[10px] text-black uppercase ring-1 ring-white/10 shadow-2xl transition-all hover:bg-white/90 md:rounded-2xl md:p-6 md:text-xs font-black"
                >
                  Live Site
                  <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </a>
                <a
                  href={activeProject.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between rounded-xl border border-white/30 bg-white/10 p-4 text-[10px] text-white uppercase shadow-sm backdrop-blur-md transition-all hover:bg-white/20 md:rounded-2xl md:p-6 md:text-xs font-bold"
                >
                  Source
                  <Box className="h-4 w-4" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
          <AnimatePresence>
            {isAtBottom ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 20 }}
                className="pointer-events-auto"
              >
                <button
                  type="button"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  className="group flex flex-col items-center gap-6 rounded-[3rem] border border-white/40 bg-white/10 px-16 py-12 shadow-[0_0_80px_rgba(255,255,255,0.15)] backdrop-blur-2xl transition-all hover:bg-white/20"
                >
                  <ArrowUp className="h-10 w-10 text-white transition-transform duration-500 ease-out group-hover:-translate-y-2" />
                  <span className="text-2xl tracking-[0.5em] text-white uppercase md:text-4xl font-black">
                    Surface
                  </span>
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <footer className="pointer-events-auto flex items-end justify-between">
          <div className="text-[8px] tracking-widest text-white uppercase opacity-30 md:text-[9px] font-black">
            © 2026 Adorio
          </div>
        </footer>
      </div>

      {isAtTop && !isLoading ? (
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="pointer-events-none fixed bottom-12 left-1/2 z-50 -translate-x-1/2 opacity-50"
        >
          <ChevronDown className="h-5 w-5 text-white" />
        </motion.div>
      ) : null}

      <div className="pointer-events-none fixed inset-0 z-40 opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(255,255,255,0.1)_50%),linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01),rgba(255,255,255,0.02))] bg-size-[100%_2px,3px_100%]" />

      <AnimatePresence>
        {isLoading ? (
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed inset-0 z-80"
          >
            <motion.div
              style={{ background: bgGradient }}
              className="absolute inset-0"
            />
            <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0)_50%,rgba(255,255,255,0.1)_50%),linear-gradient(90deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01),rgba(255,255,255,0.02))] bg-size-[100%_2px,3px_100%]" />

            <div className="relative z-10 flex h-full items-center justify-center p-6 md:p-16">
              <div className="relative w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-white/30 bg-white/10 p-8 shadow-[0_0_50px_rgba(255,255,255,0.1)] backdrop-blur-3xl md:p-12">
                <motion.div
                  animate={{ scale: [0.8, 2.4], opacity: [0.18, 0] }}
                  transition={{
                    duration: 2.4,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  className="pointer-events-none absolute top-1/2 left-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/15"
                />

                <div className="relative z-10 text-center md:text-left">
                  <p className="text-[10px] tracking-[0.35em] text-white/75 uppercase md:text-xs font-bold">
                    Project Chamber
                  </p>
                  <h2 className="mt-3 text-4xl leading-[0.9] tracking-tight text-white uppercase md:text-6xl font-black">
                    Diving In
                  </h2>
                  <p className="mt-3 max-w-xl text-sm text-white/80 md:text-base font-medium">
                    Preparing depth telemetry, motion layers, and project
                    panels.
                  </p>

                  <div className="mt-8">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
                      <motion.div
                        className="h-full rounded-full bg-white"
                        animate={{ width: `${Math.round(loadingProgress)}%` }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-white/80 uppercase md:text-xs font-bold tracking-widest">
                      <span>Loading</span>
                      <span>{Math.round(loadingProgress)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
