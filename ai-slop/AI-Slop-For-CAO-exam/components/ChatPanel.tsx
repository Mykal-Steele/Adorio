import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, Problem } from "../types";
import { streamGeminiResponse } from "../geminiService";
import mdContent from '../CAOALLMAT_FINAL.md?raw';
import {
  Send,
  Bot,
  User,
  Sparkles,
  BrainCircuit,
  Target,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import Fuse from "fuse.js";

interface ChatPanelProps {
  context: string;
  problemTitle: string;
  selectedProblem: Problem;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  context,
  problemTitle,
  selectedProblem,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init",
      role: "model",
      text: "I am your exam tutor. If the definitions above are unclear, ask me to explain them in simpler terms.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const [largeInfo, setLargeInfo] = useState("");
  const [panelWidth, setPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newWidth = window.innerWidth - e.clientX;
        setPanelWidth(Math.max(200, Math.min(800, newWidth)));
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

  useEffect(() => {
    const text = mdContent;
    // sections are split by ---, each with a ## title and a **Keywords:** line
    const rawChunks = text.split("---").filter((ch) => ch.trim());
    const parsedChunks = rawChunks.map((raw) => {
      const lines = raw.trim().split("\n");
      const title = lines[0].startsWith("## ") ? lines[0].substring(3) : "";
      const keywordsLine = lines.find((l) =>
        l.startsWith("**Keywords:** ")
      );
      const keywords = keywordsLine
        ? keywordsLine
            .substring(14)
            .split(",")
            .map((k) => k.trim())
        : [];
      const contentStart =
        lines.findIndex((l) => l.startsWith("**Keywords:** ")) + 1;
      const content = lines.slice(contentStart).join("\n").trim();
      return { title, keywords, content };
    });
    setLargeInfo(
      parsedChunks
        .map(
          (c) =>
            `## ${c.title}\n\nKeywords: ${c.keywords.join(", ")}\n\n${
              c.content
            }`
        )
        .join("\n\n---\n\n")
    );
  }, []);

  useEffect(() => {
    setMessages([
      {
        id: "init",
        role: "model",
        text: `Viewing: "${problemTitle}". \nAsk me to verify your steps.\nI will use the resources from our CAO class to answer.`,
      },
    ]);
  }, [problemTitle]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.parentElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const chunkText = (text: string): string[] => {
    return text.split("\n\n---\n\n").filter((chunk) => chunk.trim().length > 0);
  };

  const chunkProblem = (problem: Problem): string[] => {
    const allText = `${problem.content}\n${problem.definitions
      .map((d) => `${d.term}: ${d.definition}`)
      .join("\n")}\n${problem.solution}`;
    return allText
      .split(/[.!?]\s+|\n+/)
      .filter((chunk) => chunk.trim().length > 10);
  };

  const retrieveRelevantContext = (
    query: string,
    chunks: string[],
    problem: Problem | null
  ): { context: string; indices: number[] } => {
    // the problem itself is already in the main context, so only the notes get searched
    const searchChunks = chunks;

    if (searchChunks.length === 0) {
      return { context: "", indices: [] };
    }

    // fuzzy match catches typos and near misses
    const fuse = new Fuse(searchChunks, {
      includeScore: true,
      threshold: 0.6,
      keys: [],
      ignoreLocation: true,
    });
    const fuseResults = fuse.search(query);

    // keyword overlap favors chunks dense with the query terms
    const keywordScores = calculateKeywordOverlapScore(query, searchChunks);

    const finalScores = new Map<string, number>();

    for (const [chunk, score] of keywordScores.entries()) {
      if (score > 0) {
        finalScores.set(chunk, score * 5);
      }
    }

    for (const result of fuseResults) {
      const chunk = result.item;
      // Fuse gives 0 for a perfect match and 1 for none, so flip it
      const fuseQuality = 1 - result.score;

      const fuseWeight = fuseQuality * 10;

      const currentScore = finalScores.get(chunk) || 0;
      finalScores.set(chunk, currentScore + fuseWeight);
    }

    const rankedChunks = Array.from(finalScores.entries())
      .filter(([, score]) => score > 5.0)
      .sort((a, b) => b[1] - a[1])
      .map(([chunk]) => chunk);

    const selectedChunks = rankedChunks.slice(0, 5);

    const indices = selectedChunks.map((chunk) => searchChunks.indexOf(chunk));

    console.log("--- Final Selection Stats ---");
    console.log(`Query: ${query}`);
    console.log(`Total Chunks Considered: ${searchChunks.length}`);
    console.log(`Selected Chunks Count: ${selectedChunks.length}`);
    console.log(
      "Top 3 ranked scores (Chunk, Score):",
      Array.from(finalScores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([chunk, score]) => ({
          score: score.toFixed(2),
          preview: chunk.substring(0, 50),
        }))
    );

    return { context: selectedChunks.join("\n\n"), indices };
  };

  const calculateKeywordOverlapScore = (
    query: string,
    chunks: string[]
  ): Map<string, number> => {
    const queryTerms = query
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 2);
    const scoreMap = new Map<string, number>();

    const escapeRegExp = (string: string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    for (const chunk of chunks) {
      let score = 0;
      const lowerChunk = chunk.toLowerCase();

      for (const term of queryTerms) {
        const escapedTerm = escapeRegExp(term);
        const regex = new RegExp(`\\b${escapedTerm}\\b`, "g");
        const matches = lowerChunk.match(regex);

        if (matches) {
          score += matches.length;
        }
      }

      // divide by log(length) so long chunks don't win just by being long
      if (score > 0 && lowerChunk.length > 50) {
        score *= 1 / Math.log(lowerChunk.length);
      }

      scoreMap.set(chunk, score);
    }
    return scoreMap;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const chunks = chunkText(largeInfo);
    console.log("Large info length:", largeInfo.length);
    console.log("Chunks length:", chunks.length);
    const { context: retrievedContext, indices } = retrieveRelevantContext(
      input,
      chunks,
      selectedProblem
    );
    const chunkIndices = indices.join(", ");
    const fullContext = retrievedContext
      ? `${context}\n\nRetrieved Info:\n${retrievedContext}`
      : context;

    const modelMsgId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: modelMsgId, role: "model", text: "", isThinking: useThinking },
    ]);

    let accumulatedText = "";

    await streamGeminiResponse(
      [...messages, userMsg],
      fullContext,
      (chunk) => {
        accumulatedText += chunk;
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === modelMsgId ? { ...msg, text: accumulatedText } : msg
          )
        );
      },
      useThinking
    );

    setIsLoading(false);
  };

  return (
    <div
      className='flex flex-shrink-0 shadow-lg z-10'
      style={{ width: `${panelWidth}px` }}
    >
      <div
        className='w-1 bg-gray-300 dark:bg-gray-600 cursor-col-resize hover:bg-gray-400 dark:hover:bg-gray-500'
        onMouseDown={() => setIsResizing(true)}
      />
      <div className='flex-1 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 h-screen flex flex-col'>
        <div className='p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'>
          <div className='flex justify-between items-center mb-1'>
            <div>
              <h3 className='font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2 text-sm'>
                <Bot className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                Tutor
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">running on Gemini</p>
            </div>
            <button
              onClick={() => setUseThinking(!useThinking)}
              className={`flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 rounded border transition-colors ${
                useThinking
                  ? "bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300"
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
              }`}
            >
              <BrainCircuit className='w-3 h-3' />
              {useThinking ? "Reasoning On" : "Reasoning Off"}
            </button>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-800'>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`max-w-[90%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600"
                }`}
              >
                <div className='whitespace-pre-wrap font-sans'>
                  <ReactMarkdown
                    remarkPlugins={[remarkMath, remarkGfm, remarkBreaks]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      p: ({ children }) => <p className='mb-0'>{children}</p>,
                      code: ({ children }) => (
                        <code className='bg-gray-200 dark:bg-gray-600 px-1 rounded text-sm'>
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className='bg-gray-200 dark:bg-gray-600 p-2 rounded text-sm overflow-x-auto'>
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                </div>
                {msg.role === "model" && msg.text === "" && (
                  <span className='italic text-xs text-gray-400 dark:text-gray-500'>
                    Thinking...
                  </span>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className='p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'>
          <div className='relative'>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder='Type a question...'
              className='w-full bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded border border-gray-300 dark:border-gray-600 p-2 pr-10 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none h-12 text-sm'
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className='absolute right-2 top-2 p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded disabled:opacity-50'
            >
              <Send className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
