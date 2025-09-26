
export enum GameStatus {
  NotStarted = 'not-started',
  InProgress = 'in-progress',
  LevelTransition = 'level-transition',
  Won = 'won',
  Lost = 'lost',
}

export enum LightStatus {
  Red = 'red',
  Green = 'green',
}

export enum Character {
  Runner = 'runner',
  Waver = 'waver',
}

export interface Difficulty {
  level: number;
  gameDuration: number; // in seconds
  minGreenLight: number; // in ms
  maxGreenLight: number; // in ms
  minRedLight: number; // in ms
  maxRedLight: number; // in ms
  dollTurnSpeed: number; // in ms
  changeThreshold: number; // percentage from which green light has a chance to turn red
}