import { UserRoles } from './enums';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: UserRoles;
      };
    }
  }
}

export {}; 