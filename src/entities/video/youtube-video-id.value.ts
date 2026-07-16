const ID_RE = /^[A-Za-z0-9_-]{11}$/;

export class YouTubeVideoId {
  private constructor(readonly value: string) {}

  static from(value: string): YouTubeVideoId {
    if (!ID_RE.test(value)) {
      throw new Error(`Invalid YouTube video ID: ${value}`);
    }
    return new YouTubeVideoId(value);
  }

  get url(): string {
    return `https://youtube.com/watch?v=${this.value}`;
  }
}
