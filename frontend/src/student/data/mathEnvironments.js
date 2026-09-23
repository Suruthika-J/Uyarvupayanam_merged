// Maps the eleven Math Adventure environments to their illustrated scenes and
// to the single explorer character. Plain data file so scenes.jsx / characters
// .jsx export only components (repo fast-refresh lint rule).

import {
  CastleScene,
  ValleyScene,
  ForestScene,
  CityScene,
  CaveScene,
  IslandScene,
  BakeryScene,
  StationScene,
  MarketScene,
  WorkshopScene,
  DetectiveScene,
} from '../components/maths/scenes'

import { Explorer } from '../components/maths/characters'

export const MATH_SCENES = {
  castle: CastleScene,
  valley: ValleyScene,
  forest: ForestScene,
  city: CityScene,
  cave: CaveScene,
  island: IslandScene,
  bakery: BakeryScene,
  station: StationScene,
  market: MarketScene,
  workshop: WorkshopScene,
  detective: DetectiveScene,
}

export const MATH_EXPLORER = Explorer