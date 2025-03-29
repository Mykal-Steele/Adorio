import { useState, useEffect, useRef, useCallback } from "react";
import {
  SparklesIcon,
  MusicalNoteIcon,
  KeyIcon,
  TrophyIcon,
  FireIcon,
  CheckBadgeIcon,
  HeartIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  fetchLeaderboard,
  updateScore,
  fetchUserGameStats,
} from "../api/gameApi";

const RyGame = () => {
  const timerEventRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const gameLoopRef = useRef(null);
  const [message, setMessage] = useState("Loading...");
  const [gameIsActive, setGameIsActive] = useState(false);
  const [pLevel, setPLevel] = useState(0);
  const [highPLevel, setHighPLevel] = useState(0);
  const [maxPLevel, setMaxPLevel] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [achievements, setAchievements] = useState({
    firstPlay: false,
    reach10PLevel: false,
    reach25PLevel: false,
    reach50PLevel: false,
  });
  const [showAchievement, setShowAchievement] = useState(null);
  const [difficulty, setDifficulty] = useState("normal");
  const [hitEffects, setHitEffects] = useState([]);
  const [gameOverMessage, setGameOverMessage] = useState("");
  const [showGameOverScreen, setShowGameOverScreen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  axios.defaults.baseURL =
    window.VITE_BACKEND_URL || "https://feelio-github-io.onrender.com";
  // Game constants and refs
  const game = useRef({
    messageHeight: 50,
    canvasWidth: 650,
    canvasHeight: 400,
    songDuration: 203,
    lineTaper: 1.7,
    lineHeight: 3,
    numberOfColumns: 8,
    dotMaximumRadius: 14,
    destinationMaximumRadius: 20,
    pulsationAmplitude: 3,
    rockingAmplitude: 0.15,
    destinationKeyCodeSet: [
      81, 87, 69, 82, 85, 73, 79, 80, 65, 83, 68, 70, 74, 75, 76, 186,
    ],
    hitEffects: [],
    debugMode: false,
    context: null,
    audioHasLoaded: false,
    audioCurrentTime: 0,
    tempo: 1.89,
    hasStartedPulsating: false,
    hasIncreasedSpeed: false,
    hasStartedRainbow: false,
    rainbowColorIndexOffset: 0,
    hasStartedWhiteForeground: false,
    hasStartedRainbowBackground: false,
    backgroundColorIndex: 0,
    hasStartedRocking: false,
    rockingOffset: 0,
    audioTimeOffset: -0.04,
    advanceToggle: false,
    numberOfAdvancesUntilRest: 0,
    dotList: [],
    linePosList: [],
    dotRadius: 11,
    destinationRadius: 17,
    lastHitTime: 0,
  }).current;

  class Color {
    constructor(r, g, b, a = 1) {
      this.r = r;
      this.g = g;
      this.b = b;
      this.a = a;
    }
    toString() {
      return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
    }
  }

  // Updated colors with better contrast
  const colors = {
    defaultLeftColor: new Color(176, 61, 254, 0.95), // brighter purple with more opacity
    defaultRightColor: new Color(99, 90, 255, 0.95), // brighter indigo with more opacity
    rainbowLeftColorSet: [
      new Color(212, 152, 255, 0.95), // brighter purple
      new Color(233, 120, 248, 0.95), // brighter fuchsia
      new Color(254, 108, 208, 0.95), // brighter pink
      new Color(255, 40, 148, 0.95), // brighter vivid pink
    ],
    rainbowRightColorSet: [
      new Color(149, 160, 255, 0.95), // brighter indigo
      new Color(116, 185, 255, 0.95), // brighter blue
      new Color(76, 209, 255, 0.95), // brighter light blue
      new Color(54, 231, 255, 0.95), // brighter cyan
    ],
    blackColor: new Color(15, 23, 42, 0.95),
    whiteColor: new Color(240, 245, 255, 0.95), // brighter white
    backgroundColorSet: [
      new Color(9, 14, 26, 0.97), // darker slate for better contrast
      new Color(91, 33, 182, 0.4),
      new Color(67, 56, 202, 0.4),
      new Color(37, 99, 235, 0.4),
      new Color(147, 51, 234, 0.4),
      new Color(79, 70, 229, 0.4),
      new Color(59, 130, 246, 0.4),
    ],
    hitEffects: [
      new Color(201, 122, 255, 1),
      new Color(123, 156, 255, 1),
      new Color(255, 122, 224, 1),
    ],
  };

  class Pos {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
  }

  class HitEffect {
    constructor(x, y, color) {
      this.x = x;
      this.y = y;
      this.color = color;
      this.startTime = Date.now();
      this.duration = 150; // keeping this short for snappier feel
      this.maxSize = 30;
    }

    draw(ctx) {
      const elapsed = Date.now() - this.startTime;
      const progress = Math.min(elapsed / this.duration, 1);

      // bail if animation done
      if (progress >= 1) return true;

      // single save for performance
      ctx.save();

      // simplified effect for performance
      // solid circle that fades out
      const centerOpacity = Math.max(0.7, 1 - progress * 1.5);
      ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${centerOpacity})`;
      ctx.beginPath();
      ctx.arc(
        this.x,
        this.y,
        game.dotRadius * (1 - progress * 0.5),
        0,
        2 * Math.PI
      );
      ctx.fill();

      // expanding ring that fades out
      const size = this.maxSize * progress;
      const opacity = 1 - progress;

      // colorful ring with thin line
      ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${
        this.color.b
      }, ${opacity * 0.7})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, size, 0, 2 * Math.PI);
      ctx.stroke();

      // simpler particles for better fps
      ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${
        this.color.b
      }, ${opacity * 0.5})`;

      // just 4 particles - tried 6 but was too laggy
      const particleCount = 4;
      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount + progress * Math.PI;
        const distance = size * 0.6;
        const particleX = this.x + Math.cos(angle) * distance;
        const particleY = this.y + Math.sin(angle) * distance;
        const particleSize = 3 * (1 - progress);

        ctx.beginPath();
        ctx.arc(particleX, particleY, particleSize, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.restore();
      return false;
    }
  }

  class Dot {
    constructor(lineIndex) {
      this.lineIndex = lineIndex;
      this.linePosY = 0;
      this.createdAt = Date.now();
      this.isHit = false; // flag for hit dots so we can animate them out
      this.hitTime = 0; // when was the dot hit
      game.dotList.push(this);
    }

    remove() {
      const index = game.dotList.findIndex((dot) => dot === this);
      if (index !== -1) {
        game.dotList.splice(index, 1);
      }
    }

    draw() {
      // skip drawing if the dot's fade-out is done
      if (this.isHit && Date.now() - this.hitTime > 100) {
        return;
      }

      setContextColorByColumn(this.lineIndex % game.numberOfColumns);
      let tempOffset;
      if (this.lineIndex >= game.numberOfColumns) {
        tempOffset =
          (this.lineIndex - game.numberOfColumns) * (game.lineHeight + 1) * 2 +
          game.lineHeight +
          1;
      } else {
        tempOffset = this.lineIndex * (game.lineHeight + 1) * 2;
      }
      const tempPos = game.linePosList[tempOffset + this.linePosY];

      // fade out hit dots
      if (this.isHit) {
        const elapsed = Date.now() - this.hitTime;
        const opacity = Math.max(0, 1 - elapsed / 100);

        game.context.save();
        game.context.globalAlpha = opacity;
      }

      // glow behind dot so it pops more
      game.context.save();
      game.context.shadowBlur = 15;
      game.context.shadowColor = game.context.fillStyle;
      drawSolidCircle(tempPos, game.dotRadius);
      game.context.restore();

      // white outline for better contrast
      game.context.save();
      game.context.strokeStyle = "rgba(255, 255, 255, 0.7)";
      game.context.lineWidth = 1;
      drawCircleOutline(tempPos, game.dotRadius + 1);
      game.context.restore();

      // restore opacity for hit dots
      if (this.isHit) {
        game.context.restore();
      }
    }

    advance() {
      if (this.linePosY >= game.lineHeight) {
        if (game.debugMode) {
          this.remove();
          return true;
        } else {
          setGameOverMessage(`You missed a dot! Final P-Level: ${pLevel}`);
          setPLevel(0);
          setShowGameOverScreen(true);
          stopGame();
          checkHighPLevel();
          return false;
        }
      } else {
        this.linePosY += 1;
        return true;
      }
    }

    getPosition() {
      let tempOffset;
      if (this.lineIndex >= game.numberOfColumns) {
        tempOffset =
          (this.lineIndex - game.numberOfColumns) * (game.lineHeight + 1) * 2 +
          game.lineHeight +
          1;
      } else {
        tempOffset = this.lineIndex * (game.lineHeight + 1) * 2;
      }
      return game.linePosList[tempOffset + this.linePosY];
    }
  }

  const setContextColor = (color) => {
    game.context.fillStyle = color.toString();
    game.context.strokeStyle = color.toString();
  };

  const setContextColorByColumn = (column) => {
    let tempColor;
    if (column < game.numberOfColumns / 2) {
      if (game.hasStartedRainbow) {
        const index =
          (column + game.numberOfColumns / 2 - game.rainbowColorIndexOffset) %
          (game.numberOfColumns / 2);
        tempColor = colors.rainbowLeftColorSet[index];
      } else {
        tempColor = colors.defaultLeftColor;
      }
    } else {
      if (game.hasStartedRainbow) {
        const index =
          (column + game.rainbowColorIndexOffset) % (game.numberOfColumns / 2);
        tempColor = colors.rainbowRightColorSet[index];
      } else {
        tempColor = colors.defaultRightColor;
      }
    }
    if (game.hasStartedWhiteForeground) {
      tempColor = colors.whiteColor;
    }
    setContextColor(tempColor);
  };

  const drawLine = (pos1, pos2) => {
    game.context.beginPath();
    game.context.moveTo(Math.floor(pos1.x), Math.floor(pos1.y));
    game.context.lineTo(Math.floor(pos2.x), Math.floor(pos2.y));
    game.context.stroke();
  };

  const updateLinePosList = () => {
    let index = 0;
    let tempColumn = 0;
    const totalLineHeight = game.lineHeight * 2 + 3;

    while (tempColumn < game.numberOfColumns) {
      let tempPosX1;
      if (tempColumn < game.numberOfColumns / 2) {
        tempPosX1 =
          (tempColumn + 0.5) *
          (game.canvasWidth / (game.numberOfColumns + 0.5));
      } else {
        tempPosX1 =
          (tempColumn + 1.0) *
          (game.canvasWidth / (game.numberOfColumns + 0.5));
      }

      const tempPosX2 =
        (tempPosX1 - game.canvasWidth / 2) /
          (game.lineTaper - game.rockingOffset) +
        game.canvasWidth / 2;

      // Draw upper lines
      let tempLinePosY = 0;
      while (tempLinePosY <= game.lineHeight) {
        const tempPos = game.linePosList[index];
        index += 1;
        tempPos.x =
          ((tempPosX2 - tempPosX1) * tempLinePosY) / game.lineHeight +
          tempPosX1;
        tempPos.y = ((1 + tempLinePosY) * game.canvasHeight) / totalLineHeight;
        tempLinePosY += 1;
      }

      // Draw lower lines
      tempLinePosY = 0;
      while (tempLinePosY <= game.lineHeight) {
        const tempPos = game.linePosList[index];
        index += 1;
        tempPos.x =
          ((tempPosX2 - tempPosX1) * tempLinePosY) / game.lineHeight +
          tempPosX1;
        tempPos.y =
          ((2 + 2 * game.lineHeight - tempLinePosY) * game.canvasHeight) /
          totalLineHeight;
        tempLinePosY += 1;
      }
      tempColumn += 1;
    }
  };

  const drawText = (pos, text) => {
    if (game.hasStartedWhiteForeground) {
      setContextColor(colors.whiteColor);
    } else {
      setContextColor(colors.whiteColor);
    }
    // in the drawText function
    // draw text shadow for better visibility
    game.context.save();
    game.context.shadowOffsetX = 2;
    game.context.shadowOffsetY = 2;
    game.context.shadowBlur = 3;
    game.context.shadowColor = "rgba(0, 0, 0, 0.7)";
    game.context.fillText(text, pos.x, pos.y);
    game.context.restore();
  };

  const drawMessage = () => {
    const messagePos = new Pos(game.messageHeight / 2, game.messageHeight / 2);
    drawText(messagePos, message);
  };

  const drawSolidCircle = (pos, radius) => {
    game.context.beginPath();
    game.context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    game.context.fill();
  };

  const drawCircleOutline = (pos, radius) => {
    game.context.beginPath();
    game.context.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
    game.context.stroke();
  };

  const getDot = (lineIndex, linePosY) => {
    return game.dotList.find(
      (dot) => dot.lineIndex === lineIndex && dot.linePosY === linePosY
    );
  };

  const drawAllDots = () => {
    game.dotList.forEach((dot) => dot.draw());
  };

  // Create a hit effect at a specific position
  const createHitEffect = (pos, colorIndex) => {
    if (!game.hitEffects) game.hitEffects = [];
    const color = colors.hitEffects[colorIndex % colors.hitEffects.length];
    const newEffect = new HitEffect(pos.x, pos.y, color);

    game.hitEffects.push(newEffect);
  };

  // Draw all active hit effects
  const drawHitEffects = () => {
    if (!game.hitEffects || game.hitEffects.length === 0) return;

    game.hitEffects = game.hitEffects.filter((effect) => {
      return !effect.draw(game.context);
    });
  };

  const advanceAllDots = () => {
    game.numberOfAdvancesUntilRest -= 1;

    if (!game.debugMode) {
      for (const dot of game.dotList) {
        if (dot.linePosY >= game.lineHeight) {
          setGameOverMessage(`You missed a dot! Final P-Level: ${pLevel}`);
          setPLevel(0);
          setShowGameOverScreen(true);
          stopGame();
          checkHighPLevel();
          return false;
        }
      }
    }

    for (let i = game.dotList.length - 1; i >= 0; i--) {
      if (!game.dotList[i].advance()) {
        return false;
      }
    }
    return true;
  };

  const createDot = () => {
    for (let i = 0; i < 100; i++) {
      const tempColumn = Math.floor(Math.random() * game.numberOfColumns);
      if (
        !getDot(tempColumn, 0) &&
        !getDot(tempColumn + game.numberOfColumns, 0)
      ) {
        new Dot(
          tempColumn + Math.floor(Math.random() * 2) * game.numberOfColumns
        );
        return;
      }
    }
  };

  const createDots = () => {
    const tempProgress = game.audioCurrentTime / game.songDuration;
    let tempCount;

    // Adjust dot creation rate based on difficulty
    let difficultyMultiplier = 1;
    if (difficulty === "easy") difficultyMultiplier = 0.7;
    if (difficulty === "hard") difficultyMultiplier = 1.3;

    if (game.audioCurrentTime < game.songDuration - 3) {
      if (game.numberOfAdvancesUntilRest < 0) {
        tempCount = 0;
        game.numberOfAdvancesUntilRest =
          2 + Math.floor(Math.random() * (4 + 8 * tempProgress));
      } else {
        tempCount =
          1 +
          Math.floor(
            Math.random() * (0.7 + 2.3 * tempProgress) * difficultyMultiplier
          );
      }
    } else {
      tempCount = 0;
    }

    while (tempCount > 0) {
      createDot();
      tempCount--;
    }
  };

  // Load high P-Level from local storage
  useEffect(() => {
    const savedHighPLevel = localStorage.getItem("rhythmDotsHighPLevel");
    if (savedHighPLevel) {
      setHighPLevel(parseInt(savedHighPLevel));
    }

    const savedAchievements = localStorage.getItem("rhythmDotsAchievements");
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }

    // Check if this is the first visit to show tutorial
    const firstVisit = localStorage.getItem("rhythmDotsFirstVisit");
    if (!firstVisit) {
      setShowTutorial(true);
      localStorage.setItem("rhythmDotsFirstVisit", "false");
    }
  }, []);

  // Function to update user's peak P-Level
  const fetchLeaderboardData = useCallback(async () => {
    try {
      setIsLoadingLeaderboard(true);
      const data = await fetchLeaderboard();
      setLeaderboard(data);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setLeaderboard([]);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, []);

  // Ensure the leaderboard loads on mount, not conditionally
  useEffect(() => {
    fetchLeaderboardData();

    // Set up a refresh interval for real-time updates
    const refreshInterval = setInterval(() => {
      fetchLeaderboardData();
    }, 60000); // Refresh every minute

    return () => clearInterval(refreshInterval);
  }, [fetchLeaderboardData]);

  const updateUserScore = useCallback(
    async (score, difficulty) => {
      try {
        const response = await updateScore(score, difficulty);

        if (!response.anonymous) {
          // Only update UI if it's an authenticated user
          setCurrentUser((prev) => ({
            ...prev,
            rhythmGame: {
              ...prev?.rhythmGame,
              peakPLevel: score,
              difficulty,
            },
          }));
        }

        // Always update the leaderboard after a score update
        fetchLeaderboardData();
      } catch (error) {
        console.error("Failed to update score:", error);
      }
    },
    [fetchLeaderboardData]
  );

  // Check for and save high P-Level
  const checkHighPLevel = useCallback(() => {
    if (maxPLevel > highPLevel) {
      setHighPLevel(maxPLevel);
      localStorage.setItem("rhythmDotsHighPLevel", maxPLevel.toString());

      // Update server with new high score if logged in
      if (currentUser) {
        updateUserScore(maxPLevel, difficulty);
      }

      return true;
    }
    return false;
  }, [maxPLevel, highPLevel, currentUser, updateUserScore, difficulty]);

  // Check for achievements
  const checkAchievements = useCallback(() => {
    const newAchievements = { ...achievements };
    let achievementUnlocked = null;

    // First play achievement
    if (!newAchievements.firstPlay) {
      newAchievements.firstPlay = true;
      achievementUnlocked = {
        name: "First Play",
        description: "Started your rhythm journey",
        icon: <SparklesIcon className="h-6 w-6 text-yellow-300" />,
      };
    }

    // P-Level achievements
    if (!newAchievements.reach10PLevel && pLevel >= 10) {
      newAchievements.reach10PLevel = true;
      achievementUnlocked = {
        name: "Beginner",
        description: "Reached P-Level 10",
        icon: <CheckBadgeIcon className="h-6 w-6 text-blue-400" />,
      };
    }

    if (!newAchievements.reach25PLevel && pLevel >= 25) {
      newAchievements.reach25PLevel = true;
      achievementUnlocked = {
        name: "Getting Good",
        description: "Reached P-Level 25",
        icon: <TrophyIcon className="h-6 w-6 text-purple-400" />,
      };
    }

    if (!newAchievements.reach50PLevel && pLevel >= 50) {
      newAchievements.reach50PLevel = true;
      achievementUnlocked = {
        name: "Rhythm Master",
        description: "Reached P-Level 50!",
        icon: <FireIcon className="h-6 w-6 text-amber-500" />,
      };
    }

    if (achievementUnlocked) {
      setAchievements(newAchievements);
      localStorage.setItem(
        "rhythmDotsAchievements",
        JSON.stringify(newAchievements)
      );
      setShowAchievement(achievementUnlocked);

      // Hide achievement notification after 3 seconds
      setTimeout(() => {
        setShowAchievement(null);
      }, 3000);
    }
  }, [achievements, pLevel]);

  // Generate quests based on player skill level
  const generateSkillBasedQuests = useCallback(() => {
    const baseQuests = [
      { goal: 5, description: "Reach P-Level 5", completed: false },
    ];

    // For better players, generate more challenging quests
    if (highPLevel > 10) {
      const advancedQuest = {
        goal: Math.min(Math.max(Math.floor(highPLevel * 0.7), 8), 25),
        description: `Reach P-Level ${Math.min(
          Math.max(Math.floor(highPLevel * 0.7), 8),
          25
        )}`,
        completed: false,
      };
      baseQuests.push(advancedQuest);
    }

    if (highPLevel > 20) {
      const expertQuest = {
        goal: Math.min(Math.max(Math.floor(highPLevel * 0.9), 15), 40),
        description: `Reach P-Level ${Math.min(
          Math.max(Math.floor(highPLevel * 0.9), 15),
          40
        )}`,
        completed: false,
      };
      baseQuests.push(expertQuest);
    }

    return baseQuests[Math.floor(Math.random() * baseQuests.length)];
  }, [highPLevel]);

  // Memoize the game-related functions
  const startGame = useCallback(() => {
    if (audioRef.current && game.audioHasLoaded) {
      audioRef.current.play();
      setGameIsActive(true);
      setMessage(""); // Empty message instead of showing P-Level
      setShowGameOverScreen(false);

      // Trigger first play achievement if it's the player's first time
      if (!achievements.firstPlay) {
        const newAchievements = { ...achievements, firstPlay: true };
        setAchievements(newAchievements);
        localStorage.setItem(
          "rhythmDotsAchievements",
          JSON.stringify(newAchievements)
        );

        setShowAchievement({
          name: "First Play",
          description: "Started your rhythm journey",
          icon: <SparklesIcon className="h-6 w-6 text-yellow-300" />,
        });

        // Hide after 3 seconds
        setTimeout(() => {
          setShowAchievement(null);
        }, 3000);
      }
    }
  }, [game.audioHasLoaded, pLevel, achievements]);

  const stopGame = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setGameIsActive(false);
    }
  }, []);

  const resetGame = useCallback(() => {
    setGameIsActive(false);
    setPLevel(0);
    setMaxPLevel(0);
    setHitEffects([]);
    game.audioCurrentTime = 0;
    game.tempo = 1.89;
    game.hasStartedPulsating = false;
    game.hasIncreasedSpeed = false;
    game.hasStartedRainbow = false;
    game.rainbowColorIndexOffset = 0;
    game.hasStartedWhiteForeground = false;
    game.hasStartedRainbowBackground = false;
    game.backgroundColorIndex = 0;
    game.hasStartedRocking = false;
    game.rockingOffset = 0;
    game.audioTimeOffset = -0.04;
    game.advanceToggle = false;
    game.numberOfAdvancesUntilRest = 0;
    game.dotList = [];
    game.hitEffects = [];
    updateLinePosList();
  }, []);

  const resetAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const resetGameAndAudio = useCallback(() => {
    resetGame();
    resetAudio();
  }, [resetGame, resetAudio]);

  const handleKeyDownEvent = useCallback(
    (event) => {
      let keyCode = event.which;
      if (keyCode === 59) keyCode = 186; // Firefox fix

      if (keyCode === 27) {
        // Escape
        setMessage("Press space to play!");
        stopGame();
        resetGameAndAudio();
        setShowGameOverScreen(false);
        return;
      }

      if (keyCode === 32) {
        // Space
        event.preventDefault(); // Prevent default space bar behavior
        if (game.audioHasLoaded && !gameIsActive) {
          resetGameAndAudio();
          startGame();
        }
        return;
      }

      if (gameIsActive) {
        const keyIndex = game.destinationKeyCodeSet.indexOf(keyCode);
        if (keyIndex !== -1) {
          const tempDot = getDot(keyIndex, game.lineHeight);
          if (!tempDot) {
            if (!game.debugMode) {
              setGameOverMessage(
                `You pressed the wrong key! Final P-Level: ${pLevel}`
              );
              setPLevel(0);
              setShowGameOverScreen(true);
              stopGame();
              checkHighPLevel();
            }
          } else {
            // Get dot position for hit effect
            const dotPos = tempDot.getPosition();

            // Create hit effect
            const colorIndex = Math.floor(
              Math.random() * colors.hitEffects.length
            );
            createHitEffect(dotPos, colorIndex);

            // Mark dot as hit but don't remove it yet - let it fade out
            tempDot.isHit = true;
            tempDot.hitTime = Date.now();

            // Remove dot after animation completes - match to hit effect duration
            setTimeout(() => {
              if (tempDot) tempDot.remove();
            }, 100); // Changed to 100ms for snappier response

            // Update streak
            setPLevel((prev) => {
              const newPLevel = prev + 1;
              setMaxPLevel((current) => Math.max(current, newPLevel));
              return newPLevel;
            });

            // Save last hit time for animations
            game.lastHitTime = Date.now();

            // Check achievements after score update - using timeout to batch updates
            requestAnimationFrame(() => {
              checkAchievements();
            });
          }
        }
      }
    },
    [
      game.audioHasLoaded,
      gameIsActive,
      startGame,
      stopGame,
      resetGameAndAudio,
      pLevel,
      checkHighPLevel,
      checkAchievements,
    ]
  );

  const gameLoop = useCallback(() => {
    if (!gameIsActive || !game.context) return;

    // update audio time each frame
    if (audioRef.current && game.audioHasLoaded) {
      game.audioCurrentTime = audioRef.current.currentTime;
      const tempTime = game.audioCurrentTime - game.audioTimeOffset;

      // check where we are in the music
      const tempMeasure = tempTime / game.tempo;

      // visual effects based on music progress
      if (tempMeasure >= 4 && !game.hasStartedPulsating) {
        game.hasStartedPulsating = true;
      }
      if (tempMeasure >= 12 && !game.hasIncreasedSpeed) {
        game.audioTimeOffset += 12 * game.tempo;
        game.tempo = (114.25 - 22.72) / 61;
        game.hasIncreasedSpeed = true;
      }
      if (tempMeasure >= 24 && tempMeasure < 30 && !game.hasStartedRainbow) {
        game.hasStartedRainbow = true;
      }
      if (tempMeasure >= 61 && !game.hasStartedWhiteForeground) {
        game.hasStartedRainbow = false;
        game.hasStartedWhiteForeground = true;
      }
      if (tempMeasure >= 77 && !game.hasStartedRainbowBackground) {
        game.hasStartedRainbowBackground = true;
      }
      if (tempMeasure >= 99 && !game.hasStartedRocking) {
        game.hasStartedRocking = true;
      }

      // dot movement synced to music
      if ((tempTime / (game.tempo / 4)) % 2 < 1) {
        if (!game.advanceToggle) {
          if (advanceAllDots()) {
            createDots();
          }
          game.advanceToggle = true;
        }
      } else {
        game.advanceToggle = false;
      }

      // visual effects
      let tempOffset;
      if (game.hasStartedPulsating) {
        const tempNumber =
          1 - Math.sin(((tempTime / (game.tempo / 4)) % 1) * Math.PI);
        tempOffset = game.pulsationAmplitude * (1 - tempNumber * tempNumber);
      } else {
        tempOffset = game.pulsationAmplitude;
      }
      game.dotRadius = game.dotMaximumRadius - tempOffset;
      game.destinationRadius = game.destinationMaximumRadius - tempOffset;

      if (game.hasStartedRainbow) {
        game.rainbowColorIndexOffset = Math.floor(
          (tempTime / (game.tempo / 4)) % (game.numberOfColumns / 2)
        );
      }
      if (game.hasStartedRainbowBackground) {
        game.backgroundColorIndex =
          1 +
          Math.floor(
            (tempTime / (game.tempo / 2)) %
              (colors.backgroundColorSet.length - 1)
          );
      }
      if (game.hasStartedRocking) {
        const tempNumber =
          1 - Math.sin(((tempTime / (game.tempo / 4)) % 1) * Math.PI);
        game.rockingOffset = game.rockingAmplitude * tempNumber * tempNumber;
        updateLinePosList();
      }
    }

    // fast frame drawing - all in one go
    const ctx = game.context;

    // fill bg instead of clear - way faster
    const bgColor = game.hasStartedWhiteForeground
      ? colors.backgroundColorSet[game.backgroundColorIndex]
      : colors.backgroundColorSet[0];

    ctx.save();
    setContextColor(bgColor);
    ctx.fillRect(0, 0, game.canvasWidth, game.canvasHeight);

    // grid pattern in bg
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    ctx.lineWidth = 1;

    // bigger grid = better fps
    const gridSize = 30;
    for (let x = 0; x <= game.canvasWidth; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, game.canvasHeight);
      ctx.stroke();
    }

    for (let y = 0; y <= game.canvasHeight; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(game.canvasWidth, y);
      ctx.stroke();
    }

    // score display
    setMessage(""); // Empty message instead of showing P-Level
    drawMessage();

    // draw the main game elements
    ctx.lineWidth = 3;
    ctx.shadowBlur = 12;
    ctx.shadowColor = "rgba(139, 92, 246, 0.7)";

    for (let i = 0; i < game.numberOfColumns; i++) {
      setContextColorByColumn(i);
      const tempOffset = i * (game.lineHeight + 1) * 2;

      // left side lines
      const leftPos1 = game.linePosList[tempOffset];
      const leftPos2 = game.linePosList[tempOffset + game.lineHeight];
      drawLine(leftPos1, leftPos2);

      ctx.lineWidth = 3;
      drawCircleOutline(leftPos2, game.destinationRadius);

      // right side lines
      const rightPos1 = game.linePosList[tempOffset + game.lineHeight + 1];
      const rightPos2 = game.linePosList[tempOffset + 2 * game.lineHeight + 1];
      drawLine(rightPos1, rightPos2);

      ctx.lineWidth = 3;
      drawCircleOutline(rightPos2, game.destinationRadius);
    }

    // effects and dots - these are fps critical
    drawHitEffects();
    drawAllDots();

    ctx.restore();

    // keep the loop going
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameIsActive, pLevel]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(game.canvasWidth * dpr);
    canvas.height = Math.floor(game.canvasHeight * dpr);
    canvas.style.width = `${game.canvasWidth}px`;
    canvas.style.height = `${game.canvasHeight}px`;

    const ctx = canvas.getContext("2d", { alpha: false });
    ctx.scale(dpr, dpr);
    game.context = ctx;
    ctx.font = "bold 16px Inter, system-ui, sans-serif";
    ctx.lineWidth = 3;
    ctx.strokeStyle = colors.blackColor.toString();
    ctx.imageSmoothingEnabled = true;

    // Initialize line positions once
    const linePosList = [];
    for (let i = 0; i < game.numberOfColumns; i++) {
      for (let j = 0; j <= game.lineHeight; j++) {
        linePosList.push(new Pos(0, 0), new Pos(0, 0));
      }
    }
    game.linePosList = linePosList;
    updateLinePosList();

    // Add event listeners
    window.addEventListener("keydown", handleKeyDownEvent);

    // Start game loop
    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener("keydown", handleKeyDownEvent);
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [handleKeyDownEvent, gameLoop]);

  // Create key-to-note mapping for visualization
  const keyMap = [
    ["Q", "W", "E", "R", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "J", "K", "L", ";"],
  ];

  // Daily quest - generate a random goal every day
  const [dailyQuest, setDailyQuest] = useState(null);

  useEffect(() => {
    // Generate daily quest based on date
    const today = new Date().toDateString();
    const savedQuest = localStorage.getItem("rhythmDotsDailyQuest");
    const savedQuestDate = localStorage.getItem("rhythmDotsDailyQuestDate");

    if (savedQuestDate === today && savedQuest) {
      setDailyQuest(JSON.parse(savedQuest));
    } else {
      // Generate new quest based on player skill
      const newQuest = generateSkillBasedQuests();
      setDailyQuest(newQuest);

      localStorage.setItem("rhythmDotsDailyQuest", JSON.stringify(newQuest));
      localStorage.setItem("rhythmDotsDailyQuestDate", today);
    }
  }, [generateSkillBasedQuests]);

  // Check if daily quest is completed
  useEffect(() => {
    if (!dailyQuest || dailyQuest.completed) return;

    let completed = false;

    if (
      dailyQuest.description.includes("P-Level") &&
      pLevel >= dailyQuest.goal
    ) {
      completed = true;
    } else if (
      dailyQuest.description.includes("streak") &&
      maxPLevel >= dailyQuest.goal
    ) {
      completed = true;
    }

    if (completed) {
      const updatedQuest = { ...dailyQuest, completed: true };
      setDailyQuest(updatedQuest);
      localStorage.setItem(
        "rhythmDotsDailyQuest",
        JSON.stringify(updatedQuest)
      );

      setShowAchievement({
        name: "Daily Quest Complete!",
        description: dailyQuest.description,
        icon: <CheckBadgeIcon className="h-6 w-6 text-green-400" />,
      });

      setTimeout(() => {
        setShowAchievement(null);
      }, 3000);
    }
  }, [pLevel, maxPLevel, dailyQuest]);

  // Check if we need to update the user's score when the game ends
  useEffect(() => {
    // When game over screen is shown, update user score if it's a new personal best
    if (
      showGameOverScreen &&
      maxPLevel > (currentUser?.rhythmGame?.peakPLevel || 0)
    ) {
      updateUserScore(maxPLevel, difficulty);
    }
  }, [showGameOverScreen, maxPLevel, difficulty, currentUser, updateUserScore]);

  // Get current user on mount
  useEffect(() => {
    const getUserGameStats = async () => {
      try {
        const gameStats = await fetchUserGameStats();

        if (!gameStats.anonymous) {
          // Set high score from database instead of local storage
          setHighPLevel(gameStats.peakPLevel || 0);

          // Also update the current user state
          const token = localStorage.getItem("token");
          if (token) {
            try {
              const response = await axios.get("/api/users/me", {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (response.data) {
                setCurrentUser(response.data);
              }
            } catch (error) {
              // Don't show as error - this is expected when not logged in
              console.log("Not logged in or error fetching user");
            }
          }
        } else {
          // Fallback to local storage for guests
          const savedHighPLevel = localStorage.getItem("rhythmDotsHighPLevel");
          if (savedHighPLevel) {
            setHighPLevel(parseInt(savedHighPLevel));
          }
        }
      } catch (error) {
        console.error("Error fetching game stats:", error);
        // Fallback to local storage
        const savedHighPLevel = localStorage.getItem("rhythmDotsHighPLevel");
        if (savedHighPLevel) {
          setHighPLevel(parseInt(savedHighPLevel));
        }
      }
    };

    getUserGameStats();
  }, []);

  // When rendering the leaderboard, add additional safety checks
  const renderLeaderboard = useCallback(() => {
    if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-400">No scores yet. Be the first!</p>
        </div>
      );
    }

    return leaderboard.map((player, index) => {
      // Add safety checks to handle potentially undefined values
      if (!player) return null;

      return (
        <div
          key={player._id || `player-${index}`}
          className={`p-3 rounded-lg border ${
            currentUser?.username === player?.username
              ? "border-purple-500/30 bg-purple-900/10"
              : index === 0
              ? "border-amber-500/20 bg-amber-900/5"
              : "border-gray-700/30"
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span
                className={`text-xs font-medium ${
                  index === 0 ? "text-amber-400" : "text-gray-400"
                }`}
              >
                #{index + 1}
              </span>
              <span className="ml-2 text-sm text-gray-200 truncate max-w-[120px]">
                {player?.username || "Anonymous"}
                {currentUser?.username === player?.username && (
                  <span className="text-xs text-purple-400 ml-1">(you)</span>
                )}
              </span>
            </div>
            <div className="flex items-center">
              <span
                className={`text-sm font-bold ${
                  player?.rhythmGame?.peakPLevel >= 50
                    ? "text-amber-400"
                    : player?.rhythmGame?.peakPLevel >= 25
                    ? "text-purple-400"
                    : "text-blue-400"
                }`}
              >
                {player?.rhythmGame?.peakPLevel || 0}
              </span>
              <span className="ml-2 text-xs bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">
                {player?.rhythmGame?.difficulty || "normal"}
              </span>
            </div>
          </div>
        </div>
      );
    });
  }, [leaderboard, currentUser]);

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col md:flex-row">
      {/* Main Game Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative bg-gray-900/80 backdrop-blur-md border border-gray-800/50 rounded-2xl p-6 w-full max-w-4xl text-center space-y-6 shadow-lg">
          {/* Animated title with proper text visibility */}
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="relative">
              <SparklesIcon className="h-8 w-8 text-purple-400 animate-pulse" />
              <div className="absolute inset-0 bg-purple-500 blur-xl opacity-20 rounded-full"></div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-300 to-purple-400">
              RHYTHM DOTS
            </h1>
            <div className="relative">
              <MusicalNoteIcon className="h-8 w-8 text-blue-400 animate-pulse" />
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 rounded-full"></div>
            </div>
          </div>

          {/* Game status indicator */}
          <div className="absolute top-6 right-6 flex items-center">
            <div
              className={`h-3 w-3 rounded-full ${
                gameIsActive ? "bg-green-400 animate-pulse" : "bg-red-400"
              } mr-2`}
            ></div>
            <span className="text-xs text-gray-400">
              {gameIsActive ? "Playing" : "Ready"}
            </span>
          </div>

          {/* Updated left sidebar to show only necessary information */}
          <div className="absolute top-6 left-6 flex flex-col gap-2 z-30">
            <div
              className="bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-gray-700/30"
              style={{
                minWidth:
                  Math.max(100, 20 + String(highPLevel).length * 10) + "px",
              }}
            >
              <span className="text-sm font-medium text-amber-300">
                Best P-Level:{" "}
              </span>
              <span className="text-white font-bold">{highPLevel}</span>
            </div>

            {gameIsActive && (
              <div
                className={`bg-gray-800/80 backdrop-blur-sm px-4 py-2 rounded-lg border ${
                  pLevel >= 5
                    ? "border-orange-500/50 animate-pulse"
                    : "border-gray-700/30"
                }`}
                style={{
                  minWidth:
                    Math.max(100, 20 + String(pLevel).length * 10) + "px",
                }}
              >
                <span
                  className={`text-sm font-medium ${
                    pLevel >= 10
                      ? "text-orange-400"
                      : pLevel >= 5
                      ? "text-amber-300"
                      : "text-blue-300"
                  }`}
                >
                  P-Level:{" "}
                </span>
                <span className="text-white font-bold">{pLevel}</span>
              </div>
            )}
          </div>

          {/* Achievement notification */}
          <AnimatePresence>
            {showAchievement && (
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                className="fixed top-20 right-6 z-50 max-w-xs"
              >
                <div className="bg-gray-800/80 backdrop-blur-md px-4 py-3 rounded-xl border border-purple-500/50 shadow-lg flex items-center gap-3">
                  <div className="bg-gray-900/50 p-2 rounded-lg">
                    {showAchievement.icon}
                  </div>
                  <div className="text-left">
                    <h3 className="text-purple-300 font-bold text-sm">
                      {showAchievement.name}
                    </h3>
                    <p className="text-gray-300 text-xs">
                      {showAchievement.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Canvas wrapper with stylized border */}
          <div className="relative rounded-lg overflow-hidden border-2 border-gray-800/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-blue-900/5 to-indigo-900/10 pointer-events-none"></div>
            <canvas
              ref={canvasRef}
              width={game.canvasWidth}
              height={game.canvasHeight}
              className="max-w-full max-h-full mx-auto bg-gray-950"
            />

            {/* Game over screen updated to focus on P-Level */}
            {showGameOverScreen && (
              <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="bg-gray-800/90 border border-gray-700/50 rounded-xl p-6 shadow-lg max-w-sm">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent mb-3">
                    Game Over
                  </h3>
                  <p className="text-gray-300 text-lg mb-2">
                    {gameOverMessage}
                  </p>
                  {pLevel > 0 && (
                    <div className="flex flex-col gap-2 mb-4">
                      <div className="flex justify-between items-center">
                        <p className="text-gray-400 text-sm">Final P-Level:</p>
                        <p className="text-white font-bold text-lg">{pLevel}</p>
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-gray-400 text-sm">Peak P-Level:</p>
                        <p className="text-white font-bold text-lg">
                          {maxPLevel}
                        </p>
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-gray-400 text-sm">All-time Best:</p>
                        <p className="text-purple-300 font-bold">
                          {highPLevel}
                        </p>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      resetGameAndAudio();
                      setShowGameOverScreen(false);
                      setMessage("Press space to play!");
                    }}
                    className="mt-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Other overlays */}
            {!gameIsActive && !showGameOverScreen && game.audioHasLoaded && (
              <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="bg-gray-800/80 border border-gray-700/50 rounded-xl p-6 shadow-lg max-w-sm">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent mb-3">
                    Ready to Play?
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Press{" "}
                    <span className="text-purple-400 font-bold">SPACE</span> to
                    start the rhythm game!
                  </p>
                  <div className="animate-bounce mt-2">
                    <div className="h-10 w-10 rounded-full bg-purple-600/20 flex items-center justify-center mx-auto">
                      <KeyIcon className="h-5 w-5 text-purple-400" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {!game.audioHasLoaded && (
              <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10">
                <div className="flex flex-col items-center">
                  <div className="animate-spin h-10 w-10 mb-4">
                    <div className="h-10 w-10 rounded-full border-4 border-purple-400 border-t-transparent"></div>
                  </div>
                  <p className="text-gray-300">Loading audio...</p>
                </div>
              </div>
            )}
          </div>

          {/* Song Progress Bar */}
          <div className="w-full px-2">
            <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
              <span>0:00</span>
              <span>
                {gameIsActive
                  ? `${Math.floor(
                      (game.audioCurrentTime / game.songDuration) * 100
                    )}%`
                  : "Progress"}
              </span>
              <span>3:23</span>
            </div>
            <div className="w-full h-3 bg-gray-800/60 rounded-full overflow-hidden border border-gray-700/30">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-blue-500 rounded-full relative"
                style={{
                  width: `${
                    (game.audioCurrentTime / game.songDuration) * 100
                  }%`,
                  transition: "width 0.3s linear",
                }}
              >
                {/* Pulsing glow effect on the progress bar */}
                <div className="absolute inset-0 animate-pulse">
                  <div className="h-full w-8 bg-white/20 blur-md transform -translate-x-4"></div>
                </div>
              </div>
            </div>
          </div>

          <audio
            ref={audioRef}
            src="/The Boy Who Fought the Lightning.mp3"
            onLoadedData={() => {
              game.audioHasLoaded = true;
              setMessage("Press space to play!");
              resetGameAndAudio();
            }}
          />

          {/* Tutorial modal */}
          {showTutorial && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-gray-900/90 border border-purple-500/30 rounded-xl p-6 max-w-lg w-full">
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent mb-4">
                  How to Play Rhythm Dots
                </h3>

                <div className="space-y-4 text-gray-300 text-sm">
                  <p>
                    1. Press{" "}
                    <span className="text-purple-400 font-bold">SPACE</span> to
                    start the game
                  </p>
                  <p>2. Dots will travel down the lines toward the circles</p>
                  <p>
                    3. When a dot reaches a circle, press the corresponding key
                    on your keyboard
                  </p>
                  <p>4. Build up your streak for bonus points!</p>
                  <p>5. Complete daily quests and unlock achievements</p>

                  <div className="pt-4">
                    <button
                      onClick={() => setShowTutorial(false)}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium px-6 py-2 rounded-lg hover:opacity-90 transition-all"
                    >
                      Got it!
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Game info and controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Game instructions */}
            <div className="p-5 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/30 relative overflow-hidden md:col-span-2">
              {/* Background decorative elements */}
              <div className="absolute top-0 right-0 h-20 w-20 bg-purple-600/10 rounded-full blur-xl -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 h-16 w-16 bg-blue-600/10 rounded-full blur-xl -ml-8 -mb-8"></div>

              <div className="text-gray-300 text-sm space-y-4 relative z-10">
                <div className="flex justify-between text-gray-400 text-xs">
                  <p>Credit to Jack Eisenmann (aka ostracod)</p>
                  <p>Music by Soleviio</p>
                </div>

                <p className="text-purple-300 font-medium">
                  Hit the corresponding key when a dot lands in a circle
                </p>

                {/* Keyboard visualization */}
                <div className="grid grid-rows-2 gap-2 max-w-md mx-auto">
                  {keyMap.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-1">
                      {row.map((key, keyIndex) => (
                        <div
                          key={keyIndex}
                          className={`w-8 h-8 flex items-center justify-center rounded border ${
                            keyIndex < 4
                              ? "border-purple-500/50 bg-purple-900/20 text-purple-300"
                              : "border-blue-500/50 bg-blue-900/20 text-blue-300"
                          } text-xs font-bold`}
                        >
                          {key}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4 mt-4">
                  <div className="flex items-center bg-gray-700/30 px-3 py-2 rounded-lg border border-gray-700/50 text-purple-300">
                    <KeyIcon className="h-4 w-4 mr-2" />
                    <span>
                      <b>SPACE</b> to start
                    </span>
                  </div>
                  <div className="flex items-center bg-gray-700/30 px-3 py-2 rounded-lg border border-gray-700/50 text-purple-300">
                    <KeyIcon className="h-4 w-4 mr-2" />
                    <span>
                      <b>ESC</b> to reset
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Quest & Achievements Panel */}
            <div className="p-5 bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700/30 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-20 w-20 bg-blue-600/10 rounded-full blur-xl -mr-10 -mt-10"></div>

              <div className="space-y-4 relative z-10">
                {/* Difficulty selector */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent mb-2">
                    Difficulty
                  </h3>
                  <div className="flex gap-2 justify-center">
                    {["easy", "normal", "hard"].map((level) => (
                      <button
                        key={level}
                        onClick={() => !gameIsActive && setDifficulty(level)}
                        className={`px-3 py-1.5 text-xs rounded-md capitalize ${
                          difficulty === level
                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                            : "bg-gray-800/70 text-gray-400 hover:text-gray-300"
                        } ${
                          gameIsActive ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={gameIsActive}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Daily Quest */}
                <div>
                  <h3 className="text-sm font-medium bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent mb-2">
                    Daily Quest
                  </h3>

                  {dailyQuest && (
                    <div
                      className={`bg-gray-800/60 p-3 rounded-lg border ${
                        dailyQuest.completed
                          ? "border-green-500/40"
                          : "border-amber-500/30"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {dailyQuest.completed ? (
                          <CheckBadgeIcon className="h-5 w-5 text-green-400 mt-0.5" />
                        ) : (
                          <TrophyIcon className="h-5 w-5 text-amber-400 mt-0.5" />
                        )}
                        <div className="text-left">
                          <p className="text-xs text-gray-300">
                            {dailyQuest.description}
                          </p>
                          <div className="mt-2 w-full bg-gray-700/50 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                              style={{
                                width: `${Math.min(
                                  100,
                                  ((dailyQuest.description.includes("streak")
                                    ? maxPLevel
                                    : pLevel) /
                                    dailyQuest.goal) *
                                    100
                                )}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                            <span>0</span>
                            <span>{dailyQuest.goal}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Achievements */}
                <div>
                  <h3 className="text-sm font-medium bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent mb-2">
                    Achievements
                  </h3>

                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className={`p-2 rounded-lg border ${
                        achievements.firstPlay
                          ? "bg-gray-800/60 border-purple-500/30"
                          : "bg-gray-800/20 border-gray-700/30"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <SparklesIcon
                          className={`h-5 w-5 ${
                            achievements.firstPlay
                              ? "text-yellow-300"
                              : "text-gray-500"
                          }`}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          First Play
                        </p>
                      </div>
                    </div>

                    <div
                      className={`p-2 rounded-lg border ${
                        achievements.reach10PLevel
                          ? "bg-gray-800/60 border-blue-500/30"
                          : "bg-gray-800/20 border-gray-700/30"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <CheckBadgeIcon
                          className={`h-5 w-5 ${
                            achievements.reach10PLevel
                              ? "text-blue-400"
                              : "text-gray-500"
                          }`}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          10 P-Level
                        </p>
                      </div>
                    </div>

                    <div
                      className={`p-2 rounded-lg border ${
                        achievements.reach25PLevel
                          ? "bg-gray-800/60 border-purple-500/30"
                          : "bg-gray-800/20 border-gray-700/30"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <TrophyIcon
                          className={`h-5 w-5 ${
                            achievements.reach25PLevel
                              ? "text-purple-400"
                              : "text-gray-500"
                          }`}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          25 P-Level
                        </p>
                      </div>
                    </div>

                    <div
                      className={`p-2 rounded-lg border ${
                        achievements.reach50PLevel
                          ? "bg-gray-800/60 border-amber-500/30"
                          : "bg-gray-800/20 border-gray-700/30"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <FireIcon
                          className={`h-5 w-5 ${
                            achievements.reach50PLevel
                              ? "text-amber-500"
                              : "text-gray-500"
                          }`}
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          50 P-Level
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tutorial button */}
                <div className="mt-4">
                  <button
                    onClick={() => setShowTutorial(true)}
                    className="w-full py-2 text-xs bg-gray-800/60 hover:bg-gray-800/80 text-gray-300 rounded-lg border border-gray-700/50"
                  >
                    How to Play
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Panel (always visible on desktop, collapsible on mobile) */}
      <div className="fixed right-6 top-6 w-80 bg-gray-900/90 backdrop-blur-lg rounded-xl border border-gray-700/50 shadow-2xl overflow-hidden z-50">
        <div className="p-4 border-b border-gray-700/50 bg-gradient-to-b from-gray-900/50 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <TrophyIcon className="h-5 w-5 text-amber-400" />
            <h2 className="text-lg font-bold bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              Leaderboard
            </h2>
          </div>
          <p className="text-xs text-gray-400">Updated every 60 seconds</p>
        </div>

        <div className="p-4 h-[calc(100vh-180px)] overflow-y-auto">
          {isLoadingLeaderboard ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8">
                <div className="h-8 w-8 rounded-full border-4 border-purple-400 border-t-transparent" />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {Array.isArray(leaderboard) && leaderboard.length > 0 ? (
                leaderboard.map((player, index) => (
                  <div
                    key={player?._id || index}
                    className={`p-3 rounded-lg border ${
                      currentUser?.username === player?.username
                        ? "border-purple-500/30 bg-purple-900/10"
                        : index === 0
                        ? "border-amber-500/20 bg-amber-900/5"
                        : "border-gray-700/30"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <span
                          className={`text-xs font-medium ${
                            index === 0 ? "text-amber-400" : "text-gray-400"
                          }`}
                        >
                          #{index + 1}
                        </span>
                        <span className="ml-2 text-sm text-gray-200 truncate max-w-[120px]">
                          {player?.username || "Anonymous"}
                          {currentUser?.username === player?.username && (
                            <span className="text-xs text-purple-400 ml-1">
                              (you)
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`text-sm font-bold ${
                            player?.rhythmGame?.peakPLevel >= 50
                              ? "text-amber-400"
                              : player?.rhythmGame?.peakPLevel >= 25
                              ? "text-purple-400"
                              : "text-blue-400"
                          }`}
                        >
                          {player?.rhythmGame?.peakPLevel || 0}
                        </span>
                        <span className="ml-2 text-xs bg-gray-800 px-1.5 py-0.5 rounded text-gray-400">
                          {player?.rhythmGame?.difficulty || "normal"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-400">No scores yet. Be the first!</p>
                </div>
              )}
            </div>
          )}

          {!currentUser && (
            <div className="mt-4 p-3 border border-blue-500/20 bg-blue-900/10 rounded-lg">
              <p className="text-xs text-blue-300">
                Sign in to appear on the leaderboard
              </p>
            </div>
          )}

          <div className="mt-4 text-xs text-gray-500 flex items-center justify-between">
            <span>{new Date().toLocaleDateString()}</span>
            <button
              onClick={fetchLeaderboard}
              className="text-blue-400 hover:text-blue-300 flex items-center"
            >
              <ArrowTrendingUpIcon className="h-3 w-3 mr-1" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        @keyframes flowingBackgroundTitle {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default RyGame;
