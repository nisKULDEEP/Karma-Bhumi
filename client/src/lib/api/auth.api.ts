import API from "../axios-client";
import { LoginResponseType, loginType, registerType } from "@/types/api.type";

export const loginMutationFn = async (
  data: loginType
): Promise<LoginResponseType> => {
  const response = await API.post("/auth/login", data);
  return response.data;
};

export const registerMutationFn = async (data: registerType) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

export const logoutMutationFn = async () => {
  const response = await API.post("/auth/logout");
  return response.data;
};