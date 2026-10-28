import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import stream from '../assets/picture/800px-LiveTwins.png';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/picture/image1.png';
  import API_BASE_URL from '../config.js'

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const [visibleCount, setVisibleCount] = useState(6); // Starts showing 6 posts
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 6);
  };
  // Fetch published blog posts on component mount
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/post/getAllPublish`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log(data);
        setPosts(data);
      } catch (err) {
        console.error('Error fetching home posts:', err);
        setError(err.message || 'Unable to load blog posts right now.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      {/* HERO SECTION */}
      <header className="relative bg-linear-to-b from-slate-800/160 to-slate-900/180 border-b border-slate-800 py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white">
            Insights, Stories & <span className="text-blue-500">Code.</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
            A modern publishing platform for software developers and creators.
            Read the latest tutorials or share your own thoughts.
          </p>

          {/* Dynamic CTA Buttons based on Auth State */}
          <div className="flex column">
            <img src={stream} alt="stream" width={800} height={450} />
          </div>
          <div className="flex justify-center gap-4 pt-4">
            {user ? (
              <>
                <Link
                  to="/create-post"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition"
                >
                  Write a Post
                </Link>
                <Link
                  to="/dashboard"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-6 py-3 rounded-lg transition"
                >
                  Go to Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg shadow-lg transition"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-6 py-3 rounded-lg transition"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* RECENT POSTS FEED */}
      <main className="max-w-6xl w-full mx-auto px-6 py-12 flex-1">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Latest Articles
          </h2>
          {user?.role === 'ADMIN' && (
            <span className="text-xs bg-purple-900/60 text-purple-300 border border-purple-500/50 px-3 py-1 rounded-full">
              Admin View Mode
            </span>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-slate-800/50 border border-slate-800 p-6 rounded-xl animate-pulse h-48"
              >
                <div className="h-6 bg-slate-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-slate-700 rounded w-full mb-2"></div>
                <div className="h-4 bg-slate-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-lg text-center">
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-16 bg-slate-800/40 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-lg mb-4">
              No published articles found yet.
            </p>
            {user && (
              <Link
                to="/create-post"
                className="text-blue-400 hover:underline font-medium"
              >
                Be the first to publish a post &rarr;
              </Link>
            )}
          </div>
        )}

        {/* Posts Grid */}
        {!loading && !error && posts.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(0, visibleCount).map((post) => (
              <article
                key={post.id}
                className="bg-slate-800/60 border border-slate-700/60 hover:border-blue-500/50 rounded-xl p-6 transition flex flex-col justify-between shadow-sm hover:shadow-md overflow-hidden"
              >
                <div>
                  {/* Optional Image Thumbnail from post.files */}

                  {post.files && post.files.length > 0 ? (
                    <div className="mb-4 -mx-6 -mt-6">
                      <img
                        src={post.files[0].url}
                        alt={post.files[0].name || post.title}
                        className="w-full h-48 object-cover border-b border-slate-700/60"
                      />
                    </div>
                  ) : (
                    <img
                      src={logo}
                      alt={post.title}
                      className="w-full h-48 object-cover" // Add your preferred styling for the logo placeholder
                    />
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span>By {post.author?.username || 'Unknown'}</span>
                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 hover:text-blue-400">
                    <Link to={`/posts/${post.id}`}>{post.title}</Link>
                  </h3>

                  <p className="text-slate-400 text-sm line-clamp-3 mb-4">
                    {post.content}
                  </p>
                </div>

                <Link
                  to={`/posts/${post.id}`}
                  className="text-sm font-semibold text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                >
                  Read full article &rarr;
                </Link>
              </article>
            ))}
          </div>
        )}
        {visibleCount < posts.length && (
          <button
            onClick={handleLoadMore}
            className="load-more-btn mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Load More ({posts.length - visibleCount} remaining)
          </button>
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-500 py-6 text-center text-slate-500 text-sm">
        <p>
          &copy; {new Date().getFullYear()} Blog API. Built with Express,
          Prisma, & React.
        </p>
      </footer>
    </div>
  );
}
