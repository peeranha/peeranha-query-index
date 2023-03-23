/* eslint-disable no-underscore-dangle */
export class AchievementConfig {
  factCount: number;

  maxCount: number;

  lowerBound: number;

  achievementsType: number;

  constructor(achievement: any) {
    this.factCount = Number(achievement.factCount._hex);
    this.maxCount = Number(achievement.maxCount._hex);
    this.lowerBound = Number(achievement.lowerBound._hex);
    this.achievementsType = achievement.achievementsType;
  }
}
