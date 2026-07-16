import { ServiceColor } from "./service-color.value";

declare const ServiceIconBrand: unique symbol;
export type ServiceIconName = string & { [ServiceIconBrand]: true };

const VALID_ICONS = new Set(["youtube", "car", "check-circle", "dollar"]);

export function toServiceIconName(value: string): ServiceIconName {
  if (!VALID_ICONS.has(value)) {
    throw new Error(`Unknown service icon: "${value}"`);
  }
  return value as ServiceIconName;
}

export class Service {
  private constructor(
    readonly slug: string,
    readonly title: string,
    readonly description: string,
    readonly color: ServiceColor,
    readonly icon: ServiceIconName,
    private _isActive: boolean,
    readonly sortOrder: number,
    readonly href: string,
  ) {}

  get isActive(): boolean {
    return this._isActive;
  }

  get heroUrl(): string {
    return `/${this.slug}`;
  }

  activate(): void {
    if (!this.description) {
      throw new Error("Cannot activate service without description");
    }
    this._isActive = true;
  }

  deactivate(): void {
    this._isActive = false;
  }

  static from(config: {
    slug: string;
    title: string;
    description: string;
    color: string;
    icon: ServiceIconName;
    isActive?: boolean;
    sortOrder?: number;
    href: string;
  }): Service {
    return new Service(
      config.slug,
      config.title,
      config.description,
      ServiceColor.from(config.color),
      config.icon,
      config.isActive ?? true,
      config.sortOrder ?? 0,
      config.href,
    );
  }
}
