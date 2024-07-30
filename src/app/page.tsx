import MainForm from "@/components/main-form";
import TotalRequests from "@/components/total-requests";

export const maxDuration = 60;

export default function Home() {
  return (
    <>
      <MainForm />
      <TotalRequests />
    </>
  );
}
