import { api } from "./api";
import type { LoginReq, LoginResp } from "@/types/api";

export async function login(payload: LoginReq): Promise<LoginResp> {
  const { data } = await api.post<LoginResp>("/auth/login", payload);
  return data;
}

export async function refreshToken(): Promise<LoginResp> {
  const { data } = await api.post<LoginResp>("/auth/refresh");
  return data;
}
