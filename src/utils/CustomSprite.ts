import { BaseTexture, Sprite, Spritesheet } from "pixi.js";

export default class CustomSprite {
  private static cache: Map<string, Spritesheet> = new Map();

  private constructor() { }

  public static async create(image: string, atlas: any, frameName: string): Promise<Sprite> {
    // Используем image как уникальный ключ для атласа
    if (!this.cache.has(image)) {
      const atlasData = { ...atlas, meta: { ...atlas.meta, scale: String(atlas.meta.scale) } };
      const sheet = new Spritesheet(BaseTexture.from(image), atlasData);
      await sheet.parse();
      this.cache.set(image, sheet);
    }

    const sheet = this.cache.get(image)!;
    return new Sprite(sheet.textures[frameName]);
  }
}