import * as React from "react";
import TextareaAutosize from "react-textarea-autosize";

import { cn } from "@/lib/utils";

interface TextareaProps extends React.ComponentProps<"textarea"> {
  autoresize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, autoresize = false, style, ...props }, ref) => {
    const textareaClassNames =
      "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm";

    if (autoresize) {
      const { height, ...restStyle } = style || {};

      return (
        <TextareaAutosize
          className={cn(textareaClassNames, className)}
          ref={ref}
          style={restStyle}
          {...props}
        />
      );
    }

    return (
      <textarea
        className={cn(textareaClassNames, className)}
        ref={ref}
        style={style}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
