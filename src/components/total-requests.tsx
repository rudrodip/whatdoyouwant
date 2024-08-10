import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.REDIS_URL,
  token: process.env.REDIS_TOKEN,
})

export const dynamic = 'force-dynamic'

const TotalRequests = async () => {
  const totalRequests = await redis.get('total_requests') as string;
  return (
    <div className="absolute bottom-5 left-5">
      <p className="text-sm text-muted-foreground transition-all duration-300 ease-in-out">
        {totalRequests}
      </p>
    </div>
  );
};

export default TotalRequests;