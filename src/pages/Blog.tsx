import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEOHead from "@/components/SEOHead";
import { useBlogPosts } from "@/hooks/useBlog";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, User, ArrowRight } from "lucide-react";
import { format } from "date-fns";

const Blog = () => {
  const { data: posts = [], isLoading } = useBlogPosts();

  return (
    <div className="min-h-screen">
      <SEOHead
        title="Blog | Emery Collection – Footwear Tips & Style Guides"
        description="Read the latest footwear trends, style guides, and shoe care tips from Emery Collection. Stay ahead in fashion."
        canonical="https://emerycollectionshop.store/blog"
      />
      <Navbar />
      <main className="container mx-auto px-4 lg:px-8 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Our Blog</h1>
          <p className="text-muted-foreground text-lg mb-12">Style guides, shoe care tips, and the latest trends.</p>

          {isLoading ? (
            <div className="space-y-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-6">
                  <Skeleton className="w-48 h-32 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No blog posts yet. Check back soon!</p>
            </div>
          ) : (
            <div className="space-y-8">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="group flex flex-col sm:flex-row gap-6 p-4 -mx-4 rounded-2xl hover:bg-secondary/40 transition-colors"
                >
                  {post.cover_image && (
                    <img
                      src={post.cover_image}
                      alt={post.title}
                      className="w-full sm:w-48 h-32 object-cover rounded-xl"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display text-xl font-semibold group-hover:text-accent transition-colors mb-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-3">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {post.author}
                      </span>
                      {post.published_at && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {format(new Date(post.published_at), "MMM d, yyyy")}
                        </span>
                      )}
                      <span className="ml-auto flex items-center gap-1 text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                        Read more <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                    {post.tags.length > 0 && (
                      <div className="flex gap-2 mt-3">
                        {post.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="text-[10px] uppercase tracking-wider bg-secondary px-2 py-0.5 rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
