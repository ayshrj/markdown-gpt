"use client";

import React, { useState, useMemo } from "react";
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

const MarkdownEditor: React.FC = () => {
  const [markdown, setMarkdown] = useState<string>(
    `# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

Regular text with **bold**, *italic*, ***bold and italic***, and ~~strikethrough~~.

> Blockquote example

Some \`inline code\`

\`\`\`typescript
// Code block example
const scale = (size: number) => size * 2;
\`\`\`

- List item 1
- List item 2
  - Nested list item`
  );
  const [previewMode, setPreviewMode] = useState<string>("full");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkdown(e.target.value);
  };

  const sections = useMemo(() => {
    return markdown.split("---").map((section) => section.trim());
  }, [markdown]);

  const [currentPage, setCurrentPage] = useState(0);

  const customTypographyStyles = {
    h1: { fontSize: "2.5rem", fontWeight: "bold", marginBottom: "0.5rem" },
    h2: { fontSize: "2rem", fontWeight: "bold", marginBottom: "0.5rem" },
    h3: { fontSize: "1.75rem", fontWeight: "bold", marginBottom: "0.5rem" },
    h4: { fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem" },
    h5: { fontSize: "1.25rem", fontWeight: "bold", marginBottom: "0.5rem" },
    h6: { fontSize: "1rem", fontWeight: "bold", marginBottom: "0.5rem" },
  };

  // Define the custom components for ReactMarkdown
  const components: Components = {
    h1: (props) => <h1 style={customTypographyStyles.h1} {...props} />,
    h2: (props) => <h2 style={customTypographyStyles.h2} {...props} />,
    h3: (props) => <h3 style={customTypographyStyles.h3} {...props} />,
    h4: (props) => <h4 style={customTypographyStyles.h4} {...props} />,
    h5: (props) => <h5 style={customTypographyStyles.h5} {...props} />,
    h6: (props) => <h6 style={customTypographyStyles.h6} {...props} />,
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
