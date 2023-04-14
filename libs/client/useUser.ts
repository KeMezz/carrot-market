import { useRouter } from "next/router";
import { useEffect } from "react";
import useSWR from "swr";

export default function useUser() {
  const { data, error, isLoading } = useSWR("/api/users/me");
  const router = useRouter();
  useEffect(() => {
    if (data && !data.success) {
      router.replace("/enter");
    }
  }, [data, router]);
  return { user: data?.profile, isLoading, error };
}
