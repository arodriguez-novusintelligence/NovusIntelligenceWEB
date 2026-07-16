import { Helmet } from "react-helmet-async";
import { meta, site } from "@/content/site";
import type { PageMeta } from "@/types";

interface PageMetaTagsProps extends PageMeta {
  ogImage?: string;
}

function resolveOgImage(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = site.url.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function PageMetaTags({ title, description, ogImage = meta.ogImage }: PageMetaTagsProps) {
  const absoluteOgImage = resolveOgImage(ogImage);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteOgImage} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="es_CO" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absoluteOgImage} />
    </Helmet>
  );
}
