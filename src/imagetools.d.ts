// Ambient types for vite-imagetools `?as=picture` imports.
// Output shape: { sources: { avif, webp, ... }, img: { src, w, h } }
declare module "*as=picture" {
  interface PictureImg {
    src: string;
    w: number;
    h: number;
  }
  interface PictureOutput {
    sources: Record<string, string>;
    img: PictureImg;
  }
  const picture: PictureOutput;
  export default picture;
}
