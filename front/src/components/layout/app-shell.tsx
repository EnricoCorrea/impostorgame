"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import type { User } from "@/types/api";
import { ActionButton } from "@/components/ui/action-button";

export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter(); const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => { if (!authService.hasToken()) return router.replace("/login"); authService.me().then(setUser).catch(() => { authService.logout(); router.replace("/login"); }); }, [router]);
  function logout() { authService.logout(); router.replace("/login"); }
  if (!user) return <main className="center-screen"><span className="spinner spinner-dark" /></main>;
  const displayName = user.name?.trim() || user.email?.split("@")[0] || "Jogador";
  const initials = displayName.slice(0, 2).toUpperCase();
  const links = [
    { href: "/dashboard", label: "Vis\u00e3o geral" },
    ...(user.role === "ADMIN" ? [{ href: "/users", label: "Usu\u00e1rios" }] : []),
    { href: "/rooms", label: "Salas" },
    { href: "/games", label: "Partidas" },
    { href: "/words", label: "Palavras" },
  ];
  return <div className="app-layout"><aside className="sidebar"><Link href="/dashboard" className="brand"><span className="brand-mark">IG</span><span>Impostor<strong>Game</strong></span></Link><nav>{links.map((link) => <Link className={pathname === link.href ? "active" : ""} key={link.href} href={link.href}>{link.label}</Link>)}</nav><div className="sidebar-user"><span className="avatar">{initials}</span><div><strong>{displayName}</strong><small>{user.role}</small></div><ActionButton variant="ghost" onClick={logout} title="Sair">Sair</ActionButton></div></aside><main className="content">{children}</main></div>;
}
