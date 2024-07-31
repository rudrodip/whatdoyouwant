import { siteConfig } from "@/config/site.config";
import { GitHubLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";

export default function Socials() {
  return (
    <div className="absolute bottom-5 right-5 flex items-center gap-5">
      <a href={siteConfig.links.twitter} target="_blank">
        <TwitterLogoIcon />
      </a>
      <a href={siteConfig.links.github} target="_blank">
        <GitHubLogoIcon />
      </a>
    </div>
  );
}
