export type ApiError<T = unknown> = {
  message: string;
  name: string;
  time_thrown: string;
  data: T;
}

export type Projection<T> = {
  [K in keyof T]?:
    T[K] extends Array<infer U>
      ? Projection<U>
      : T[K] extends null | string | number | boolean | undefined
        ? boolean
        : Projection<T[K]>;
}

export type Result<T, P> = P extends Projection<T>
  ? {
    [K in (keyof P & keyof T)]:
      P[K] extends undefined | false
        ? undefined
        : P[K] extends true
          ? T[K]
          : T[K] extends Array<infer U>
            ? Array<Result<U, P[K]>>
            : Result<T[K], P[K]>;
  }
  : never;

/**
 * GraphQL responses consist of a possible array of errors and/or a data element with keys
 * representing the functions called and values representing the return value of the given function.
 */
export type Response<Data extends { [func: string]: unknown }, ErrorTypes = unknown> = {
  errors?: Array<ApiError<ErrorTypes>>;
  data: { [K in keyof Data]: Data[K] | null };
}

/**
 * Use a `Projection` object to construct a GraphQL string representation of that type.
 */
export const projectionToString = (f: Projection<any>): string => {
  const collection: Array<string> = [];
  for (const k in f) {
    const val = f[k];

    // Ignore falsy values
    if (!val) {
      continue;
    }

    if (val === true) {
      // If "true", request this key
      collection.push(k);
    } else {
      // Otherwise, it's an object, so recurse
      collection.push(`${k} ${projectionToString(val)}`);
    }
  }
  return `{ ${collection.join(", ")} }`;
}

