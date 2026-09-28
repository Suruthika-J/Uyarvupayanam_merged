// Registry of Science Adventure image-map base artworks. Plain .js so the repo
// fast-refresh rule (components-only in .jsx) stays happy; SciMap imports
// SCIENCE_MAPS from here. Register your own cartoon backdrops here to add more.
import { PlantMap, BodyMap } from '../components/science/maps'

export const SCIENCE_MAPS = {
  plant: PlantMap,
  body: BodyMap,
}