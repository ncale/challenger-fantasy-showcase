export const seo = ({
  title,
  description,
  url,
  keywords,
  image,
  twitterHandle,
}: {
  title: string;
  description?: string;
  url?: string;
  image?: string;
  keywords?: string;
  twitterHandle?: string;
}) => {
  const tags = [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:creator", content: twitterHandle },
    { name: "twitter:site", content: twitterHandle },
    { name: "og:type", content: "website" },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    ...(url
      ? [
          { name: "og:url", content: url },
          { name: "twitter:url", content: url },
        ]
      : []),
    ...(image
      ? [
          { name: "twitter:image", content: image },
          { name: "twitter:card", content: "summary_large_image" },
          { name: "og:image", content: image },
        ]
      : []),
  ];

  return tags;
};
