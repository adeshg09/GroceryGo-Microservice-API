import { GENDERS } from "../config/constants";

export interface CreateUserProfileDTO {
  firstName: string;
  lastName: string;
  userName: string;
  gender: GENDERS;
  dob: Date;
  phone: string;
}
