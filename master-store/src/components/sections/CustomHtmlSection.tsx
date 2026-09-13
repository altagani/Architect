export function CustomHtmlSection({ props }: { props: { html: string } }) {
  // Sanitize before storing in production — this bypasses React's escaping by design.
  return <div dangerouslySetInnerHTML={{ __html: props.html }} />;
}
