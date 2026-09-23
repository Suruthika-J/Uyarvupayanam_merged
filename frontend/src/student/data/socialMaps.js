// Registry of World Explorer image-map base artworks. Plain .js so the repo
// fast-refresh rule (components-only in .jsx) stays happy; MapQuestion imports
// SOCIAL_MAPS from here. Register your own cartoon backdrops here to add more.
import { SolarMap, IndiaMap, GlobeMap } from '../components/social/maps'

export const SOCIAL_MAPS = {
  solar: SolarMap,
  india: IndiaMap,
  globe: GlobeMap,
}