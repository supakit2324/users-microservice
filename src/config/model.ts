import { AmountLogin, AmountLoginSchema } from 'src/modules/login/login.schema';
import { Users, UsersSchema } from 'src/modules/users/users.schema';

export const model = [
  {
    name: Users.name,
    schema: UsersSchema,
  },
  {
    name: AmountLogin.name,
    schema: AmountLoginSchema,
  },
];
