"use client";

import { ActionButton } from "@/components/ui/action-button";

export function SendClueButton({ loading, label = "Enviar dica" }: { loading?: boolean; label?: string }) {
  return <ActionButton type="submit" loading={loading}>{label}</ActionButton>;
}
