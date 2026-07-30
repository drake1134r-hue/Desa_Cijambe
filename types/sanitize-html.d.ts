declare module "sanitize-html" {
  const sanitizeHtml: (input: string, options?: Record<string, unknown>) => string;
  export default sanitizeHtml;
}
