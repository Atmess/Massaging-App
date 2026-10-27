import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
  import API_BASE_URL from '../config.js'

export default function SinglePostView() {
  const { id } = useParams(); // 👈 Grabs the ':id' from the URL (e.g., "5")
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState(''); // 👈 State for comment input
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null); // Tracks which comment is being edited
  const [editText, setEditText] = useState(''); // Tracks the text in the edit textarea
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchSinglePost = async () => {
      try {
        // Fetch from your Express backend API
        const response = await fetch(`${API_BASE_URL}/api/posts/${id}`);
        if (!response.ok) throw new Error('Post not found');
        const data = await response.json();
        console.log(data);
        setPost(data);
        setComments(data.comments || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSinglePost();
  }, [id]);

  // Handle deleting a comment
  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/api/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to delete comment');

      // Remove comment from local state instantly
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error(err);
      alert('Error deleting comment');
    }
  };

  const handleSaveEdit = async (commentId) => {
    if (!editText.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/api/comments/${commentId}`,
        {
          method: 'PATCH', // or 'PATCH' depending on what you chose
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: editText }),
        }
      );

      if (!response.ok) throw new Error('Failed to update comment');

      const updatedComment = await response.json();

      // Update state and close the edit box
      setComments(
        comments.map((c) => (c.id === commentId ? updatedComment : c))
      );
      setEditingCommentId(null);
      setEditText('');
    } catch (err) {
      console.error(err);
      alert('Error updating comment');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // Send comment to your backend API
      const response = await fetch(
        `${API_BASE_URL}/api/post/${id}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`, // Include if comments require login
          },
          body: JSON.stringify({ content: newComment }),
        }
      );

      if (!response.ok) throw new Error('Failed to post comment');

      const savedComment = await response.json();

      // Update local state to show new comment instantly
      setComments([savedComment, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error(err);
      alert('Error posting comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-20 text-slate-400">Loading article...</div>
    );
  if (error)
    return <div className="text-center py-20 text-red-400">{error}</div>;

  return (
    <div className="min-h-screen  text-slate-100 p-6 sm:p-12 ">
      {/*<button onClick={()=>{console.log(post)}}>test</button>*/}
      <div className=" mx-auto space-y-6">
        <Link to="/" className="text-sm text-blue-400 hover:underline">
          &larr; Back to Dashboard
        </Link>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          {post.title}
        </h1>

        <div className="flex items-center justify-between text-sm text-slate-400 border-b border-slate-800 pb-4">
          <span>By {post.author?.username || 'Author'}</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

        {/* Render attached files/images if any */}
        {post.files && post.files.length > 0 && (
          <div className="space-y-4 my-6">
            {post.files.map((file) => (
              <img
                key={file.id}
                src={file.url}
                alt={file.name}
                className="w-full max-h-[500px] object-cover rounded-xl border border-slate-700"
              />
            ))}
          </div>
        )}

        <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-lg">
          {post.content}
        </div>
      </div>
      {/* ================= COMMENTS SECTION ================= */}
      <div className="space-y-6 pt-4">
        <h3 className="text-2xl font-bold text-white">
          Comments ({comments.length})
        </h3>

        {/* Show comment form ONLY if user is logged in, otherwise prompt them to log in */}
        {user ? (
          <form onSubmit={handleCommentSubmit} className="space-y-3">
            <textarea
              rows="3"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`Commenting as ${user.username}...`}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white focus:outline-none focus:border-blue-500 placeholder-slate-500 text-sm"
              required
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition disabled:opacity-50"
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-4 text-center text-sm text-slate-400">
            Please{' '}
            <Link to="/login" className="text-blue-400 hover:underline">
              log in
            </Link>{' '}
            to leave a comment.
          </div>
        )}

        {/* Comments List */}
        <div className="space-y-4 pt-4">
          {comments.length === 0 ? (
            <p className="text-slate-500 text-sm italic">
              No comments yet. Be the first to share your thoughts!
            </p>
          ) : (
            comments.map((comment) => {
              // 👈 Compare comment authorId directly with context user.id!
              const isCommentOwner = user && comment.authorId === user.id;
              const isEditing = editingCommentId === comment.id;
              return (
                <div
                  key={comment.id}
                  className="bg-slate-800/50 border border-slate-800 rounded-xl p-4 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {comment.author?.username || 'Anonymous'}
                    </span>
                    <span>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* 👈 CONDITIONAL RENDERING: Show textarea if editing, otherwise show normal text */}
                  {isEditing ? (
                    <div className="space-y-3 pt-2">
                      <textarea
                        rows="2"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingCommentId(null)} // Cancel editing
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs rounded-lg transition"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveEdit(comment.id)} // Save changes
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg transition"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-300 text-sm">{comment.content}</p>
                  )}

                  {/* Edit/Delete shown only if user owns the comment */}
                  {isCommentOwner && !isEditing && (
                    <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800/60 text-xs">
                      <button
                        onClick={() => {
                          setEditingCommentId(comment.id);
                          setEditText(comment.content); // Pre-fill textarea with current comment text
                        }}
                        className="text-slate-400 hover:text-blue-400 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-slate-400 hover:text-red-400 transition"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* ================= END COMMENTS ================= */}
    </div>
  );
}
