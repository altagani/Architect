export function RichTextSection({ props }: { props: { html: string } }) {
  // NOTE: sanitize server-side (e.g. with `isomorphic-dompurify`) before
  // storing/rendering admin-authored HTML in production.
  return (
    <section className="max-w-container mx-auto px-4 sm:px-6 lg:px-8 py-10 prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: props.html }} />
  );
}
