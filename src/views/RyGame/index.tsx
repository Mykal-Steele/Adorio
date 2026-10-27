'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  SparklesIcon,
  MusicalNoteIcon,
  KeyIcon,
  TrophyIcon,
  FireIcon,
  SpeakerWaveIcon,
  CheckBadgeIcon,
  HeartIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import PaperTornEdge from '../../components/PaperTornEdge';
import { fetchUserData } from '../../api';
import {
  fetchLeaderboard,
  updateScore,
  updateAchievements,
  fetchUserGameStats,
} from '../../api/gameApi';
import { getToken } from '../../utils/tokenStorage';

const DOT_RADIUS = 11;

class Color {
  r: number;
  g: number;
  b: number;
  a: number;
  constructor(r: number, g: number, b: number, a = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  toString() {
    return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
  }
}

class Pos {
  x: number;
  y: number;
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

class HitEffect {
  x: number;
  y: number;
  color: Color;
  startTime: number;
  duration: number;
  maxSize: number;
  constructor(x: number, y: number, color: Color) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.startTime = Date.now();
    this.duration = 150;
    this.maxSize = 30;
  }

  draw(ctx) {
    const elapsed = Date.now() - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1);
    if (progress >= 1) return true;

    ctx.save();
    const centerOpacity = Math.max(0.7, 1 - progress * 1.5);
    ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${centerOpacity})`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, DOT_RADIUS * (1 - progress * 0.5), 0, 2 * Math.PI);
    ctx.fill();

    const size = this.maxSize * progress;
    const opacity = 1 - progress;

    ctx.strokeStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${opacity * 0.7})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(this.x, this.y, size, 0, 2 * Math.PI);
    ctx.stroke();

    ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${opacity * 0.5})`;

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

const colors = {
  defaultLeftColor: new Color(226, 168, 66, 0.95),
  defaultRightColor: new Color(122, 158, 92, 0.95),
  rainbowLeftColorSet: [
    new Color(226, 168, 66, 0.95),
    new Color(210, 120, 70, 0.95),
    new Color(178, 88, 80, 0.95),
    new Color(242, 199, 68, 0.95),
  ],
  rainbowRightColorSet: [
    new Color(122, 158, 92, 0.95),
    new Color(88, 148, 130, 0.95),
    new Color(84, 130, 150, 0.95),
    new Color(150, 150, 96, 0.95),
  ],
  blackColor: new Color(43, 39, 35, 0.95),
  whiteColor: new Color(253, 250, 243, 0.95),
  backgroundColorSet: [
    new Color(20, 18, 16, 0.97),
    new Color(74, 44, 24, 0.4),
    new Color(58, 52, 24, 0.4),
    new Color(26, 56, 52, 0.4),
    new Color(70, 32, 30, 0.4),
    new Color(52, 30, 44, 0.4),
    new Color(34, 48, 56, 0.4),
  ],
  hitEffects: [new Color(242, 199, 68, 1), new Color(210, 120, 70, 1), new Color(122, 158, 92, 1)],
};

const ACHIEVEMENTS_STORAGE_KEY = 'rhythmDotsAchievements';
const DEFAULT_ACHIEVEMENTS = {
  firstPlay: false,
  reach10PLevel: false,
  reach25PLevel: false,
  reach50PLevel: false,
};

const readStoredAchievements = () => {
  if (typeof window === 'undefined') return { ...DEFAULT_ACHIEVEMENTS };
  try {
    const parsed = JSON.parse(localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY) || '{}');
    return { ...DEFAULT_ACHIEVEMENTS, ...parsed };
  } catch {
    return { ...DEFAULT_ACHIEVEMENTS };
  }
};

const readStoredVolume = () => {
  if (typeof window === 'undefined') return 0.3;
  try {
    const raw = localStorage.getItem('rhythmDotsVolume');
    const saved = raw === null ? NaN : Number(raw);
    return Number.isFinite(saved) && saved >= 0 && saved <= 1 ? saved : 0.3;
  } catch {
    return 0.3;
  }
};

