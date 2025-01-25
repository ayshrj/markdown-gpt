"use client";

import React, { useState, useMemo, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Prism as SyntaxHighlighter,
  SyntaxHighlighterProps,
} from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"; // Correct ESM import
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize"; // Added for security
import IconProvider from "@/lib/iconProvider";

// Define custom props for the code component
interface CustomCodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const MarkdownEditor: React.FC = () => {
  // Initialize state with empty string
  const [markdown, setMarkdown] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<string>("full");
  const [currentPage, setCurrentPage] = useState(0);

  // Ref for the hidden file input
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    setCurrentPage(0); // Reset to first page on markdown change
  };

  const sections = useMemo(() => {
    return markdown.split("---").map((section) => section.trim());
  }, [markdown]);

  // Handler to trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handler for file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      // Validate file type
      if (file.type !== "text/plain") {
        alert("Please upload a valid .txt file.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result;
        if (typeof text === "string") {
          setMarkdown(text);
          setCurrentPage(0); // Reset to first page after upload
        } else {
          alert("Failed to read the file.");
        }
      };
      reader.onerror = () => {
        alert("An error occurred while reading the file.");
      };
      reader.readAsText(file);
    }
  };

  // Styles close to ChatGPT's typical heading sizes
  const customTypographyStyles = {
    h1: {
      fontSize: "1.875rem", // ~30px
      fontWeight: 600,
      margin: "1rem 0 0.75rem",
      lineHeight: "1.3",
    },
    h2: {
      fontSize: "1.5rem", // ~24px
      fontWeight: 600,
      margin: "1rem 0 0.75rem",
      lineHeight: "1.3",
    },
    h3: {
      fontSize: "1.25rem", // ~20px (as requested)
      fontWeight: 600,
      margin: "1rem 0 0.5rem",
      lineHeight: "1.3",
    },
    h4: {
      fontSize: "1.125rem", // ~18px
      fontWeight: 600,
      margin: "1rem 0 0.5rem",
      lineHeight: "1.3",
    },
    h5: {
      fontSize: "1rem", // 16px
      fontWeight: 600,
      margin: "0.75rem 0 0.5rem",
      lineHeight: "1.3",
    },
    h6: {
      fontSize: "0.875rem", // 14px
      fontWeight: 600,
      margin: "0.75rem 0 0.5rem",
      lineHeight: "1.3",
    },
  };

  // Define the custom components for ReactMarkdown
  const components: Components = {
    h1: (props) => <h1 style={customTypographyStyles.h1} {...props} />,
    h2: (props) => <h2 style={customTypographyStyles.h2} {...props} />,
    h3: (props) => <h3 style={customTypographyStyles.h3} {...props} />,
    h4: (props) => <h4 style={customTypographyStyles.h4} {...props} />,
    h5: (props) => <h5 style={customTypographyStyles.h5} {...props} />,
    h6: (props) => <h6 style={customTypographyStyles.h6} {...props} />,

    // Code blocks
    code: ({ inline, className, children, ...props }: CustomCodeProps) => {
      const match = /language-(\w+)/.exec(className || "");
      if (!inline && match) {
        // Define the correct type for the style
        const syntaxStyle: SyntaxHighlighterProps["style"] = vscDarkPlus;

        return (
          <SyntaxHighlighter
            style={syntaxStyle as any}
            language={match[1]}
            PreTag="div"
            className="!bg-[#0D0D0D] overflow-x-auto rounded" // Allows horizontal scrolling
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        );
      } else {
        return (
          <code
            className={`${className} inline-code break-words whitespace-pre-wrap`}
            {...props}
          >
            {children}
          </code>
        );
      }
    },

    // Lists (unordered, ordered)
    ul: ({ children, ...props }) => (
      <ul className="list-disc pl-6 mb-4 break-words" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal pl-6 mb-4 break-words" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="mb-1 break-words" {...props}>
        {children}
      </li>
    ),
    p: ({ children, ...props }) => (
      <p className="break-words" {...props}>
        {children}
      </p>
    ),
    // Add other components as needed
  };

  return (
    <div
      className={`container min-w-full flex justify-center min-h-[100dvh] transition-all relative ${
        markdown.length > 0 ? "" : ""
      }`}
    >
      <div className="w-full max-w-3xl bg-gpt-background border-none max-md:px-4">
        <div className="min-h-[100dvh] relative pt-4 flex flex-col">
          <div
            className={`flex w-full cursor-text flex-col rounded-3xl pl-2 pr-4 focus:outline-none transition-colors contain-inline-size bg-gpt-input-background min-h-[88px] max-h-[216px] outline-none text-base border-none items-center ${
              markdown.length > 0 ? "" : "absolute top-1/2 -translate-y-1/2"
            }`}
          >
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
            />
            <div className="min-h-[44px] max-h-[44px] flex w-full justify-between items-center px-2">
              <span className="flex gap-4">
                <IconProvider
                  onClick={handleUploadClick}
                  type="Clip"
                  strokeWidth={0.1}
                />
                {previewMode === "full" ? (
                  <IconProvider
                    onClick={() => setPreviewMode("paginated")}
                    className="cursor-pointer"
                    type="Full"
                  />
                ) : (
                  <IconProvider
                    onClick={() => setPreviewMode("full")}
                    className="cursor-pointer"
                    type="Pagination"
                  />
                )}

                <input
                  type="file"
                  accept=".txt"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileChange}
                />
              </span>

              {markdown && (
                <IconProvider
                  type="Clear"
                  onClick={() => {
                    setMarkdown("");
                    setCurrentPage(0);
                  }}
                  className="fill-gpt-foreground stroke-none h-8 w-8 translate-x-3 cursor-pointer"
                />
              )}
            </div>
          </div>

          <div className="prose dark:prose-invert max-w-none break-words mt-2 pb-20">
            {" "}
            {/* Added pb-20 */}
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
                  rehypePlugins={[rehypeRaw, rehypeSanitize]} // Added rehypeSanitize for security
                  components={components}
                >
                  {sections[currentPage]}
                </ReactMarkdown>
                {markdown.length > 0 && (
                  <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-3xl px-4 bg-gpt-background">
                    <div className="flex justify-between items-center py-2 rounded shadow">
                      <button
                        className={`bg-gpt-foreground text-gpt-background px-4 py-2 rounded text-sm ${
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
                      <div className="text-center flex items-center justify-end">
                        {currentPage + 1} of {sections.length}
                      </div>
                      <button
                        className={`bg-gpt-foreground text-gpt-background px-4 py-2 rounded text-sm ${
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
    </div>
  );
};

export default MarkdownEditor;
