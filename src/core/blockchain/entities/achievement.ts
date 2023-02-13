/* eslint-disable no-underscore-dangle */
export class Achievement {
  factCount: number;

  maxCount: number;

  achievementURI: any;

  achievementsType: any;

  constructor(achievemnt: any) {
    this.factCount = Number(achievemnt.factCount._hex);
    this.maxCount = Number(achievemnt.maxCount._hex);
    this.achievementURI = achievemnt.achievementURI;
    this.achievementsType = achievemnt.achievementsType;
  }
}

export class AchievementData extends Achievement {
  name: any;

  description: any;

  image: any;

  attributes: any;

  constructor(achievemnt: any) {
    super(achievemnt);
    this.name = achievemnt?.name;
    this.description = achievemnt?.description;
    this.image = achievemnt?.image;
    this.attributes = achievemnt?.attributes;
  }
}
