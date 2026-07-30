declare module "bcryptjs" {
  export function hash(password: string, salt: number): Promise<string>;
  export function compare(password: string, hashedPassword: string): Promise<boolean>;
  export function genSalt(rounds: number): Promise<string>;
  export function verify(password: string, hashedPassword: string): Promise<boolean>;
}
