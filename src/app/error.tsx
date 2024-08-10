"use client";

import Image from "next/image";

export default function Error() {
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <Image
        src="/error.gif"
        alt="Error"
        width={500}
        height={500}
      />
    </div>
  )
}