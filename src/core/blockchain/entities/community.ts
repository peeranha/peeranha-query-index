export class Community {
  ipfsDoc: [string, string];

  tagsCount: number;

  timeCreate: number;

  isFrozen: boolean;

  constructor(community: any) {
    this.ipfsDoc = community.ipfsDoc;
    this.tagsCount = community.tagsCount;
    this.timeCreate = community.timeCreate;
    this.isFrozen = community.isFrozen;
  }
}

export class CommunityData extends Community {
  public id: string;

  public avatar: string;

  public name: string;

  public description: string;

  public language: string;

  public website: string;

  public communitySite: string;

  public isBlogger: boolean;

  public tags: any;

  constructor(community: any) {
    super(community);
    this.id = String(community?.id);
    this.avatar = community?.avatar;
    this.name = community?.name;
    this.description = community?.description;
    this.language = community?.language;
    this.website = community?.website;
    this.communitySite = community?.communitySite;
    this.isBlogger = community?.isBlogger;
    this.tags = community?.tags;
  }
}
