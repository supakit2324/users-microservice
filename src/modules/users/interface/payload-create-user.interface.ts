export interface playloadCreateUserInterface {
  email: string;
  username: string;
  firstname: string;
  lastname: string;
  password: string;

  hashPassword: string;
}