const formatTime = (seconds) => {
  const total = Math.max(0, Math.floor(seconds || 0));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

const RyGame = () => {
  const timerEventRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const gameLoopRef = useRef(null);
  const [audioHasLoaded, setAudioHasLoaded] = useState(false);
  const [audioLoadError, setAudioLoadError] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [volume, setVolume] = useState(readStoredVolume);
  const [message, setMessage] = useState('Loading...');
  const [gameIsActive, setGameIsActive] = useState(false);
  const [pLevel, setPLevel] = useState(0);
  const [highPLevel, setHighPLevel] = useState(0);
  const [maxPLevel, setMaxPLevel] = useState(0);
  const [showTutorial, setShowTutorial] = useState(false);
  const [achievements, setAchievements] = useState(readStoredAchievements);
  const [showAchievement, setShowAchievement] = useState(null);
  const [difficulty, setDifficulty] = useState('normal');
  const [hitEffects, setHitEffects] = useState([]);
  const [gameOverMessage, setGameOverMessage] = useState('');
  const [showGameOverScreen, setShowGameOverScreen] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const achievementsSyncedRef = useRef(false);
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
    destinationKeyCodeSet: [81, 87, 69, 82, 85, 73, 79, 80, 65, 83, 68, 70, 74, 75, 76, 186],
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

  class Dot {
    lineIndex: number;
    linePosY: number;
    createdAt: number;
    isHit: boolean;
    hitTime: number;
    constructor(lineIndex: number) {
      this.lineIndex = lineIndex;
      this.linePosY = 0;
      this.createdAt = Date.now();
      this.isHit = false; // hit dots stay around a bit to fade out
      this.hitTime = 0;
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
          (this.lineIndex - game.numberOfColumns) * (game.lineHeight + 1) * 2 + game.lineHeight + 1;
      } else {
        tempOffset = this.lineIndex * (game.lineHeight + 1) * 2;
      }
      const tempPos = game.linePosList[tempOffset + this.linePosY];

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

      // cream outline for better contrast
      game.context.save();
      game.context.strokeStyle = 'rgba(253, 250, 243, 0.7)';
      game.context.lineWidth = 1;
      drawCircleOutline(tempPos, game.dotRadius + 1);
      game.context.restore();

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
          (this.lineIndex - game.numberOfColumns) * (game.lineHeight + 1) * 2 + game.lineHeight + 1;
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
        const index = (column + game.rainbowColorIndexOffset) % (game.numberOfColumns / 2);
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

  const updateLinePosList = useCallback(() => {
    let index = 0;
    let tempColumn = 0;
    const totalLineHeight = game.lineHeight * 2 + 3;

    while (tempColumn < game.numberOfColumns) {
      let tempPosX1;
      if (tempColumn < game.numberOfColumns / 2) {
        tempPosX1 = (tempColumn + 0.5) * (game.canvasWidth / (game.numberOfColumns + 0.5));
      } else {
        tempPosX1 = (tempColumn + 1.0) * (game.canvasWidth / (game.numberOfColumns + 0.5));
      }

      const tempPosX2 =
        (tempPosX1 - game.canvasWidth / 2) / (game.lineTaper - game.rockingOffset) +
        game.canvasWidth / 2;

      let tempLinePosY = 0;
      while (tempLinePosY <= game.lineHeight) {
        const tempPos = game.linePosList[index];
        index += 1;
        tempPos.x = ((tempPosX2 - tempPosX1) * tempLinePosY) / game.lineHeight + tempPosX1;
        tempPos.y = ((1 + tempLinePosY) * game.canvasHeight) / totalLineHeight;
        tempLinePosY += 1;
      }

      tempLinePosY = 0;
      while (tempLinePosY <= game.lineHeight) {
        const tempPos = game.linePosList[index];
        index += 1;
        tempPos.x = ((tempPosX2 - tempPosX1) * tempLinePosY) / game.lineHeight + tempPosX1;
        tempPos.y =
          ((2 + 2 * game.lineHeight - tempLinePosY) * game.canvasHeight) / totalLineHeight;
        tempLinePosY += 1;
      }
      tempColumn += 1;
    }
  }, [game]);

  const drawText = (pos, text) => {
    if (game.hasStartedWhiteForeground) {
      setContextColor(colors.whiteColor);
    } else {
      setContextColor(colors.whiteColor);
    }
    // shadow so the text stays readable
    game.context.save();
    game.context.shadowOffsetX = 2;
    game.context.shadowOffsetY = 2;
    game.context.shadowBlur = 3;
    game.context.shadowColor = 'rgba(20, 18, 16, 0.7)';
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

  // eslint-disable-next-line react-hooks/exhaustive-deps -- thin synchronous lookup over the stable `game` ref.
  const getDot = (lineIndex, linePosY) => {
    return game.dotList.find((dot) => dot.lineIndex === lineIndex && dot.linePosY === linePosY);
  };

  const drawAllDots = () => {
    game.dotList.forEach((dot) => dot.draw());
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps -- pushes onto the stable `game.hitEffects` ref array.
  const createHitEffect = (pos, colorIndex) => {
    if (!game.hitEffects) game.hitEffects = [];
    const color = colors.hitEffects[colorIndex % colors.hitEffects.length];
    const newEffect = new HitEffect(pos.x, pos.y, color);

    game.hitEffects.push(newEffect);
  };

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
      if (!getDot(tempColumn, 0) && !getDot(tempColumn + game.numberOfColumns, 0)) {
        new Dot(tempColumn + Math.floor(Math.random() * 2) * game.numberOfColumns);
        return;
      }
    }
  };

  const createDots = () => {
    const tempProgress = game.audioCurrentTime / game.songDuration;
    let tempCount;

    let difficultyMultiplier = 1;
    if (difficulty === 'easy') difficultyMultiplier = 0.7;
    if (difficulty === 'hard') difficultyMultiplier = 1.3;

    if (game.audioCurrentTime < game.songDuration - 3) {
      if (game.numberOfAdvancesUntilRest < 0) {
        tempCount = 0;
        game.numberOfAdvancesUntilRest = 2 + Math.floor(Math.random() * (4 + 8 * tempProgress));
      } else {
        tempCount =
          1 + Math.floor(Math.random() * (0.7 + 2.3 * tempProgress) * difficultyMultiplier);
      }
    } else {
      tempCount = 0;
    }

    while (tempCount > 0) {
      createDot();
      tempCount--;
    }
  };

  useEffect(() => {
    const savedHighPLevel = localStorage.getItem('rhythmDotsHighPLevel');
    if (savedHighPLevel) {
      setHighPLevel(parseInt(savedHighPLevel));
    }

    const firstVisit = localStorage.getItem('rhythmDotsFirstVisit');
    if (!firstVisit) {
      setShowTutorial(true);
      localStorage.setItem('rhythmDotsFirstVisit', 'false');
    }
  }, []);

  const fetchLeaderboardData = useCallback(async () => {
    try {
      setIsLoadingLeaderboard(true);
      const data = await fetchLeaderboard();
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setLeaderboard([]);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboardData();

    const refreshInterval = setInterval(() => {
      fetchLeaderboardData();
    }, 60000);

    return () => clearInterval(refreshInterval);
  }, [fetchLeaderboardData]);

  const updateUserScore = useCallback(
    async (score, difficulty) => {
      try {
        const response = await updateScore(score, difficulty);

        if (response && !response.anonymous) {
          setCurrentUser((prev) =>
            prev
              ? {
                  ...prev,
                  rhythmGame: {
                    ...prev.rhythmGame,
                    peakPLevel: Math.max(score, prev.rhythmGame?.peakPLevel || 0),
                    difficulty,
                  },
                }
              : prev,
          );
        }

        fetchLeaderboardData();
      } catch (error) {
        console.error('Failed to update score:', error);
      }
    },
    [fetchLeaderboardData],
  );

  const checkHighPLevel = useCallback(() => {
    if (maxPLevel > highPLevel) {
      setHighPLevel(maxPLevel);
      localStorage.setItem('rhythmDotsHighPLevel', maxPLevel.toString());
      return true;
    }
    return false;
  }, [maxPLevel, highPLevel]);

  const persistAchievements = useCallback((next) => {
    setAchievements(next);
    try {
      localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(next));
    } catch (error) {
      console.warn('Could not persist achievements locally:', error);
    }
    if (getToken()) updateAchievements(next).catch(() => {});
  }, []);

  const checkAchievements = useCallback(() => {
    const newAchievements = { ...achievements };
    let achievementUnlocked = null;

    if (!newAchievements.reach10PLevel && maxPLevel >= 10) {
      newAchievements.reach10PLevel = true;
      achievementUnlocked = {
        name: 'Beginner',
        description: 'Reached P-Level 10',
        icon: <CheckBadgeIcon className="h-6 w-6 text-[var(--paper-accent)]" />,
      };
    }

    if (!newAchievements.reach25PLevel && maxPLevel >= 25) {
      newAchievements.reach25PLevel = true;
      achievementUnlocked = {
        name: 'Getting Good',
        description: 'Reached P-Level 25',
        icon: <TrophyIcon className="h-6 w-6 text-[var(--paper-accent)]" />,
      };
    }

    if (!newAchievements.reach50PLevel && maxPLevel >= 50) {
      newAchievements.reach50PLevel = true;
      achievementUnlocked = {
        name: 'Rhythm Master',
        description: 'Reached P-Level 50!',
        icon: <FireIcon className="h-6 w-6 text-[var(--paper-accent-deep)]" />,
      };
    }

    if (achievementUnlocked) {
      persistAchievements(newAchievements);
      setShowAchievement(achievementUnlocked);

      setTimeout(() => {
        setShowAchievement(null);
      }, 3000);
    }
  }, [achievements, maxPLevel, persistAchievements]);

  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);

  const generateSkillBasedQuests = useCallback(() => {
    const baseQuests = [{ goal: 5, description: 'Reach P-Level 5', completed: false }];

    if (highPLevel > 10) {
      const advancedQuest = {
        goal: Math.min(Math.max(Math.floor(highPLevel * 0.7), 8), 25),
        description: `Reach P-Level ${Math.min(Math.max(Math.floor(highPLevel * 0.7), 8), 25)}`,
        completed: false,
      };
      baseQuests.push(advancedQuest);
    }

    if (highPLevel > 20) {
      const expertQuest = {
        goal: Math.min(Math.max(Math.floor(highPLevel * 0.9), 15), 40),
        description: `Reach P-Level ${Math.min(Math.max(Math.floor(highPLevel * 0.9), 15), 40)}`,
        completed: false,
      };
      baseQuests.push(expertQuest);
    }

    return baseQuests[Math.floor(Math.random() * baseQuests.length)];
  }, [highPLevel]);

  const startGame = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audioHasLoaded) return;

    setGameIsActive(true);
    setMessage('');
    setShowGameOverScreen(false);

    const playback = audio.play();
    if (playback && typeof playback.catch === 'function') {
      playback.catch((error) => {
        if (error?.name === 'AbortError') return;
        setGameIsActive(false);
        setMessage('Press space to play!');
      });
    }

    if (!achievements.firstPlay) {
      persistAchievements({ ...achievements, firstPlay: true });

      setShowAchievement({
        name: 'First Play',
        description: 'Played your first game',
        icon: <SparklesIcon className="h-6 w-6 text-[var(--paper-accent)]" />,
      });

      setTimeout(() => {
        setShowAchievement(null);
      }, 3000);
    }
  }, [audioHasLoaded, achievements, persistAchievements]);

  const stopGame = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setGameIsActive(false);
    }
  }, []);

  const resetGame = useCallback(() => {
    setGameIsActive(false);
    setElapsedTime(0);
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
  }, [game, updateLinePosList]);

  const resetAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    if (audio.readyState > 0) audio.currentTime = 0;
  }, []);

  const resetGameAndAudio = useCallback(() => {
    resetGame();
    resetAudio();
  }, [resetGame, resetAudio]);

  const markAudioReady = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audio.readyState < 2 || game.audioHasLoaded) return;

    game.audioHasLoaded = true;
    setAudioHasLoaded(true);
    setMessage('Press space to play!');
    resetGameAndAudio();
  }, [game, resetGameAndAudio]);

  const handleKeyDownEvent = useCallback(
    (event) => {
      let keyCode = event.which;
      if (keyCode === 59) keyCode = 186; // Firefox sends 59 for ; instead of 186

      if (showTutorial) return;

      if (keyCode === 27) {
        setMessage('Press space to play!');
        stopGame();
        resetGameAndAudio();
        setShowGameOverScreen(false);
        return;
      }

      if (keyCode === 32) {
        event.preventDefault(); // stop space from scrolling the page
        if (audioHasLoaded && !gameIsActive) {
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
              setGameOverMessage(`You pressed the wrong key! Final P-Level: ${pLevel}`);
              setPLevel(0);
              setShowGameOverScreen(true);
              stopGame();
              checkHighPLevel();
            }
          } else {
            const dotPos = tempDot.getPosition();

            const colorIndex = Math.floor(Math.random() * colors.hitEffects.length);
            createHitEffect(dotPos, colorIndex);

            // don't remove yet, let it fade out first
            tempDot.isHit = true;
            tempDot.hitTime = Date.now();

            setTimeout(() => {
              if (tempDot) tempDot.remove();
            }, 100); // same 100ms as the fade in draw()

            setPLevel((prev) => {
              const newPLevel = prev + 1;
              setMaxPLevel((current) => Math.max(current, newPLevel));
              return newPLevel;
            });

            game.lastHitTime = Date.now();
          }
        }
      }
    },
    [
      game,
      gameIsActive,
      audioHasLoaded,
      showTutorial,
      startGame,
      stopGame,
      resetGameAndAudio,
      pLevel,
      checkHighPLevel,
      createHitEffect,
      getDot,
    ],
  );

  const gameLoop = useCallback(() => {
    if (!gameIsActive || !game.context) return;

    if (audioRef.current && game.audioHasLoaded) {
      game.audioCurrentTime = audioRef.current.currentTime;
      const tempTime = game.audioCurrentTime - game.audioTimeOffset;

      const tempMeasure = tempTime / game.tempo;

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

      let tempOffset;
      if (game.hasStartedPulsating) {
        const tempNumber = 1 - Math.sin(((tempTime / (game.tempo / 4)) % 1) * Math.PI);
        tempOffset = game.pulsationAmplitude * (1 - tempNumber * tempNumber);
      } else {
        tempOffset = game.pulsationAmplitude;
      }
      game.dotRadius = game.dotMaximumRadius - tempOffset;
      game.destinationRadius = game.destinationMaximumRadius - tempOffset;

      if (game.hasStartedRainbow) {
        game.rainbowColorIndexOffset = Math.floor(
          (tempTime / (game.tempo / 4)) % (game.numberOfColumns / 2),
        );
      }
      if (game.hasStartedRainbowBackground) {
        game.backgroundColorIndex =
          1 + Math.floor((tempTime / (game.tempo / 2)) % (colors.backgroundColorSet.length - 1));
      }
      if (game.hasStartedRocking) {
        const tempNumber = 1 - Math.sin(((tempTime / (game.tempo / 4)) % 1) * Math.PI);
        game.rockingOffset = game.rockingAmplitude * tempNumber * tempNumber;
        updateLinePosList();
      }
    }

    const ctx = game.context;

    // fillRect instead of clearRect, way faster
    const bgColor = game.hasStartedWhiteForeground
      ? colors.backgroundColorSet[game.backgroundColorIndex]
      : colors.backgroundColorSet[0];

    ctx.save();
    setContextColor(bgColor);
    ctx.fillRect(0, 0, game.canvasWidth, game.canvasHeight);

    ctx.strokeStyle = 'rgba(253, 250, 243, 0.05)';
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

    drawMessage();

    ctx.lineWidth = 3;
    ctx.shadowBlur = 12;
    ctx.shadowColor = 'rgba(242, 199, 68, 0.35)';

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

    // effects and dots are the fps critical part
    drawHitEffects();
    drawAllDots();

    ctx.restore();

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- requestAnimationFrame loop reads from the stable `game` ref.
  }, [gameIsActive, pLevel]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(game.canvasWidth * dpr);
    canvas.height = Math.floor(game.canvasHeight * dpr);
    canvas.style.width = `${game.canvasWidth}px`;
    canvas.style.height = `${game.canvasHeight}px`;

    const ctx = canvas.getContext('2d', { alpha: false });
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    game.context = ctx;
    ctx.font = 'bold 16px Inter, system-ui, sans-serif';
    ctx.lineWidth = 3;
    ctx.strokeStyle = colors.blackColor.toString();
    ctx.imageSmoothingEnabled = true;

    const linePosList = [];
    for (let i = 0; i < game.numberOfColumns; i++) {
      for (let j = 0; j <= game.lineHeight; j++) {
        linePosList.push(new Pos(0, 0), new Pos(0, 0));
      }
    }
    game.linePosList = linePosList;
    updateLinePosList();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- canvas init runs once; `game` and `updateLinePosList` are refs/stable.
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDownEvent);
    return () => window.removeEventListener('keydown', handleKeyDownEvent);
  }, [handleKeyDownEvent]);

  useEffect(() => {
    if (!game.context) return;

    gameLoopRef.current = requestAnimationFrame(gameLoop);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- requestAnimationFrame loop reads from the stable `game` ref.
  }, [gameLoop]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    try {
      localStorage.setItem('rhythmDotsVolume', String(volume));
    } catch (error) {
      console.warn('Could not persist volume:', error);
    }
  }, [volume]);

  useEffect(() => {
    if (!gameIsActive) return;

    const syncElapsed = () => setElapsedTime(audioRef.current?.currentTime || 0);
    syncElapsed();
    const interval = setInterval(syncElapsed, 250);

    return () => clearInterval(interval);
  }, [gameIsActive]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    markAudioReady();

    audio.addEventListener('loadeddata', markAudioReady);
    audio.addEventListener('canplay', markAudioReady);
    audio.addEventListener('canplaythrough', markAudioReady);

    return () => {
      audio.removeEventListener('loadeddata', markAudioReady);
      audio.removeEventListener('canplay', markAudioReady);
      audio.removeEventListener('canplaythrough', markAudioReady);
    };
  }, [markAudioReady]);

  const keyMap = [
    ['Q', 'W', 'E', 'R', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';'],
  ];

  const [dailyQuest, setDailyQuest] = useState(null);

  useEffect(() => {
    const today = new Date().toDateString();
    const savedQuest = localStorage.getItem('rhythmDotsDailyQuest');
    const savedQuestDate = localStorage.getItem('rhythmDotsDailyQuestDate');

    if (savedQuestDate === today && savedQuest) {
      setDailyQuest(JSON.parse(savedQuest));
    } else {
      const newQuest = generateSkillBasedQuests();
      setDailyQuest(newQuest);

      localStorage.setItem('rhythmDotsDailyQuest', JSON.stringify(newQuest));
      localStorage.setItem('rhythmDotsDailyQuestDate', today);
    }
  }, [generateSkillBasedQuests]);

  useEffect(() => {
    if (!dailyQuest || dailyQuest.completed) return;

    let completed = false;

    if (dailyQuest.description.includes('P-Level') && pLevel >= dailyQuest.goal) {
      completed = true;
    } else if (dailyQuest.description.includes('streak') && maxPLevel >= dailyQuest.goal) {
      completed = true;
    }

    if (completed) {
      const updatedQuest = { ...dailyQuest, completed: true };
      setDailyQuest(updatedQuest);
      localStorage.setItem('rhythmDotsDailyQuest', JSON.stringify(updatedQuest));

      setShowAchievement({
        name: 'Daily Quest Complete!',
        description: dailyQuest.description,
        icon: <CheckBadgeIcon className="h-6 w-6 text-[#4f6b3a]" />,
      });

      setTimeout(() => {
        setShowAchievement(null);
      }, 3000);
    }
  }, [pLevel, maxPLevel, dailyQuest]);

  useEffect(() => {
    if (!showGameOverScreen || maxPLevel <= 0 || !getToken()) return;
    updateUserScore(maxPLevel, difficulty);
  }, [showGameOverScreen, maxPLevel, difficulty, updateUserScore]);

  useEffect(() => {
    const getUserGameStats = async () => {
      try {
        const gameStats = await fetchUserGameStats();

        if (gameStats && !gameStats.anonymous) {
          setHighPLevel(gameStats.peakPLevel || 0);

          const serverAchievements = {
            ...DEFAULT_ACHIEVEMENTS,
            ...(gameStats.achievements || {}),
          };
          const localAchievements = readStoredAchievements();
          const mergedAchievements = Object.fromEntries(
            Object.keys(DEFAULT_ACHIEVEMENTS).map((key) => [
              key,
              Boolean(localAchievements[key] || serverAchievements[key]),
            ]),
          );
          setAchievements(mergedAchievements);
          try {
            localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(mergedAchievements));
          } catch (error) {
            console.warn('Could not persist achievements locally:', error);
          }

          const hasUnsynced = Object.keys(DEFAULT_ACHIEVEMENTS).some(
            (key) => mergedAchievements[key] && !serverAchievements[key],
          );
          if (hasUnsynced && getToken() && !achievementsSyncedRef.current) {
            achievementsSyncedRef.current = true;
            updateAchievements(mergedAchievements).then((result) => {
              if (result?.saved === false) achievementsSyncedRef.current = false;
            });
          }

          if (getToken()) {
            try {
              const userData = await fetchUserData();
              if (userData) setCurrentUser(userData);
            } catch {
              // proceed as guest
            }
          }
        } else {
          const savedHighPLevel = localStorage.getItem('rhythmDotsHighPLevel');
          if (savedHighPLevel) {
            setHighPLevel(parseInt(savedHighPLevel) || 0);
          }
        }
      } catch (error) {
        // On any error, fall back to local storage
        const savedHighPLevel = localStorage.getItem('rhythmDotsHighPLevel');
        if (savedHighPLevel) {
          setHighPLevel(parseInt(savedHighPLevel) || 0);
        }
      }
    };

    getUserGameStats();
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const checkAuthInterval = setInterval(() => {
      const token = getToken();
      if (!token) {
        setCurrentUser(null);
      }
    }, 30000);

    return () => clearInterval(checkAuthInterval);
  }, [currentUser]);

  const renderLeaderboard = useCallback(() => {
    if (!Array.isArray(leaderboard) || leaderboard.length === 0) {
      return (
        <div className="py-8 text-center">
          <p className="font-paper-sans text-base text-[var(--paper-muted)]">No scores yet.</p>
        </div>
      );
    }

    return leaderboard.map((player, index) => {
      if (!player) return null;

      return (
        <div
          key={player._id || `player-${index}`}
          className={`rounded-[2px] border px-3 py-2.5 ${
            currentUser?.username === player?.username
              ? 'border-[var(--paper-accent-strong)] bg-[var(--paper-yellow-soft)]'
              : index === 0
                ? 'border-[#a8801a] bg-[#fbf4dd]'
                : 'border-[var(--paper-line)] bg-[var(--paper-cream)]'
          }`}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <span
                className={`font-paper-mono text-[10px] ${
                  index === 0 ? 'text-[var(--paper-accent-deep)]' : 'text-[var(--paper-muted-2)]'
                }`}
              >
                #{player.rank ?? index + 1}
              </span>
              <span className="ml-2 max-w-[120px] truncate text-sm font-medium">
                {player?.username || 'Anonymous'}
                {currentUser?.username === player?.username && (
                  <span className="ml-1 text-xs text-[var(--paper-accent)]">(you)</span>
                )}
              </span>
            </div>
            <div className="flex items-center">
              <span
                className={`text-sm font-bold ${
                  player?.rhythmGame?.peakPLevel >= 50
                    ? 'text-[var(--paper-accent-deep)]'
                    : player?.rhythmGame?.peakPLevel >= 25
                      ? 'text-[var(--paper-accent)]'
                      : 'text-[var(--paper-muted-2)]'
                }`}
              >
                {player?.rhythmGame?.peakPLevel || 0}
              </span>
              <span className="ml-2 rounded-[2px] border border-[var(--paper-line)] px-1.5 py-0.5 font-paper-mono text-[9px] uppercase tracking-[.08em] text-[var(--paper-muted-2)]">
                {player?.rhythmGame?.difficulty || 'normal'}
              </span>
            </div>
          </div>
        </div>
      );
    });
  }, [leaderboard, currentUser]);

  return (
    <div className="paper-theme min-h-screen">
      <PaperTornEdge />
      <div className="flex flex-col lg:flex-row">
        <div className="flex flex-1 flex-col items-center p-4 pt-7">
          <div className="relative w-full max-w-4xl space-y-6 rounded-[3px] bg-[var(--paper-cream)] p-6 text-center shadow-[0_14px_26px_-14px_rgba(60,44,24,.3),0_2px_0_rgba(60,44,24,.1)]">
            <span
              aria-hidden="true"
              className="absolute -top-3 left-1/2 h-[26px] w-24 -translate-x-1/2 rotate-[-3deg] border-x border-dashed border-[rgba(60,44,24,.3)] bg-[rgba(242,199,68,.7)] shadow-[0_1px_3px_rgba(60,44,24,.2)]"
            />

            <div className="mb-1 flex items-center justify-center gap-3">
              <SparklesIcon className="h-7 w-7 text-[var(--paper-accent)]" />
              <h1 className="font-paper-serif text-[clamp(28px,4vw,38px)] font-bold leading-[1.05] tracking-[-.02em]">
                Rhythm Dots
              </h1>
              <MusicalNoteIcon className="h-7 w-7 text-[var(--paper-accent)]" />
            </div>

            <div className="absolute right-5 top-3 flex items-center">
              <div
                className={`mr-2 h-2.5 w-2.5 rounded-full ${
                  gameIsActive ? 'bg-[#6b8e3d] animate-pulse' : 'bg-[#a9564f]'
                }`}
              ></div>
              <span className="font-paper-mono text-[10px] uppercase tracking-[.12em] text-[var(--paper-muted-2)]">
                {gameIsActive ? 'Playing' : 'Ready'}
              </span>
            </div>

            <div className="absolute top-6 left-6 flex flex-col gap-2 z-30">
              <div
                className="rounded-[2px] border border-[var(--paper-line)] bg-[var(--paper-hero)] px-3 py-1.5"
                style={{
                  minWidth: Math.max(100, 20 + String(highPLevel).length * 10) + 'px',
                }}
              >
                <span className="font-paper-mono text-[10px] uppercase tracking-[.1em] text-[var(--paper-muted-2)]">
                  Best{' '}
                </span>
                <span className="font-paper-serif text-base font-bold">{highPLevel}</span>
              </div>

              {gameIsActive && (
                <div
                  className={`rounded-[2px] border bg-[var(--paper-hero)] px-3 py-1.5 ${
                    pLevel >= 5
                      ? 'border-[var(--paper-accent-strong)] animate-pulse'
                      : 'border-[var(--paper-line)]'
                  }`}
                  style={{
                    minWidth: Math.max(100, 20 + String(pLevel).length * 10) + 'px',
                  }}
                >
                  <span className="font-paper-mono text-[10px] uppercase tracking-[.1em] text-[var(--paper-muted-2)]">
                    P-Level{' '}
                  </span>
                  <span className="font-paper-serif text-base font-bold">{pLevel}</span>
                </div>
              )}
            </div>

            <AnimatePresence>
              {showAchievement && (
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  className="fixed top-20 right-6 z-50 max-w-xs"
                >
                  <div className="flex items-center gap-3 rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-cream)] px-4 py-3 shadow-[3px_4px_0_var(--paper-ink)]">
                    <div className="rounded-[2px] bg-[var(--paper-yellow-soft)] p-2">
                      {showAchievement.icon}
                    </div>
                    <div className="text-left">
                      <h3 className="font-paper-serif text-sm font-bold text-[var(--paper-accent-deep)]">
                        {showAchievement.name}
                      </h3>
                      <p className="text-xs text-[var(--paper-muted)]">
                        {showAchievement.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative overflow-hidden rounded-[2px] border-[1.5px] border-[var(--paper-ink)] shadow-[0_14px_26px_-16px_rgba(60,44,24,.45)]">
              <canvas
                ref={canvasRef}
                width={game.canvasWidth}
                height={game.canvasHeight}
                className="mx-auto max-h-full max-w-full bg-[#141210]"
              />

              {showGameOverScreen && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[rgba(43,39,35,.62)]">
                  <div className="max-w-sm rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-cream)] p-6 text-left shadow-[4px_5px_0_var(--paper-ink)]">
                    <h3 className="mb-3 font-paper-serif text-xl font-bold">Game Over</h3>
                    <p className="mb-2 font-paper-sans text-base text-[var(--paper-muted)]">
                      {gameOverMessage}
                    </p>
                    {pLevel > 0 && (
                      <div className="mb-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between border-b border-dashed border-[var(--paper-line)] pb-1.5">
                          <p className="font-paper-mono text-[10px] uppercase tracking-[.12em] text-[var(--paper-muted-2)]">
                            Final P-Level
                          </p>
                          <p className="font-paper-serif text-lg font-bold">{pLevel}</p>
                        </div>

                        <div className="flex items-center justify-between border-b border-dashed border-[var(--paper-line)] pb-1.5">
                          <p className="font-paper-mono text-[10px] uppercase tracking-[.12em] text-[var(--paper-muted-2)]">
                            Peak P-Level
                          </p>
                          <p className="font-paper-serif text-lg font-bold">{maxPLevel}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="font-paper-mono text-[10px] uppercase tracking-[.12em] text-[var(--paper-muted-2)]">
                            All-time Best
                          </p>
                          <p className="font-paper-serif font-bold text-[var(--paper-accent-deep)]">
                            {highPLevel}
                          </p>
                        </div>
                      </div>
                    )}
                    <button
                      onClick={() => {
                        resetGameAndAudio();
                        setShowGameOverScreen(false);
                        setMessage('Press space to play!');
                      }}
                      className="mt-2 -rotate-[0.6deg] rounded-[4px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-6 py-2 font-paper-mono text-[12px] font-bold uppercase tracking-[.12em] shadow-[3px_4px_0_var(--paper-ink)] transition-transform hover:-translate-y-px"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {!gameIsActive && !showGameOverScreen && audioHasLoaded && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[rgba(43,39,35,.55)]">
                  <div className="max-w-sm rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-cream)] p-6 text-center shadow-[4px_5px_0_var(--paper-ink)]">
                    <h3 className="mb-3 font-paper-serif text-xl font-bold">Ready to play?</h3>
                    <p className="mb-4 text-sm text-[var(--paper-muted)]">
                      Press{' '}
                      <span className="font-paper-mono font-bold text-[var(--paper-accent-deep)]">
                        SPACE
                      </span>{' '}
                      to start the rhythm game.
                    </p>
                    <div className="mt-2 animate-bounce">
                      <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] border-dashed border-[var(--paper-accent-strong)] bg-[var(--paper-yellow-soft)]">
                        <KeyIcon className="h-5 w-5 text-[var(--paper-accent)]" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!audioHasLoaded && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[rgba(43,39,35,.55)]">
                  <div className="flex flex-col items-center">
                    {audioLoadError ? (
                      <p className="max-w-xs text-center font-paper-sans text-base text-[var(--paper-cream)]">
                        The audio didn&apos;t load. Refresh the page to try again.
                      </p>
                    ) : (
                      <>
                        <div className="mb-4 h-10 w-10 animate-spin rounded-full border-[3px] border-[var(--paper-yellow)] border-t-transparent"></div>
                        <p className="font-paper-sans text-base text-[var(--paper-cream)]">
                          Loading audio…
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="w-full px-1">
              <div className="mb-1 flex items-center justify-between font-paper-mono text-[10px] uppercase tracking-[.1em] text-[var(--paper-muted-2)]">
                <span>{formatTime(elapsedTime)}</span>
                <span>
                  {gameIsActive
                    ? `${Math.floor((elapsedTime / game.songDuration) * 100)}%`
                    : 'Progress'}
                </span>
                <span>{formatTime(game.songDuration)}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-full border border-[var(--paper-line)] bg-[rgba(60,44,24,.12)]">
                <div
                  className="relative h-full rounded-full bg-[var(--paper-yellow)]"
                  style={{
                    width: `${(elapsedTime / game.songDuration) * 100}%`,
                    transition: 'width 0.3s linear',
                  }}
                >
                  <div className="absolute inset-0 animate-pulse">
                    <div className="h-full w-8 -translate-x-4 bg-white/40 blur-md"></div>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-end gap-2">
                <SpeakerWaveIcon className="h-4 w-4 text-[var(--paper-muted-2)]" />
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(event) => setVolume(Number(event.target.value))}
                  aria-label="Volume"
                  className="h-1.5 w-32 cursor-pointer accent-[var(--paper-accent-strong)]"
                />
                <span className="w-9 text-right font-paper-mono text-[10px] uppercase tracking-[.1em] text-[var(--paper-muted-2)]">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>

            <audio
              ref={audioRef}
              src="/The%20Boy%20Who%20Fought%20the%20Lightning.mp3"
              preload="auto"
              onLoadedData={markAudioReady}
              onCanPlay={markAudioReady}
              onCanPlayThrough={markAudioReady}
              onError={() => setAudioLoadError(true)}
            />

            {showTutorial && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
                <div className="w-full max-w-lg rounded-[3px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-cream)] p-6 shadow-[4px_5px_0_var(--paper-ink)]">
                  <h3 className="mb-4 font-paper-serif text-xl font-bold">
                    How to play Rhythm Dots
                  </h3>

                  <div className="space-y-3 text-sm text-[var(--paper-muted)]">
                    <p>
                      1. Press{' '}
                      <span className="font-paper-mono font-bold text-[var(--paper-accent-deep)]">
                        SPACE
                      </span>{' '}
                      to start the game
                    </p>
                    <p>2. Dots travel down the lines toward the circles</p>
                    <p>3. When a dot reaches a circle, press its key on your keyboard</p>
                    <p>4. Build up your streak for bonus points</p>
                    <p>5. Complete daily quests and unlock achievements</p>

                    <div className="pt-4">
                      <button
                        onClick={() => setShowTutorial(false)}
                        className="-rotate-[0.6deg] rounded-[4px] border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] px-6 py-2 font-paper-mono text-[12px] font-bold uppercase tracking-[.12em] shadow-[3px_4px_0_var(--paper-ink)] transition-transform hover:-translate-y-px"
                      >
                        Got it!
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative overflow-hidden rounded-[3px] bg-[var(--paper-cream)] p-5 shadow-[0_10px_20px_-16px_rgba(60,44,24,.35),0_2px_0_rgba(60,44,24,.08)] md:col-span-2">
                <div className="relative z-10 space-y-4 text-sm text-[var(--paper-muted)]">
                  <div className="flex justify-between font-paper-mono text-[10px] uppercase tracking-[.1em] text-[var(--paper-muted-2)]">
                    <p>Credit to Jack Eisenmann (aka ostracod)</p>
                    <p>Music by Soleviio</p>
                  </div>

                  <p className="font-medium text-[var(--paper-accent-deep)]">
                    Hit the corresponding key when a dot lands in a circle.
                  </p>

                  <div className="mx-auto grid max-w-md grid-rows-2 gap-2">
                    {keyMap.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex justify-center gap-1">
                        {row.map((key, keyIndex) => (
                          <div
                            key={keyIndex}
                            className={`flex h-8 w-8 items-center justify-center rounded-[2px] border font-paper-mono text-xs font-bold ${
                              keyIndex < 4
                                ? 'border-[var(--paper-accent-strong)] bg-[var(--paper-yellow-soft)] text-[var(--paper-accent-deep)]'
                                : 'border-[var(--paper-line)] bg-[var(--paper-hero)] text-[var(--paper-muted)]'
                            }`}
                          >
                            {key}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap justify-center gap-3">
                    <div className="flex items-center rounded-[2px] border border-dashed border-[rgba(60,44,24,.45)] px-3 py-2 text-[var(--paper-muted)]">
                      <KeyIcon className="mr-2 h-4 w-4 text-[var(--paper-accent)]" />
                      <span>
                        <b>SPACE</b> to start
                      </span>
                    </div>
                    <div className="flex items-center rounded-[2px] border border-dashed border-[rgba(60,44,24,.45)] px-3 py-2 text-[var(--paper-muted)]">
                      <KeyIcon className="mr-2 h-4 w-4 text-[var(--paper-accent)]" />
                      <span>
                        <b>ESC</b> to reset
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[3px] bg-[var(--paper-cream)] p-5 shadow-[0_10px_20px_-16px_rgba(60,44,24,.35),0_2px_0_rgba(60,44,24,.08)]">
                <div className="relative z-10 space-y-4">
                  <div className="mb-4">
                    <h3 className="mb-2 font-paper-mono text-[11px] uppercase tracking-[.14em] text-[var(--paper-muted-2)]">
                      Difficulty
                    </h3>
                    <div className="flex justify-center gap-2">
                      {['easy', 'normal', 'hard'].map((level) => (
                        <button
                          key={level}
                          onClick={() => !gameIsActive && setDifficulty(level)}
                          className={`rounded-[2px] px-3 py-1.5 font-paper-mono text-[10px] uppercase tracking-[.08em] capitalize transition-colors ${
                            difficulty === level
                              ? 'border-[1.5px] border-[var(--paper-ink)] bg-[var(--paper-yellow)] font-bold shadow-[2px_2px_0_var(--paper-ink)]'
                              : 'border border-dashed border-[rgba(60,44,24,.45)] text-[var(--paper-muted)] hover:bg-[var(--paper-yellow-soft)]'
                          } ${gameIsActive ? 'cursor-not-allowed opacity-50' : ''}`}
                          disabled={gameIsActive}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 font-paper-mono text-[11px] uppercase tracking-[.14em] text-[var(--paper-muted-2)]">
                      Daily Quest
                    </h3>

                    {dailyQuest && (
                      <div
                        className={`rounded-[2px] border p-3 ${
                          dailyQuest.completed
                            ? 'border-[#4f6b3a] bg-[#e8eeda]'
                            : 'border-[rgba(60,44,24,.4)] bg-[var(--paper-hero)]'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {dailyQuest.completed ? (
                            <CheckBadgeIcon className="mt-0.5 h-5 w-5 text-[#4f6b3a]" />
                          ) : (
                            <TrophyIcon className="mt-0.5 h-5 w-5 text-[var(--paper-accent)]" />
                          )}
                          <div className="text-left">
                            <p className="text-xs text-[var(--paper-muted)]">
                              {dailyQuest.description}
                            </p>
                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-[var(--paper-line)] bg-[rgba(60,44,24,.1)]">
                              <div
                                className="h-full rounded-full bg-[var(--paper-yellow)]"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    ((dailyQuest.description.includes('streak')
                                      ? maxPLevel
                                      : pLevel) /
                                      dailyQuest.goal) *
                                      100,
                                  )}%`,
                                }}
                              ></div>
                            </div>
                            <div className="mt-1 flex justify-between font-paper-mono text-[9px] text-[var(--paper-muted-2)]">
                              <span>0</span>
                              <span>{dailyQuest.goal}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="mb-2 font-paper-mono text-[11px] uppercase tracking-[.14em] text-[var(--paper-muted-2)]">
                      Achievements
                    </h3>

                    <div className="grid grid-cols-2 gap-2">
                      <div
                        className={`rounded-[2px] border p-2 ${
                          achievements.firstPlay
                            ? 'border-[var(--paper-accent-strong)] bg-[var(--paper-yellow-soft)]'
                            : 'border-dashed border-[rgba(60,44,24,.35)] bg-[var(--paper-hero)]'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <SparklesIcon
                            className={`h-5 w-5 ${
                              achievements.firstPlay
                                ? 'text-[var(--paper-accent)]'
                                : 'text-[var(--paper-muted-2)] opacity-50'
                            }`}
                          />
                          <p className="mt-1 font-paper-mono text-[9px] uppercase tracking-[.06em] text-[var(--paper-muted-2)]">
                            First Play
                          </p>
                        </div>
                      </div>

                      <div
                        className={`rounded-[2px] border p-2 ${
                          achievements.reach10PLevel
                            ? 'border-[var(--paper-accent-strong)] bg-[var(--paper-yellow-soft)]'
                            : 'border-dashed border-[rgba(60,44,24,.35)] bg-[var(--paper-hero)]'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <CheckBadgeIcon
                            className={`h-5 w-5 ${
                              achievements.reach10PLevel
                                ? 'text-[var(--paper-accent)]'
                                : 'text-[var(--paper-muted-2)] opacity-50'
                            }`}
                          />
                          <p className="mt-1 font-paper-mono text-[9px] uppercase tracking-[.06em] text-[var(--paper-muted-2)]">
                            10 P-Level
                          </p>
                        </div>
                      </div>

                      <div
                        className={`rounded-[2px] border p-2 ${
                          achievements.reach25PLevel
                            ? 'border-[var(--paper-accent-strong)] bg-[var(--paper-yellow-soft)]'
                            : 'border-dashed border-[rgba(60,44,24,.35)] bg-[var(--paper-hero)]'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <TrophyIcon
                            className={`h-5 w-5 ${
                              achievements.reach25PLevel
                                ? 'text-[var(--paper-accent)]'
                                : 'text-[var(--paper-muted-2)] opacity-50'
                            }`}
                          />
                          <p className="mt-1 font-paper-mono text-[9px] uppercase tracking-[.06em] text-[var(--paper-muted-2)]">
                            25 P-Level
                          </p>
                        </div>
                      </div>

                      <div
                        className={`rounded-[2px] border p-2 ${
                          achievements.reach50PLevel
                            ? 'border-[var(--paper-accent-strong)] bg-[var(--paper-yellow-soft)]'
                            : 'border-dashed border-[rgba(60,44,24,.35)] bg-[var(--paper-hero)]'
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <FireIcon
                            className={`h-5 w-5 ${
                              achievements.reach50PLevel
                                ? 'text-[var(--paper-accent)]'
                                : 'text-[var(--paper-muted-2)] opacity-50'
                            }`}
                          />
                          <p className="mt-1 font-paper-mono text-[9px] uppercase tracking-[.06em] text-[var(--paper-muted-2)]">
                            50 P-Level
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <button
                      onClick={() => setShowTutorial(true)}
                      className="w-full rounded-[2px] border-[1.5px] border-dashed border-[rgba(60,44,24,.5)] py-2 font-paper-mono text-[10px] font-bold uppercase tracking-[.1em] text-[var(--paper-muted)] transition-colors hover:border-[var(--paper-accent-strong)] hover:bg-[var(--paper-yellow-soft)]"
                    >
                      How to Play
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 lg:w-80 lg:min-w-80 lg:max-w-80">
          <div className="sticky top-20 max-h-[calc(100vh-8rem)] overflow-hidden rounded-[3px] bg-[var(--paper-cream)] shadow-[0_14px_26px_-14px_rgba(60,44,24,.3),0_2px_0_rgba(60,44,24,.1)]">
            <div className="sticky top-0 border-b border-dashed border-[var(--paper-line)] bg-[var(--paper-cream)] p-3">
              <div className="flex items-center gap-2">
                <TrophyIcon className="h-4 w-4 text-[var(--paper-accent)]" />
                <h2 className="font-paper-serif text-base font-bold">Leaderboard</h2>
                <span className="ml-auto font-paper-mono text-[9px] uppercase tracking-[.1em] text-[var(--paper-muted-2)]">
                  {isLoadingLeaderboard ? 'Updating…' : 'Live'}
                </span>
              </div>
            </div>

            <div className="overflow-y-auto p-3" style={{ maxHeight: '60vh' }}>
              {isLoadingLeaderboard ? (
                <div className="flex justify-center py-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--paper-accent)] border-t-transparent" />
                </div>
              ) : (
                <div className="space-y-2">{renderLeaderboard()}</div>
              )}

              {!currentUser && (
                <div className="mt-3 rounded-[2px] border border-dashed border-[rgba(60,44,24,.4)] bg-[var(--paper-hero)] p-2">
                  <p className="text-xs text-[var(--paper-muted)]">
                    Sign in to appear on the leaderboard
                  </p>
                </div>
              )}

              <div className="mt-3 flex items-center justify-between font-paper-mono text-[9px] uppercase tracking-[.08em] text-[var(--paper-muted-2)]">
                <span>{new Date().toLocaleDateString()}</span>
                <button
                  onClick={fetchLeaderboardData}
                  className="flex items-center text-[var(--paper-accent)] hover:text-[var(--paper-ink)]"
                >
                  <ArrowTrendingUpIcon className="mr-1 h-3 w-3" />
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RyGame;
