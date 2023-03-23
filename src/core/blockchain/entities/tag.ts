export class Tag {
  ipfsDoc: [string, string];

  communityId: number;

  tagId: string;

  constructor(tag: any) {
    this.ipfsDoc = tag.ipfsDoc;
    this.communityId = tag.communityId;
    this.tagId = tag.tagId;
  }
}

export class TagData extends Tag {
  name: string;

  description: string;

  constructor(tag: any) {
    super(tag);
    this.name = tag.name;
    this.description = tag.description;
  }
}
