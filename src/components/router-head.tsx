import { component$ } from "@builder.io/qwik";
import { useDocumentHead, useLocation } from "@builder.io/qwik-city";

export const RouterHead = component$(() => {
  const head = useDocumentHead();
  const loc = useLocation();
  return (
    <>
      <title>{head.title}</title>
      <link rel="canonical" href={loc.url.href} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      {head.meta.map((m) => (
        <meta key={m.key} {...m} />
      ))}
      {head.links.map((l) => (
        <link key={l.key} {...l} />
      ))}
      {head.styles.map((s) => {
        // Spread first, then render: keeps `dangerouslySetInnerHTML` out of
        // the JSX literal so the optimizer cannot emit it twice (esbuild
        // rejects duplicate keys in the SSR build).
        const props = { ...s.props, dangerouslySetInnerHTML: s.style };
        return <style key={s.key} {...props} />;
      })}
      {head.scripts.map((s) => {
        const props = { ...s.props, dangerouslySetInnerHTML: s.script };
        return <script key={s.key} {...props} />;
      })}
    </>
  );
});
