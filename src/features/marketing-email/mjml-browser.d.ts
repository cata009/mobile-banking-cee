declare module 'mjml-browser' {
  export default function mjml2html(
    source: string,
    options?: { validationLevel?: 'strict' | 'soft' | 'skip'; minify?: boolean; fonts?: Record<string, string> },
  ): { html: string; errors: { message: string; formattedMessage?: string }[] }
}
