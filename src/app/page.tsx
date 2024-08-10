import Socials from "@/components/socials";
import MainForm from "@/components/main-form";
import TotalRequests from "@/components/total-requests";
import { Metadata, ResolvingMetadata } from "next";
import { getBasePath } from "@/lib/utils";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const query = searchParams.query;
  const base = getBasePath();
  const ogImage = query
    ? `${base}/api/og/?query=${encodeURIComponent(query as string)}`
    : `${base}/og.png`;

  return {
    openGraph: {
      images: [
        {
          url: ogImage,
          width: 1010,
          height: 730,
        },
      ],
    },
  };
}

export const maxDuration = 60;
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <MainForm />
      <TotalRequests />
      <Socials />
    </>
  );
}
