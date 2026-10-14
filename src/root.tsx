import { component$ } from "@builder.io/qwik";
import { QwikCityProvider, RouterOutlet } from "@builder.io/qwik-city";
import { RouterHead } from "./components/router-head";
import "./global.css";

export default component$(() => {
  return (
    <QwikCityProvider>
      <head>
        <meta charset="utf-8" />
        <RouterHead />
      </head>
      {/* lang lives on <html> via containerAttributes in entry.ssr.tsx. */}
      <body class="antialiased">
        <RouterOutlet />
      </body>
    </QwikCityProvider>
  );
});
