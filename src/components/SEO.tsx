import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  type?: string;
  name?: string;
  image?: string;
  url?: string;
  keywords?: string;
}

export default function SEO({
  title,
  description = "A blog about software engineering, web development, and technology.",
  type = "website",
  name = "Ravell Blog",
  image = "https://yourdomain.com/logo.png", // Gantilah dengan URL image default/logo jika ada
  url = "https://yourdomain.com",
  keywords = "blog, technology, software engineering, programming, web development",
}: SEOProps) {
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title} | {name}</title>
      <meta name='description' content={description} />
      <meta name="keywords" content={keywords} />
      {/* End standard metadata tags */}

      {/* Facebook & WhatsApp tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={name} />
      {/* End Facebook & WhatsApp tags */}

      {/* Twitter tags */}
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:card" content={type === 'article' ? 'summary_large_image' : 'summary'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      {/* End Twitter tags */}

      {/* Canonical Link */}
      <link rel="canonical" href={url} />

      {/* RSS & Atom Feeds */}
      <link rel="alternate" type="application/rss+xml" title="Ravell Networks - RSS Feed" href="/feed.xml" />
      <link rel="alternate" type="application/atom+xml" title="Ravell Networks - Atom Feed" href="/atom.xml" />
    </Helmet>
  );
}
