export interface IPosition {
	x: number;
	y: number;
}

export class Result<T, E> {
	private isOk: boolean;
	private data: T | E;

	private constructor(isOk: boolean, data: T | E) {
		this.isOk = isOk;
		this.data = data;
	}

	public static ok<T, E>(data: T): Result<T, E> {
		return new Result<T, E>(true, data);
	}
	public static err<T, E>(data: E): Result<T, E> {
		return new Result<T, E>(false, data);
	}

	public unwrap(): T {
		if (this.isOk) return this.data as T;
		else throw 'Unwrapped error value from result';
	}

	public map(f: (data: T) => void) {
		if (this.isOk) f(this.data as T);
	}
	public map_err(f: (data: E) => void) {
		if (!this.isOk) f(this.data as E);
	}
}
