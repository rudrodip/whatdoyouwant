"use client";

import { getTotalRequests } from '@/lib/firebase';
import React, { useState, useEffect } from 'react';

const TotalRequests = () => {
  const [totalRequests, setTotalRequests] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    const fetchTotalRequests = async () => {
      try {
        const requests = await getTotalRequests();
        setTotalRequests(requests);
      } catch (error) {
        console.error("Failed to fetch total requests:", error);
      }
    };

    fetchTotalRequests();
  }, []);

  useEffect(() => {
    if (displayCount < totalRequests) {
      const animationDuration = 1000;
      const framesPerSecond = 120;
      const increment = (totalRequests - displayCount) / (animationDuration / 1000 * framesPerSecond);

      const intervalId = setInterval(() => {
        setDisplayCount(prevCount => {
          const nextCount = prevCount + increment;
          return nextCount >= totalRequests ? totalRequests : nextCount;
        });
      }, 1000 / framesPerSecond);

      return () => clearInterval(intervalId);
    }
  }, [totalRequests, displayCount]);

  return (
    <div className="absolute bottom-5 left-5">
      <p className="text-sm text-muted-foreground transition-all duration-300 ease-in-out">
        {Math.round(displayCount).toLocaleString()}
      </p>
    </div>
  );
};

export default TotalRequests;