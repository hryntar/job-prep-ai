import React, { ComponentProps } from "react";
import Markdown from "react-markdown";
import { cn } from "@/lib/utils";

const MarkdownRenderer = ({ className, ...props }: { className?: string } & ComponentProps<typeof Markdown>) => {
  return (
    <div className={cn("max-w-none prose prose-neutral dark:prose-invert font-sans", className)}>
      <Markdown {...props} />
    </div>
  );
};

export default MarkdownRenderer;
