export class Translation {
  ipfsDoc: [string, string];

  author: string;

  postTime: number;

  rating: number;

  isDeleted: boolean;

  constructor(translation: any) {
    [this.ipfsDoc, this.author, this.rating, this.postTime, this.isDeleted] =
      translation;
  }
}

export class TranslationData extends Translation {
  title?: string;

  content: string;

  constructor(translation: any) {
    super(translation);
    this.title = translation?.title;
    this.content = translation?.content;
  }
}
