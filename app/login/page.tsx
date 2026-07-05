"use client";

import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center">Cargando...</div>}>
      <LoginForm />
    </Suspense>
  );
}
