/* eslint-disable no-underscore-dangle */
export class Achievement {
  factCount: number;

  maxCount: number;

  achievementURI: string;

  achievementsType: number;

  constructor(achievement: any) {
    this.factCount = Number(achievement.factCount._hex);
    this.maxCount = Number(achievement.maxCount._hex);
    this.achievementURI = achievement.achievementURI;
    this.achievementsType = achievement.achievementsType;
  }
}

export class AchievementData extends Achievement {
  name: string;

  description: string;

  image: string;

  attributes: string;

  constructor(achievement: any) {
    super(achievement);
    this.name = achievement?.name;
    this.description = achievement?.description;
    this.image = achievement?.image;
    this.attributes = achievement?.attributes;
  }
}
