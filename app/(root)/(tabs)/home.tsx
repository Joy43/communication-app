import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";

export default function Homepage() {
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      router.replace("/posts/all-posts");
    }, [router]),
  );

  return null;
}
