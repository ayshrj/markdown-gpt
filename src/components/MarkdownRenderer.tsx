"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Prism as SyntaxHighlighter,
  SyntaxHighlighterProps,
} from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import IconProvider from "@/lib/iconProvider";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "typeface-source-code-pro";

interface CustomCodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const MarkdownEditor: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<string>("paginated");
  const [currentPage, setCurrentPage] = useState(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [pasted, setPasted] = useState<boolean>(false);
  const [copiedCodeContent, setCopiedCodeContent] = useState<string | null>(
    null
  );

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMarkdown = localStorage.getItem("markdown-content");
      if (savedMarkdown) {
        setMarkdown(savedMarkdown);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("markdown-content", markdown);
    }
  }, [markdown]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    setCurrentPage(0);
  };

  const sections = useMemo(() => {
    return markdown.split("---").map((section) => section.trim());
  }, [markdown]);

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      if (file.type !== "text/plain") {
        toast.info("Please upload a valid .txt file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
          setMarkdown(text);
          setCurrentPage(0);
        } else {
          toast.error("Failed to read the file.");
        }
      };
      reader.onerror = () => {
        toast.error("An error occurred while reading the file.");
      };
      reader.readAsText(file);
    }
  };

  const handleCopy = () => {
    if (!markdown) return;

    navigator.clipboard
      .writeText(markdown)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Failed to copy the content.");
      });
  };

  const handleCodeCopy = (code: string) => {
    if (!code) return;

    navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopiedCodeContent(code);
        setTimeout(() => {
          setCopiedCodeContent(null);
        }, 2000);
      })
      .catch(() => {
        toast.error("Failed to copy the code block.");
      });
  };

  const handlePaste = async () => {
    if (!navigator.clipboard) {
      toast.error("Clipboard API not supported in this browser.");
      return;
    }

    try {
      const clipboardText = await navigator.clipboard.readText();

      if (clipboardText) {
        setMarkdown((prevMarkdown) => `${prevMarkdown}\n${clipboardText}`);
        setCurrentPage(0);

        // if (textareaRef.current) {
        //   const { selectionStart, selectionEnd } = textareaRef.current;
        //   const before = markdown.substring(0, selectionStart);
        //   const after = markdown.substring(selectionEnd);
        //   setMarkdown(`${before}${clipboardText}${after}`);
        //   // Optionally, set the cursor position after the pasted text
        //   setTimeout(() => {
        //     textareaRef.current?.focus();
        //     textareaRef.current?.setSelectionRange(
        //       selectionStart + clipboardText.length,
        //       selectionStart + clipboardText.length
        //     );
        //   }, 0);
        // }

        setPasted(true);
        setTimeout(() => setPasted(false), 2000);
      } else {
        toast.info("Clipboard is empty or does not contain text.");
      }
    } catch (error) {
      console.error("Failed to read clipboard contents:", error);
      toast.error("Failed to paste content from clipboard.");
    }
  };

  // Adjusted Typography Styles for Better Line Spacing
  const customTypographyStyles = {
    h1: {
      fontSize: "2.25rem", // Slightly smaller than before
      fontWeight: 700,
      letterSpacing: "-0.04rem",
      margin: "0 0 2.25rem",
      lineHeight: "1.1111111",
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 600,
      margin: "2rem 0 1rem",
      lineHeight: "1.3333333",
    },
    h3: {
      fontSize: "1.25rem",
      fontWeight: 600,
      margin: "1rem 0 0.5rem",
      lineHeight: "1.6",
    },
    p: {
      fontSize: "1rem",
      margin: "0 0 0.5rem",
      lineHeight: "1.6",
    },
    li: {
      margin: "0.5rem 0",
      padding: "0 0 0 0.375rem",
      lineHeight: "1.6",
    },
  };

  const components: Components = {
    h1: (props) => <h1 style={customTypographyStyles.h1} {...props} />,
    h2: (props) => <h2 style={customTypographyStyles.h2} {...props} />,
    h3: (props) => <h3 style={customTypographyStyles.h3} {...props} />,

    code: ({ inline, className, children, ...props }: CustomCodeProps) => {
      const match = /language-(\w+)/.exec(className || "");

      const language = match && match[1] ? match[1] : "";

      if (!inline && match) {
        const syntaxStyle: SyntaxHighlighterProps["style"] = vscDarkPlus;

        const codeContent = String(children).trim();
        const id = `code-${Buffer.from(codeContent).toString("base64")}`;

        return (
          <div className="bg-[#0D0D0D] overflow-x-auto rounded my-4">
            <div className="bg-[#232628] w-full flex min-h-9 px-4 justify-between items-center text-[#b9b3a9]">
              <div
                className="font-mono text-xs"
                style={{ fontFamily: '"Source Code Pro", monospace' }}
              >
                {language}
              </div>
              <div className="flex items-center rounded font-sans text-xs">
                <button
                  className="flex gap-1 items-center select-none py-1 focus:outline-none"
                  aria-label="Copy"
                  onClick={() => handleCodeCopy(codeContent)}
                  id={id}
                >
                  {copiedCodeContent === codeContent ? (
                    <>
                      <IconProvider
                        type="Check"
                        strokeWidth={0.1}
                        fill="currentColor"
                        size={12}
                      />
                      Copied
                    </>
                  ) : (
                    <>
                      <IconProvider
                        type="Copy"
                        strokeWidth={0.1}
                        fill="currentColor"
                        size={12}
                      />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
            <SyntaxHighlighter
              style={syntaxStyle as any}
              language={language}
              PreTag="div"
              id="codeblock"
              className="!bg-[#0D0D0D] overflow-x-auto rounded !p-4"
              {...props}
              customStyle={{ fontFamily: '"Source Code Pro", monospace' }}
            >
              {codeContent.replace(/\n$/, "")}
            </SyntaxHighlighter>
          </div>
        );
      } else {
        return (
          <code
            className={`${className} inline-code break-words whitespace-pre-wrap bg-[#323238] text-[#DCD9D4] rounded px-[4.8px] py-[2.4px]`}
            style={{
              boxDecorationBreak: "clone",
              WebkitBoxDecorationBreak: "clone", // For Safari support
              backgroundClip: "padding-box",
            }}
            {...props}
          >
            {children}
          </code>
        );
      }
    },

    // Custom Renderer for <hr />
    hr: () => {
      if (previewMode === "full") {
        return (
          <div className="py-[48px]">
            <hr />
          </div>
        );
      }
    },

    ul: ({ children, ...props }) => (
      <ul className="list-disc pl-5 mb-4 break-words" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal pl-5 mb-4 break-words" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="mb-1 break-words" {...props}>
        {children}
      </li>
    ),
    p: ({ children, ...props }) => (
      <p style={customTypographyStyles.p} className="break-words" {...props}>
        {children}
      </p>
    ),
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (previewMode === "paginated") {
      if (e.code === "ArrowLeft") {
        setCurrentPage((prevPage) => Math.max(0, prevPage - 1));
      } else if (e.code === "ArrowRight") {
        setCurrentPage((prevPage) =>
          Math.min(sections.length - 1, prevPage + 1)
        );
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [previewMode, sections.length]);

  return (
    <div className="container min-w-full flex justify-center min-h-screen transition-all relative">
      <div className="w-full max-w-3xl bg-gpt-background border-none max-md:px-4">
        <div className="min-h-screen relative pt-4 flex flex-col">
          <div
            className={`flex w-full cursor-text flex-col rounded-3xl px-4 focus:outline-none transition-colors bg-gpt-input-background min-h-[88px] max-h-[216px] outline-none text-base border-none items-center ${
              markdown.length > 0
                ? ""
                : "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            }`}
          >
            <div className="flex flex-col w-full min-h-full relative">
              {markdown.length < 1 && (
                <div className="absolute left-1/2 top-0 -translate-y-[90px] sm:-translate-y-[60px] font-semibold w-full flex justify-center -translate-x-1/2 pointer-events-none text-gpt-foreground text-3xl">
                  Write your markdown here.
                </div>
              )}
              <Textarea
                className="
                  flex w-full cursor-text flex-col mx-2 my-2 
                  max-h-[216px] outline-none border-none 
                  focus:ring-0 focus:outline-none focus:border-none 
                  bg-gpt-input-background placeholder:text-gpt-input-placeholder-foreground 
                  text-base resize-none break-words
                "
                value={markdown}
                onChange={handleChange}
                autoresize={true}
                placeholder="Message MarkdownGPT"
                style={{ lineHeight: "1.6" }} // Added line height for better readability
              />
              <div className="min-h-[44px] max-h-[44px] flex w-full justify-between items-center px-2 mt-1">
                <span className="flex gap-4">
                  <IconProvider
                    onClick={handleUploadClick}
                    type="Clip"
                    strokeWidth={0.1}
                    className="cursor-pointer"
                  />
                  {previewMode === "full" ? (
                    <IconProvider
                      onClick={() => setPreviewMode("paginated")}
                      className="cursor-pointer"
                      type="Full"
                      strokeWidth={0.1}
                      fill="currentColor"
                    />
                  ) : (
                    <IconProvider
                      onClick={() => setPreviewMode("full")}
                      className="cursor-pointer"
                      type="Pagination"
                      strokeWidth={0.1}
                      fill="currentColor"
                    />
                  )}
                  {pasted ? (
                    <IconProvider
                      type="Check"
                      strokeWidth={0.1}
                      fill="currentColor"
                    />
                  ) : (
                    <IconProvider
                      type="Paste"
                      onClick={handlePaste}
                      className="cursor-pointer"
                      strokeWidth={0.1}
                      fill="currentColor"
                    />
                  )}
                  {markdown.length > 0 &&
                    (copied ? (
                      <IconProvider
                        type="Check"
                        strokeWidth={0.1}
                        fill="currentColor"
                      />
                    ) : (
                      <IconProvider
                        type="Copy"
                        onClick={handleCopy}
                        className={`cursor-pointer ${
                          markdown ? "" : "opacity-50 cursor-not-allowed"
                        }`}
                        strokeWidth={0.1}
                        fill="currentColor"
                      />
                    ))}

                  <input
                    type="file"
                    accept=".txt"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </span>

                {markdown && (
                  <div className="bg-gpt-foreground min-h-8 min-w-8 h-8 w-8 rounded-full text-gpt-background flex items-center justify-center translate-x-3 cursor-pointer">
                    <IconProvider
                      type="Clear"
                      onClick={() => {
                        setMarkdown("");
                        setCurrentPage(0);
                        if (typeof window !== "undefined") {
                          localStorage.removeItem("markdown-content");
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none break-words mt-4 pb-20">
            {previewMode === "full" ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                components={components}
              >
                {markdown}
              </ReactMarkdown>
            ) : (
              <div className="flex flex-col min-h-full">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={components}
                >
                  {sections[currentPage]}
                </ReactMarkdown>
                {markdown.length > 0 && (
                  <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4 bg-gpt-background">
                    <div className="flex justify-between items-center py-2 rounded shadow">
                      <button
                        className={`bg-gpt-foreground text-gpt-background px-4 py-2 rounded-full text-sm ${
                          currentPage === 0
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gpt-foreground/80"
                        }`}
                        onClick={() =>
                          setCurrentPage(Math.max(0, currentPage - 1))
                        }
                        disabled={currentPage === 0}
                      >
                        Previous
                      </button>
                      <div className="text-center text-xs flex items-center justify-end">
                        {currentPage + 1} of {sections.length}
                      </div>
                      <button
                        className={`bg-gpt-foreground text-gpt-background px-4 py-2 rounded-full text-sm ${
                          currentPage === sections.length - 1
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gpt-foreground/80"
                        }`}
                        onClick={() =>
                          setCurrentPage(
                            Math.min(sections.length - 1, currentPage + 1)
                          )
                        }
                        disabled={currentPage === sections.length - 1}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Toast Container for Notifications */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
};

export default MarkdownEditor;
