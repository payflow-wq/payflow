export * from "./user";
export * from "./bill";
export * from "./transaction";
export * from "./payment";

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: T };
