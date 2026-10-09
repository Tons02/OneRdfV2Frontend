/**
 * The app's Lottie files (served from /public; LottieAnimation fetches each
 * once and shares it across instances). `tint` recolors the vector files to theme tokens: they were
 * drawn with the old MIS blue, and the button loader must contrast with
 * whatever button it sits on. noDataTable is made of embedded PNGs and can't
 * be recolored.
 */
export const ANIMATIONS = {
  buttonLoading: { src: '/buttonLoading.json', tint: '[&_path]:fill-current' },
  // Full-colour illustration (500×400): shown as drawn, no tint.
  tableLoading: { src: '/tableLoading.json', tint: '' },
  noData: { src: '/noDataTable.json', tint: '' },
  // Only the "SYSTEM" letters (a fixed #282828 fill) are retinted, so they
  // stay readable on the dark theme; the logo, ring and arc keep their colors.
  initialLoader: {
    src: '/rdf-initial-loader.json',
    tint: "[&_path[fill='rgb(40,40,40)']]:fill-foreground",
  },
} as const

export type AnimationName = keyof typeof ANIMATIONS
