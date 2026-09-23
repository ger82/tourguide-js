/**
 * Ambient module declaration for SCSS imports.
 *
 * Allows `import "./whatever.scss"` in TypeScript files without the
 * compiler raising an error. The actual loading/processing of the SCSS
 * file is handled by webpack (via sass-loader + mini-css-extract-plugin)
 * at build time - TypeScript itself only needs to accept the file as a
 * "valid module with no type information".
 */
declare module "*.scss" {
    const content: string
    export default content
}
