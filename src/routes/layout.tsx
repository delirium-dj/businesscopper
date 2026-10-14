import { component$, Slot } from "@builder.io/qwik";

// The storefront page carries its own navigation and footer.
export default component$(() => {
  return <Slot />;
});
