import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useBlogPost } from "@/hooks/useBlog";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { format } from "date-fns";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading } = useBlogPost(slug || "");

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 lg:px-8 py-16 max-w-3xl">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-8" />
          <Skeleton className="h-64 w-full rounded-xl mb-8" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 lg:px-8 py-16 text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-8">This blog post doesn't exist or hasn't been published yet.</p>
          <Button asChild>
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SEOHead
        title={`${post.title} | Emery Collection Blog`}
        description={post.excerpt || `Read "${post.title}" on the Emery Collection blog.`}
        canonical={`https://emerycollectionshop.store/blog/${post.slug}`}
      />
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Back to Blog
          </Link>

          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-1"><User className="h-4 w-4" /> {post.author}</span>
            {post.published_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> {format(new Date(post.published_at), "MMMM d, yyyy")}
              </span>
            )}
          </div>

          {post.tags.length > 0 && (
            <div className="flex gap-2 mb-8">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs uppercase tracking-wider bg-secondary px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {post.cover_image && (
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full h-64 sm:h-96 object-cover rounded-2xl mb-10"
            />
          )}

          <article
            className="prose prose-neutral dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BlogPost;
