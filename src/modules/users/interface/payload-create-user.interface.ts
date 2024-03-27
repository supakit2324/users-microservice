export interface PlayloadCreateUserInterface {
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  password: string;

  hashPassword: string;
}
