// src/components/SupabaseArticleDetailDemo.tsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SEOManager from './SEOManager';

// Strictly typed model representing the data fetched from Supabase
interface SupabasePost {
  id: number;
  title: string;
  excerpt: string;
  cover_image: string;
  slug: string;
}

export default function SupabaseArticleDetailDemo() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<SupabasePost | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPostFromSupabase() {
      setIsLoading(true);
      setError(null);
      try {
        // Real-world integration with Supabase JS client example:
        // --------------------------------------------------------
        // const { data, error } = await supabase
        //   .from('posts')
        //   .select('id, title, excerpt, cover_image, slug')
        //   .eq('slug', slug)
        //   .single();
        // if (error) throw error;
        // setPost(data);
        // --------------------------------------------------------

        // Mock Supabase fetch delay and query simulation for this demo
        await new Promise((resolve) => setTimeout(resolve, 1000));
        
        if (slug === 'example-slug') {
          setPost({
            id: 1,
            title: "Implementing Dynamic SEO in React SPA",
            excerpt: "Learn how to dynamically inject meta tags in a React SPA using react-helmet-async and Supabase data.",
            cover_image: "https://images.unsplash.com/photo-1618401471353-b98aedd07871",
            slug: "example-slug"
          });
        } else {
          throw new Error("Post not found");
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load post from Supabase";
        setError(message || "Failed to load post from Supabase");
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      fetchPostFromSupabase();
    }
  }, [slug]);

  // Handle loading state properly:
  // ------------------------------
  // DO NOT render <SEOManager /> while isLoading is true. This prevents
  // dynamic crawlers from indexing undefined or empty values.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 rounded-full border-4 border-purple-500 border-t-transparent animate-spin mb-4" />
          <p className="text-gray-500 font-medium">Loading content and metadata...</p>
        </div>
      </div>
    );
  }

  // Handle error or empty state:
  // -----------------------------
  // If post does not exist, we fallback to a default SEO state rather than injecting invalid properties.
  if (error || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6">
        <SEOManager 
          title="Content Unavailable"
          description="The article you are looking for does not exist or has been removed."
          canonicalUrl={window.location.href}
        />
        <p className="text-red-500 font-semibold text-lg mb-2">Error: {error || "Article not found"}</p>
        <p className="text-gray-500">Please double check the URL or return home.</p>
      </div>
    );
  }

  // Render content once data is fully validated:
  // ---------------------------------------------
  return (
    <article className="max-w-3xl mx-auto p-6 md:p-12">
      {/* Inject strictly typed SEO metadata */}
      <SEOManager 
        title={post.title}
        description={post.excerpt}
        canonicalUrl={`https://ravell.tech/article/${post.slug}`}
        ogImageUrl={post.cover_image}
      />
      
      <header className="mb-8">
        <img 
          src={post.cover_image} 
          alt={post.title} 
          className="w-full h-64 md:h-96 object-cover rounded-3xl shadow-md mb-6"
        />
        <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
          {post.title}
        </h1>
      </header>

      <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
        <p className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-6">
          {post.excerpt}
        </p>
        <p>
          This is a simulated article view integrating Supabase. Dynamic SEO, Open Graph, 
          and Twitter Cards tags are dynamically generated inside the browser document head 
          utilizing the react-helmet-async component.
        </p>
      </div>
    </article>
  );
}
