// Maps the thirteen Science Adventure environments to their illustrated scenes
// and the scientist guide character. Plain data file so scene/character
// modules export only components (repo fast-refresh lint rule).

import {
  ForestScene,
  BodyLabScene,
  KitchenScene,
  MaterialsScene,
  ParticleScene,
  WaterScene,
  SkyScene,
  ForceScene,
  TheatreScene,
  SpaceScene,
  EcoScene,
  WeatherScene,
  LabScene,
} from '../components/science/scenes'

import { ScienceGuide } from '../components/science/characters'

export const SCIENCE_SCENES = {
  forest: ForestScene,
  bodylab: BodyLabScene,
  kitchen: KitchenScene,
  materialslab: MaterialsScene,
  particlelab: ParticleScene,
  waterscape: WaterScene,
  skyscape: SkyScene,
  forcescape: ForceScene,
  theatre: TheatreScene,
  spacescape: SpaceScene,
  ecoforest: EcoScene,
  weatherstation: WeatherScene,
  labroom: LabScene,
}

export const SCIENCE_GUIDE = ScienceGuide