class Container {
  private registry = new Map<string, unknown>();

  register<T>(token: string, instance: T): void {
    this.registry.set(token, instance);
  }

  get<T>(token: string): T {
    const instance = this.registry.get(token);
    if (!instance) {
      throw new Error(`No instance registered for token: ${token}`);
    }
    return instance as T;
  }
}

export const container = new Container();
