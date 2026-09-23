// Maps the eight World Explorer environments to their illustrated scenes and
// the explorer character. Plain data file so scene/character modules export
// only components (repo fast-refresh lint rule).

import {
  SpaceScene,
  EarthViewScene,
  IndiaScene,
  GeographyScene,
  HistoryScene,
  FreedomScene,
  CivicsScene,
  NatureScene,
} from '../components/social/scenes'

import { Explorer } from '../components/social/characters'

export const SOCIAL_SCENES = {
  space: SpaceScene,
  earthview: EarthViewScene,
  india: IndiaScene,
  geography: GeographyScene,
  history: HistoryScene,
  freedom: FreedomScene,
  civics: CivicsScene,
  nature: NatureScene,
}

export const SOCIAL_EXPLORER = Explorer