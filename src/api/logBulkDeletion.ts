export async function logBulkDeletion(target: "students" | "professors", representative: string) {
  const response = await fetch("/api/log?type=bulk_delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target, representative }),
  });

  if (!response.ok) throw new Error("Failed to log bulk deletion");
}
