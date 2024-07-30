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
  GitHubLogoIcon,
  TwitterLogoIcon,
} from "@radix-ui/react-icons";
import { useState } from "react";
import Image from "next/image";
import { generateMeme } from "@/actions";
import { useSearchParams } from "next/navigation";
import { siteConfig } from "@/config/site.config";

export default function MainForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [memeUrl, setMemeUrl] = useState<string | null>(null);
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
      const memeUrl = await generateMeme(values.query, ref);

      if (memeUrl) {
        setMemeUrl(memeUrl);
      } else {
        setError(true);
      }
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
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
      {loading && (
        <Image src="/loading.gif" alt="loading" width={300} height={300} unoptimized />
      )}
      {error && (
        <Image src="/error.gif" alt="loading" width={300} height={300} unoptimized />
      )}
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
      <div className="absolute bottom-5 right-5 flex items-center gap-5">
        <a href={siteConfig.links.twitter} target="_blank">
          <TwitterLogoIcon />
        </a>
        <a href={siteConfig.links.github} target="_blank">
          <GitHubLogoIcon />
        </a>
      </div>
    </main>
  );
}
