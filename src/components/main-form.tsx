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
} from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function MainForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [memeUrl, setMemeUrl] = useState<string>("");
  const searchParam = useSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setSubmitted(true);
    setLoading(true);
    const ref = searchParam.get("ref") ?? undefined;

    try {
      const imageResponse = await fetch("/api/og?query=" + values.query + "&ref=" + ref);
      const imageBlob = await imageResponse.blob();

      if (imageBlob) {
        const imageUrl = URL.createObjectURL(imageBlob);
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
  }, [form, searchParam])

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
      
      <Image src="/loading.gif" alt="loading" width={300} height={300} unoptimized className={cn(!loading && "hidden")} />
      <Image src="/error.gif" alt="loading" width={300} height={300} unoptimized className={cn(!error && "hidden")} />
      {memeUrl && (
        <div className="relative w-full max-w-lg flex flex-col">
          <Image src={memeUrl} alt="loading" width={1000} height={700} unoptimized />
          <Button
            variant="ghost"
            className="size-8 p-0 absolute bottom-0 right-0"
            asChild
          >
            <a href={memeUrl} download={form.getValues("query")}>
              <DownloadIcon />
            </a>
          </Button>
        </div>
      )}
    </main>
  );
}
