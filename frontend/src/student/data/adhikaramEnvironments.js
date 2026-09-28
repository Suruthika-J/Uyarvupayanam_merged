// Maps the six cartoon world environments to their artwork.
// Kept in a data file (not a component file) so scenes.jsx / characters.jsx
// export only components - required by the repo's fast-refresh lint rule.

import {
  SunriseScene,
  RainScene,
  WarmHomeScene,
  ClassroomScene,
  PlaygroundScene,
  FarmScene,
} from '../components/adhikaram/scenes'

import {
  ChildWave,
  ChildRead,
  ChildFarm,
  ChildUmbrella,
  ChildHug,
} from '../components/adhikaram/characters'

export const SCENES = {
  sunrise: SunriseScene,
  rain: RainScene,
  warmHome: WarmHomeScene,
  classroom: ClassroomScene,
  playground: PlaygroundScene,
  farm: FarmScene,
}

export const CHARACTERS = {
  sunrise: ChildWave,
  rain: ChildUmbrella,
  warmHome: ChildHug,
  classroom: ChildRead,
  playground: ChildWave,
  farm: ChildFarm,
}