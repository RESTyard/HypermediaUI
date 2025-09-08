export abstract class Result<T> {

  public static ok<T1>(value: T1): Result<T1> {
    return new Ok(value);
  }

  public static error<T1>(error: string): Result<T1> {
    return new Error(error);
  }

  public static fromValue<T>(value: T | null | undefined, error: string = ""): Result<T> {
    return value
      ? Result.ok<T>(value)
      : Result.error<T>(error)
  }

  private readonly __typename: string;

  protected constructor(__typename: string) {
    this.__typename = __typename;
  }

  public isOk(): boolean {
    return this.__typename === Ok.Typename;
  }

  public isError(): boolean {
    return this.__typename === Error.Typename;
  }

  public bind<T1>(bind: (value: T) => Result<T1>): Result<T1> {
    return this.isOk() ? bind((<any>this).value) : Result.error<T1>((<any>this).error);
  }

  public async bindAsync<T1>(bind: (value: T) => Promise<Result<T1>>): Promise<Result<T1>> {
    return this.isOk() ? await bind((<any>this).value) : Result.error<T1>((<any>this).error);
  }

  public map<T1>(map: (value: T) => T1): Result<T1> {
    return this.isOk() ? Result.ok<T1>(map((<any>this).value)) : Result.error<T1>((<any>this).error);
  }

  public async mapAsync<T1>(map: (value: T) => Promise<T1>): Promise<Result<T1>> {
    return this.isOk() ? Result.ok<T1>(await map((<any>this).value)) : Result.error<T1>((<any>this).error);
  }

  public match(match: (value: T) => void, error: (error: string) => void): void {
    this.isOk() ? match((<any>this).value) : error((<any>this).error);
  }

  public matchReturn<TResult>(match: (value: T) => TResult, error: (error: string) => TResult): TResult {
    return this.isOk() ? match((<any>this).value) : error((<any>this).error);
  }

  public async matchAsync(match: (value: T) => Promise<void>, error: (error: string) => Promise<void>): Promise<void> {
    this.isOk() ? await match((<any>this).value) : await error((<any>this).error);
  }
}

export class Unit {
  public static readonly NoThing: Unit = new Unit();

  private constructor() {
  }
}

class Ok<T> extends Result<T> {
  public static Typename = 'Ok';
  public readonly value: T;

  constructor(value: T) {
    super(Ok.Typename);
    this.value = value;
  }
}

class Error<T> extends Result<T> {
  public static Typename = 'Error';
  public readonly error: string;

  constructor(error: string) {
    super(Error.Typename);
    this.error = error;
  }
}
