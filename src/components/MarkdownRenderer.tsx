"use client";

import React, { useState, useMemo, useEffect } from "react";
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

// Define custom props for the code component
interface CustomCodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const STORAGE_KEY = "markdown-editor-content"; // Define a unique key for localStorage

const MarkdownEditor: React.FC = () => {
  // Initialize state with empty string; will be updated in useEffect
  const [markdown, setMarkdown] = useState<string>("");
  const [previewMode, setPreviewMode] = useState<string>("full");
  const [currentPage, setCurrentPage] = useState(0);

  // Load markdown from localStorage when the component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Ensure window is available
      try {
        const savedMarkdown = localStorage.getItem(STORAGE_KEY);
        if (savedMarkdown) {
          setMarkdown(savedMarkdown);
        }
      } catch (error) {
        console.error("Failed to load markdown from localStorage:", error);
      }
    }
  }, []);

  // Save markdown to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Ensure window is available
      try {
        localStorage.setItem(STORAGE_KEY, markdown);
      } catch (error) {
        console.error("Failed to save markdown to localStorage:", error);
      }
    }
  }, [markdown]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
    setCurrentPage(0); // Reset to first page on markdown change
  };

  const sections = useMemo(() => {
    return markdown.split("---").map((section) => section.trim());
  }, [markdown]);

  // Styles close to ChatGPT's typical heading sizes
  // (You can adjust margin, lineHeight, etc. to suit)
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
            className="!bg-[#0D0D0D]"
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        );
      } else {
        return (
          <code className={`${className} inline-code`} {...props}>
            {children}
          </code>
        );
      }
    },

    // Lists (unordered, ordered)
    ul: ({ children, ...props }) => (
      <ul className="list-disc pl-6 mb-4" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal pl-6 mb-4" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="mb-1" {...props}>
        {children}
      </li>
    ),
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gpt-background">
      <Card className="w-full bg-gpt-background border-none">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Markdown Editor</CardTitle>
            <Tabs
              value={previewMode}
              onValueChange={(value) => setPreviewMode(value)}
            >
              <TabsList className="bg-gpt-input-background">
                <TabsTrigger value="full">Full Preview</TabsTrigger>
                <TabsTrigger value="paginated">Paginated</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex w-full cursor-text flex-col rounded-3xl px-4 focus:outline-none transition-colors contain-inline-size bg-gpt-input-background min-h-[88px] max-h-[216px] outline-none text-base border-none items-center">
              <Textarea
                className="flex w-full cursor-text flex-col mx-2 my-2 min-h-[88px] max-h-[216px] outline-none border-none focus:ring-0 focus:outline-none focus:border-none bg-gpt-input-background placeholder:text-gpt-input-placholder-foreground text-base resize-none"
                value={markdown}
                onChange={handleChange}
                autoresize={true}
                placeholder="Message MarkdownGPT"
              />
            </div>
            <div className="prose dark:prose-invert max-w-none">
              {previewMode === "full" ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]} // Added rehypeSanitize for security
                  components={components}
                >
                  {markdown}
                </ReactMarkdown>
              ) : (
                <div>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]} // Added rehypeSanitize for security
                    components={components}
                  >
                    {sections[currentPage]}
                  </ReactMarkdown>
                  <div className="flex justify-between mt-4">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage(Math.max(0, currentPage - 1))
                      }
                      disabled={currentPage === 0}
                    >
                      Previous
                    </Button>
                    <div className="text-center">
                      Page {currentPage + 1} of {sections.length}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage(
                          Math.min(sections.length - 1, currentPage + 1)
                        )
                      }
                      disabled={currentPage === sections.length - 1}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarkdownEditor;
