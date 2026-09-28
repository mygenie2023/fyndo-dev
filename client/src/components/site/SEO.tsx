import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  noIndex?: boolean;
}

const SITE_URL = "https://fyndoin.com";
const DEFAULT_IMAGE = `${SITE_URL}/fyndo-logo.png`;

function upsertMeta(
  attribute: "name" | "property",
  key: string,
  content: string,
) {
  let element = document.head.querySelector(
    `meta[${attribute}="${key}"]`,
  ) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

function upsertCanonical(url: string) {
  let element = document.head.querySelector(
    'link[rel="canonical"]',
  ) as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "canonical");
    document.head.appendChild(element);
  }

  element.setAttribute("href", url);
}

export function SEO({
  title,
  description,
  path,
  image = DEFAULT_IMAGE,
  noIndex = false,
}: SEOProps) {
  useEffect(() => {
    const canonicalUrl = `${SITE_URL}${path}`;

    document.title = title;

    upsertMeta(
      "name",
      "description",
      description,
    );

    upsertMeta(
      "name",
      "robots",
      noIndex
        ? "noindex, nofollow"
        : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    );

    upsertCanonical(canonicalUrl);

    upsertMeta(
      "property",
      "og:type",
      "website",
    );

    upsertMeta(
      "property",
      "og:site_name",
      "FYNDO",
    );

    upsertMeta(
      "property",
      "og:title",
      title,
    );

    upsertMeta(
      "property",
      "og:description",
      description,
    );

    upsertMeta(
      "property",
      "og:url",
      canonicalUrl,
    );

    upsertMeta(
      "property",
      "og:image",
      image,
    );

    upsertMeta(
      "name",
      "twitter:card",
      "summary_large_image",
    );

    upsertMeta(
      "name",
      "twitter:title",
      title,
    );

    upsertMeta(
      "name",
      "twitter:description",
      description,
    );

    upsertMeta(
      "name",
      "twitter:image",
      image,
    );
  }, [
    title,
    description,
    path,
    image,
    noIndex,
  ]);

  return null;
}