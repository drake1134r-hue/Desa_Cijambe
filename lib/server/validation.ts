import sanitizeHtml from "sanitize-html";

export function sanitizeText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

export function sanitizeContent(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }
  return sanitizeHtml(value, {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "strong",
      "em",
      "u",
      "a",
      "ul",
      "ol",
      "li",
      "br",
      "span",
      "div",
      "img",
      "blockquote",
      "code",
      "pre",
    ],
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      span: ["style"],
      div: ["style"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["http", "https"],
    },
    transformTags: {
      a: (tagName: string, attribs: Record<string, string>) => ({
        tagName,
        attribs: {
          ...attribs,
          target: "_blank",
          rel: "nofollow noopener noreferrer",
        },
      }),
    },
  });
}
