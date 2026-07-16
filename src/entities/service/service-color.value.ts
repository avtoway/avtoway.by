const HEX_RE = /^#[0-9A-Fa-f]{6}$/;

export class ServiceColor {
  private constructor(private readonly hex: string) {}

  static from(hex: string): ServiceColor {
    if (!HEX_RE.test(hex)) {
      throw new Error(`Invalid service color: ${hex}`);
    }
    return new ServiceColor(hex);
  }

  get rgb(): string {
    const r = parseInt(this.hex.slice(1, 3), 16);
    const g = parseInt(this.hex.slice(3, 5), 16);
    const b = parseInt(this.hex.slice(5, 7), 16);
    return `${r},${g},${b}`;
  }

  rgba(alpha: number): string {
    return `rgba(${this.rgb},${alpha})`;
  }

  shadow(opacity: number): string {
    return `0 20px 60px rgba(${this.rgb},${opacity})`;
  }

  toString(): string {
    return this.hex;
  }
}
