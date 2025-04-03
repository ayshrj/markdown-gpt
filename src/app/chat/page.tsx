"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import "react-toastify/dist/ReactToastify.css";
import "typeface-source-code-pro";
import IconProvider from "@/lib/iconProvider";

/** Each piece of streamed content. */
type Chunk = {
  output: string;
  time: string;
  isFinalReply: boolean;
};

/** A single message can be from 'user' or 'assistant' and contain multiple chunks. */
type Message = {
  role: "user" | "assistant";
  content: Chunk[];
};

interface CustomCodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function ChatWithStreaming() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  /** Track which assistant messages have their partial output expanded. */
  const [expandedMap, setExpandedMap] = useState<{ [index: number]: boolean }>(
    {}
  );

  const controllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /** Repeated "..." effect when streaming is in progress. */
  const [thinkingDots, setThinkingDots] = useState("");
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (isLoading) {
      let dotCount = 0;
      intervalId = setInterval(() => {
        dotCount = (dotCount % 3) + 1;
        setThinkingDots(".".repeat(dotCount));
      }, 500);
    } else {
      setThinkingDots("");
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isLoading]);

  function handleCodeCopy(code: string) {
    navigator.clipboard
      .writeText(code)
      .then(() => {
        /* Successfully copied */
      })
      .catch(() => {
        alert("Failed to copy the code block.");
      });
  }

  /**
   * Example function to do extra post-processing,
   * converting recognized patterns to Markdown code blocks.
   */
  function postProcessContent(raw: string): string {
    // Mark recognized SQL queries
    const step1 = raw.replace(
      /valid query:\s*((?:.|\n)*)/g,
      (_m, group1) => `\`\`\`sql\n${group1.trim()}\n\`\`\``
    );
    // For triple-backticks that don't specify language, switch to JSON:
    const step2 = step1.replace(/```(?!sql)/g, "```json");
    return step2;
  }

  const customMarkdownComponents: Components = {
    h1: (props: CustomCodeProps) => (
      <h1
        style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 1rem" }}
        {...props}
      />
    ),
    h2: (props: CustomCodeProps) => (
      <h2
        style={{
          fontSize: "1.25rem",
          fontWeight: 600,
          margin: "1rem 0 0.5rem",
        }}
        {...props}
      />
    ),
    h3: (props: CustomCodeProps) => (
      <h3
        style={{
          fontSize: "1.125rem",
          fontWeight: 600,
          margin: "1rem 0 0.5rem",
        }}
        {...props}
      />
    ),
    p: ({ children, ...props }: CustomCodeProps) => (
      <p
        style={{ fontSize: "1rem", margin: "0 0 0.5rem", lineHeight: "1.6" }}
        className="break-words"
        {...props}
      >
        {children}
      </p>
    ),
    li: ({ children, ...props }: CustomCodeProps) => (
      <li
        style={{ margin: "0.5rem 0", lineHeight: "1.6" }}
        className="break-words"
        {...props}
      >
        {children}
      </li>
    ),
    ul: ({ children, ...props }: CustomCodeProps) => (
      <ul className="list-disc pl-5 mb-2 break-words" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: CustomCodeProps) => (
      <ol className="list-decimal pl-5 mb-2 break-words" {...props}>
        {children}
      </ol>
    ),
    code: ({ inline, className, children, ...props }: CustomCodeProps) => {
      const match = /language-(\w+)/.exec(className || "");
      const language = match?.[1] || "";
      if (!inline && match) {
        const codeContent = String(children).trim();
        return (
          <div className="bg-[#0D0D0D] overflow-x-auto rounded my-2">
            <div className="bg-[#232628] w-full flex min-h-9 px-4 justify-between items-center text-[#b9b3a9]">
              <div
                className="font-mono text-xs"
                style={{ fontFamily: '"Source Code Pro", monospace' }}
              >
                {language}
              </div>
              <button
                className="flex gap-1 items-center select-none py-1 focus:outline-none text-xs"
                onClick={() => handleCodeCopy(codeContent)}
              >
                <IconProvider
                  type="Copy"
                  strokeWidth={0.1}
                  fill="currentColor"
                  size={12}
                />
                Copy
              </button>
            </div>
            <SyntaxHighlighter
              language={language}
              style={vscDarkPlus as any}
              PreTag="div"
              className="!bg-[#0D0D0D] overflow-x-auto rounded !p-3"
              customStyle={{ fontFamily: '"Source Code Pro", monospace' }}
              {...props}
            >
              {codeContent.replace(/\n$/, "")}
            </SyntaxHighlighter>
          </div>
        );
      }
      return (
        <code
          className={`inline-code break-words whitespace-pre-wrap bg-[#323238] text-[#DCD9D4] rounded px-1 py-0.5 ${
            className ? className : ""
          }`}
          style={{
            boxDecorationBreak: "clone",
            WebkitBoxDecorationBreak: "clone",
            backgroundClip: "padding-box",
          }}
          {...props}
        >
          {children}
        </code>
      );
    },
  };

  async function sendMessage() {
    if (!userInput.trim() || isLoading) return;

    // Build a user message (always finalReply = true for the user).
    const userMsg: Message = {
      role: "user",
      content: [
        {
          output: userInput.trim(),
          time: new Date().toISOString(),
          isFinalReply: true,
        },
      ],
    };
    setMessages((prev) => [...prev, userMsg]);
    setUserInput("");

    // Add an empty assistant message, into which we'll stream chunks
    setMessages((prev) => [...prev, { role: "assistant", content: [] }]);

    setIsLoading(true);
    controllerRef.current = new AbortController();

    try {
      const modelMessages = [
        { role: "system", content: "You are a helpful AI assistant." },
        // Convert existing messages to the format the LLM expects
        ...messages.map((m) => ({
          role: m.role,
          content: m.content.map((c) => c.output).join(""),
        })),
        { role: "user", content: userMsg.content[0].output },
      ];

      const response = await fetch("https://llm.mdb.ai/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Bearer mdb_1yRoq9aDXQo4sLeSzKX6G4towrM6Cf0rdRyPwiaBR0fI",
        },
        body: JSON.stringify({
          model: "GameChange",
          stream: true,
          messages: modelMessages,
        }),
        signal: controllerRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error("Network error or empty response body!");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;

        if (value) {
          const chunkValue = decoder.decode(value);
          const lines = chunkValue.split("\n");

          for (let line of lines) {
            line = line.trim();
            if (line.startsWith("data:")) {
              const jsonStr = line.replace(/^data:\s*/, "").trim();
              if (!jsonStr || jsonStr === "[DONE]") continue;

              try {
                const parsed = JSON.parse(jsonStr);
                const deltaText = parsed.choices?.[0]?.delta?.content || "";
                const finishReason = parsed.choices?.[0]?.finish_reason;
                const isFinal = finishReason === "stop";

                if (deltaText || typeof finishReason !== "undefined") {
                  setMessages((prev) => {
                    if (!prev.length) return prev;
                    const lastIndex = prev.length - 1;
                    const lastMsg = prev[lastIndex];

                    if (lastMsg.role !== "assistant") return prev;

                    const newChunk: Chunk = {
                      output: deltaText,
                      time: new Date().toISOString(),
                      isFinalReply: isFinal,
                    };

                    const updatedMsg: Message = {
                      ...lastMsg,
                      content: [...lastMsg.content, newChunk],
                    };

                    return [...prev.slice(0, -1), updatedMsg];
                  });
                }
              } catch (err) {
                console.warn("Stream parse error:", line, err);
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Streaming error:", err);
      // If there's an error, show a short apology.
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: [
            {
              output: "Sorry, something went wrong.",
              time: new Date().toISOString(),
              isFinalReply: true,
            },
          ],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  /** Expand/collapse partial content for a given assistant message. */
  function toggleExpand(msgIndex: number) {
    setExpandedMap((prev) => ({
      ...prev,
      [msgIndex]: !prev[msgIndex],
    }));
  }

  /** Renders a single message bubble. */
  function renderMessage(msg: Message, idx: number) {
    const isUser = msg.role === "user";
    const bubbleBg = isUser
      ? "bg-gpt-user-chat-background text-gpt-user-chat-foreground items-end"
      : "bg-gpt-assistant-chat-background text-gpt-assistant-chat-foreground items-start";

    // Separate partial chunks vs. final chunks
    const partialChunks = msg.content.filter((c) => !c.isFinalReply);
    const finalChunks = msg.content.filter((c) => c.isFinalReply);

    // Combine them for display
    const partialOutput = partialChunks.map((c) => c.output).join("");
    const finalOutput = finalChunks.map((c) => c.output).join("");

    // If there's at least one partial chunk, we know we haven't concluded yet (unless the final chunk arrived later).
    const hasPartial = partialChunks.length > 0;
    const hasFinal = finalChunks.length > 0;

    // If the last chunk in the entire message is final => "AI completed thinking"
    // Otherwise => "AI is thinking..."
    const lastChunk = msg.content[msg.content.length - 1];
    const isLastChunkFinal = !!lastChunk?.isFinalReply;
    const collapsibleLabel = isLastChunkFinal
      ? "AI completed thinking"
      : "AI is thinking" + thinkingDots;

    return (
      <div
        key={idx}
        className={`flex w-full flex-col gap-1 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`relative max-w-[70%] rounded-3xl px-5 py-2 ${bubbleBg}`}
        >
          {/* Collapsible for partial output */}
          {hasPartial && (
            <div className="mb-2">
              <button
                onClick={() => toggleExpand(idx)}
                className="flex items-center gap-2 text-sm"
              >
                <IconProvider
                  type="ChevronDown"
                  strokeWidth={2}
                  stroke="currentColor"
                  size={16}
                  // If expanded, rotate the chevron
                  className={
                    !expandedMap[idx]
                      ? "transform -rotate-90 transition-transform"
                      : "transition-transform"
                  }
                />
                <span>{collapsibleLabel}</span>
              </button>
              {expandedMap[idx] && partialOutput && (
                <div className="mt-2 p-2 border-l border-gray-400 text-sm">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={customMarkdownComponents}
                  >
                    {postProcessContent(partialOutput)}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Final output (displayed plainly) */}
          {hasFinal && finalOutput && (
            <div>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={customMarkdownComponents}
              >
                {postProcessContent(finalOutput)}
              </ReactMarkdown>
            </div>
          )}

          {/* If the message has no partial or final (very rare edge-case) */}
          {!hasPartial && !hasFinal && (
            <div className="text-sm text-gray-500 italic">No content</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Chat messages container */}
      <div
        className="flex-1 overflow-y-auto p-4"
        style={{ marginBottom: "120px" }}
      >
        {messages.map((msg, i) => renderMessage(msg, i))}
        <div ref={messagesEndRef} />
      </div>

      {/* Sticky input area */}
      <div className="sticky bottom-0 left-0 right-0 px-4 py-2 bg-gpt-input-background">
        <div
          className="
            flex w-full cursor-text flex-col rounded-3xl px-4
            transition-colors bg-gpt-input-background min-h-[72px] max-h-[216px]
            text-base border-none items-center
          "
        >
          <textarea
            className="
              w-full cursor-text mx-2 my-2
              max-h-[216px] outline-none border-none
              focus:ring-0 focus:outline-none
              bg-gpt-input-background placeholder:text-gpt-input-placeholder-foreground
              text-base resize-none break-words
            "
            rows={1}
            placeholder="Type your message..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <div className="min-h-[44px] flex w-full justify-end items-center px-2 mb-2">
            <button
              onClick={sendMessage}
              disabled={!userInput.trim() || isLoading}
              className="text-sm px-4 py-1 rounded-full border bg-gpt-foreground text-white hover:bg-gpt-foreground/80 disabled:opacity-50"
            >
              {isLoading ? "Thinking..." : "Ask LLM"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
