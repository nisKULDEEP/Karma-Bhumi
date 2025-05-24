// Client-side user type definitions
export interface IUser {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  isActive?: boolean;
  lastLogin?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  currentWorkspace?: string;
  currentOrganization?: string;
  currentTeam?: string;
}

export interface UserRole {
  userId: string;
  role: string;
}

export interface UserWithRoleType extends IUser {
  role: string;
}

export interface LoginResponseType {
  user: IUser;
  token: string;
  message: string;
}

export interface RegisterResponseType {
  user: IUser;
  token: string;
  message: string;
}

export interface AuthErrorType {
  message: string;
  errors?: Record<string, string>;
}