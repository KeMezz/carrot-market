import { User } from "@prisma/client";
import { useRouter } from "next/router";
import { useEffect } from "react";
import useSWR from "swr";

interface UserResponse {
  success: boolean;
  profile: User;
}

export default function useUser() {
  const { data, error, isLoading } = useSWR<UserResponse>("/api/users/me");
  const router = useRouter();
  useEffect(() => {
    if (data && !data.success && router.pathname !== "/enter") {
      router.replace("/enter");
    }
  }, [data, router]);
  return { user: data?.profile, isLoading, error };
}
