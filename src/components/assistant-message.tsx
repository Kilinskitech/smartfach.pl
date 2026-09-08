import Markdown from "react-markdown";

const allowedElements = [
  "p", "strong", "em", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6",
  "blockquote", "code", "pre", "br", "hr", "a",
];

/** Render untrusted model text without HTML, embedded media or executable URLs. */
export function AssistantMessage({ content }: { content: string }) {
  return (
    <div className="assistant-content">
      <Markdown
        skipHtml
        allowedElements={allowedElements}
        urlTransform={(url) => /^https?:\/\//i.test(url) ? url : ""}
        components={{
          h1: ({ children }) => <h3>{children}</h3>,
          h2: ({ children }) => <h3>{children}</h3>,
          h4: ({ children }) => <h3>{children}</h3>,
          h5: ({ children }) => <h3>{children}</h3>,
          h6: ({ children }) => <h3>{children}</h3>,
          a: ({ href, children }) => href
            ? <a href={href} target="_blank" rel="noopener noreferrer nofollow">{children}</a>
            : <span>{children}</span>,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
