"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { formSchema } from "@/lib/schema";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  ArrowRightIcon,
  DownloadIcon,
  Share1Icon,
  ClipboardCopyIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { cn, getBasePath } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function MainForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [memeUrl, setMemeUrl] = useState<string>("");
  const searchParam = useSearchParams();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitted(true);
    setLoading(true);
    const ref = searchParam.get("ref") ?? "";
    const query = searchParam.get("query");
    if (query !== values.query) {
      router.push(`/?query=${encodeURIComponent(values.query)}`);
    }

    try {
      const imageResponse = await fetch(
        `/api/og?query=${values.query}&ref=${ref}`
      );
      const imageBlob = await imageResponse.blob();

      if (imageBlob) {
        const imageUrl = URL.createObjectURL(imageBlob);
        setBlob(imageBlob);
        setMemeUrl(imageUrl);
        setError(false);
      } else {
        setError(true);
      }
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const query = searchParam.get("query");
    if (!query) return;

    form.setValue("query", query);
    onSubmit({ query });
  }, [form, searchParam]);

  const handleCopy = async () => {
    if (!blob) return;
    try {
      navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      toast.success("Copied image to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
      console.error("Failed to copy: ", error);
    }
  };

  const handleCopyUrl = async () => {
    try {
      navigator.clipboard.writeText(
        `${getBasePath()}/?query=${form.getValues("query")}`
      );
      toast.success("Copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy");
      console.error("Failed to copy: ", error);
    }
  };

  const resetState = () => {
    setMemeUrl("");
    setBlob(null);
    setSubmitted(false);
    form.setValue("query", "");
    const query = searchParam.get("query");
    if (query) {
      router.push("/");
    }
  }

  return (
    <main className="w-full flex justify-center items-center p-2 lg:p-0">
      {!submitted && (
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex items-start justify-between w-full max-w-[20rem]"
          >
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      placeholder="what do you want?  👀"
                      autoComplete="off"
                      {...field}
                      className="rounded-r-none border-r-0 ring-0 focus-visible:ring-0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              size="icon"
              className="rounded-l-none border-l-0"
            >
              <ArrowRightIcon />
            </Button>
          </form>
        </Form>
      )}

      <Image
        src="/loading.gif"
        alt="loading"
        width={300}
        height={300}
        unoptimized
        className={cn(!loading && "hidden")}
      />
      <Image
        src="/error.gif"
        alt="loading"
        width={300}
        height={300}
        unoptimized
        className={cn(!error && "hidden")}
      />
      {memeUrl && (
        <div className="relative w-full max-w-lg flex flex-col">
          <Image
            src={memeUrl}
            alt="loading"
            width={1000}
            height={700}
            unoptimized
          />
          <div className="absolute bottom-0 right-0 flex items-center">
            <Button
              variant="ghost"
              className="size-8 p-0 cursor-pointer"
              asChild
              onClick={resetState}
            >
              <div>
                <ReloadIcon />
              </div>
            </Button>
            <Button
              variant="ghost"
              className="size-8 p-0 cursor-pointer"
              asChild
              onClick={handleCopyUrl}
            >
              <div>
                <Share1Icon />
              </div>
            </Button>
            <Button
              variant="ghost"
              className="size-8 p-0 cursor-pointer"
              asChild
              onClick={handleCopy}
            >
              <div>
                <ClipboardCopyIcon />
              </div>
            </Button>
            <Button
              variant="ghost"
              className="size-8 p-0 cursor-pointer"
              asChild
            >
              <a href={memeUrl} download={form.getValues("query")}>
                <DownloadIcon />
              </a>
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
