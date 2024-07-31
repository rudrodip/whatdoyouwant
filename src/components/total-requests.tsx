import { getTotalRequests } from "@/lib/firebase";

export const dynamic = 'force-dynamic'

const TotalRequests = async () => {
  const totalRequests = await getTotalRequests();

  return (
    <div className="absolute bottom-5 left-5">
      <p className="text-sm text-muted-foreground transition-all duration-300 ease-in-out">
        {totalRequests}
      </p>
    </div>
  );
};

export default TotalRequests;