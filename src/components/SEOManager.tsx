// src/components/SEOManager.tsx
import { Helmet } from 'react-helmet-async';

interface SEOManagerProps {
  title: string;
  description?: string;
  canonicalUrl: string;
  ogImageUrl?: string;
}

export default function SEOManager({
  title,
  description = "A technical blog about software engineering and network security.",
  canonicalUrl,
  ogImageUrl = "https://ravell.tech/logo.png",
}: SEOManagerProps) {
  const siteName = "Ravell Networks";

  return (
    <Helmet>
      {/* Standard HTML Tags */}
      <title>{title} | {siteName}</title>
      <meta name="description" content={description} />

      {/* Open Graph Tags */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />

      {/* Canonical Link */}
      <link rel="canonical" href={canonicalUrl} />
    </Helmet>
  );
}
