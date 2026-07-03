declare module "@vercel/node" {
  export type VercelRequest = {
    query: Record<string, string | string[] | undefined>;
    body?: unknown;
  };

  export type VercelResponse = {
    setHeader(name: string, value: string): void;
    status(code: number): { json(body: unknown): void };
  };
}
