"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { setLoginModalOpen } = useAuth();

  useEffect(() => {
    // Redirect to home and open the modal
    router.replace("/");
    setLoginModalOpen(true);
  }, [router, setLoginModalOpen]);

  return null;
}
