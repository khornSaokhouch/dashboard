"use client"
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/auth/login"); // replace avoids back button going to /home
  }, [router]);

  return null; // render nothing
}
