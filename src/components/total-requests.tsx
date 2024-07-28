import { getTotalRequests } from "@/lib/firebase"

export default async function TotalRequests() {
  const totalRequests = await getTotalRequests();

  return (
    <div className="absolute bottom-5 left-5">
      <p className="text-sm text-muted-foreground">{totalRequests}</p>
    </div>
  )
}