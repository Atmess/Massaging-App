import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
  import API_BASE_URL from '../config.js'
// import PostCard from './PostCard'; // Import your postcard component

export default function PublishedPostsPage() {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');
  const [visibleCount, setVisibleCount] = useState(6); // Starts showing 6 posts
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 6);
  };

  // Fetch all published posts on load
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
          throw new Error('Failed to fetch posts');
        }
        const data = await response.json();
        console.log(data);
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Filter posts based on the search query (matching title or content)
  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading)
    return (
      <div className=" min-h-screen text-slate-100 p-6 sm:p-12  text-center py-20 text-slate-400">
        Loading posts...
      </div>
    );
  if (error)
    return (
      <div className=" min-h-screen  text-slate-100 p-6 sm:p-12 text-center py-20 text-red-400">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen  text-slate-100 p-6 sm:p-12">
      <div className=" mx-auto space-y-8">
        {/* ================= HEADER & SEARCH SECTION ================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              Published Articles
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Explore thoughts, tutorials, and updates.
            </p>
          </div>

          {/* Search Bar Input */}
          <div className="w-full md:w-72">
            <input
              type="text"
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-black focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>
        </div>
        {/* ================= END HEADER ================= */}

        {/* ================= POSTS GRID / LIST ================= */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm italic">
              {searchQuery
                ? 'No posts found matching your search.'
                : 'No posts published yet.'}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredPosts.slice(0, visibleCount).map((post) => (
                <article
                  key={post.id}
                  className="bg-slate-800/60 border border-slate-700/60 hover:border-blue-500/50 rounded-xl p-6 transition flex flex-col justify-between shadow-sm hover:shadow-md overflow-hidden"
                >
                  <div>
                    {/* Optional Image Thumbnail from post.files */}
                    {post.files && post.files.length > 0 && (
                      <div className="mb-4 -mx-6 -mt-6">
                        <img
                          src={post.files[0].url}
                          alt={post.files[0].name || post.title}
                          className="w-full h-48 object-cover border-b border-slate-700/60"
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                      <span>By {post.author?.username || 'Unknown'}</span>
                      <span>
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
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
        </div>
        {/* ================= END POSTS ================= */}
      </div>
    </div>
  );
}
