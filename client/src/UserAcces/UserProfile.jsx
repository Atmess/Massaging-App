import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/picture/image1.png';
import { Link } from 'react-router-dom';
  import API_BASE_URL from '../config.js'

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const token = localStorage.getItem('token');

  // States for user's posts
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [postError, setPostError] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 6);
  };

  // State for user Photo & Independent Dropdown Tracking
  const [photo, setPhoto] = useState([]);
  const [loadingPhoto, setLoadingPhoto] = useState(true);
  const [photoError, setPhotoError] = useState('');
  const [visibleCountFile, setVisibleCountFile] = useState(6);

  // 👈 Tracks which specific photo card's menu is open by its ID
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const handleLoadMoreFile = () => {
    setVisibleCountFile((prevCountFile) => prevCountFile + 6);
  };

  // Pre-fill form with current user data
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        username: user.username || '',
      });
      if (user.avatarUrl) {
        setPreviewUrl(user.avatarUrl);
      }
    }
  }, [user]);

  // Fetch posts created by this user on page load
  useEffect(() => {
    const fetchUserPosts = async () => {
      setLoadingPosts(true);
      setPostError('');

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${API_BASE_URL}/api/post/userpublished`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to load your posts');

        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setPostError(err.message);
      } finally {
        setLoadingPosts(false);
      }
    };

    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  // Fetch user files/photos
  useEffect(() => {
    const fetchUserFiles = async () => {
      setLoadingPhoto(true);
      setPhotoError('');

      try {
        const response = await fetch(`${API_BASE_URL}/api/user/file`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) throw new Error('Failed to load your files');

        const data = await response.json();
        setPhoto(data);
      } catch (err) {
        setPhotoError(err.message);
      } finally {
        setLoadingPhoto(false);
      }
    };

    if (user) {
      fetchUserFiles();
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };
  //download File
  const handleDownload = async (fileId, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/api/download/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to download file');

      // 1. Convert response into a blob (binary data)
      const blob = await response.blob();

      // 2. Create a temporary local URL for the blob
      const downloadUrl = window.URL.createObjectURL(blob);

      // 3. Create a hidden <a> element to trigger the download prompt
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName || 'download'; // Sets the default saved file name
      document.body.appendChild(link);
      link.click();

      // 4. Clean up and remove the temporary link
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
      setActiveDropdownId(null); // Close the active dropup menu
    } catch (err) {
      console.log(err);
      alert(err.message);
    }
  };

  //remove file
  const handleDeleteFile = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${API_BASE_URL}/api/files/${fileId}`,
        {
          // your real delete route
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to remove file');
      }
      // 👈 Filter out the deleted file from local state so the card instantly vanishes
      setPhoto((prevPhotos) => prevPhotos.filter((foto) => foto.id !== fileId));
      setActiveDropdownId(null); // Close the active dropup menu
    } catch (error) {
      console.log(error);
      alert(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('name', formData.name);
      data.append('username', formData.username);

      if (avatarFile) {
        data.append('upload', avatarFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/users/profile`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to update profile');
      }

      if (updateUser) {
        updateUser(resData);
      }

      setMessage({ text: 'Profile updated successfully!', type: 'success' });

      setTimeout(() => {
        setIsEditing(false);
        setMessage({ text: '', type: '' });
      }, 1500);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="w-full md:w-[70%] text-center py-20 text-slate-400">
        Please log in to view your profile.
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-slate-500 text-slate-100 p-6 sm:p-12 space-y-8">
      {/* Profile Section Box */}
      <div className="max-w-xl mx-auto bg-slate-800/60 border border-slate-700/80 rounded-2xl p-8 shadow-xl space-y-6">
        {message.text && (
          <div
            className={`p-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-900/40 border border-emerald-500 text-emerald-300' : 'bg-red-900/40 border border-red-500 text-red-300'}`}
          >
            {message.text}
          </div>
        )}

        {!isEditing ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">My Profile</h1>
                <p className="text-sm text-slate-400 mt-1">
                  View your account information.
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-xl transition text-sm"
              >
                Edit Profile
              </button>
            </div>

            <div className="flex items-center gap-6 bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-700 border-2 border-blue-500 flex items-center justify-center shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name || 'Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-slate-300">
                    {user.name?.[0] || user.username?.[0] || 'U'}
                  </span>
                )}
              </div>

              <div className="space-y-1 overflow-hidden">
                <h2 className="text-xl font-bold text-white truncate">
                  {user.name || 'No Display Name Set'}
                </h2>
                <p className="text-sm text-blue-400 font-mono">
                  @{user.username}
                </p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/40">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Role
                </span>
                <span className="text-sm font-medium text-white">
                  {user.role}
                </span>
              </div>
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/40">
                <span className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Account ID
                </span>
                <span className="text-sm font-medium text-white">
                  #{user.id}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
                <p className="text-sm text-slate-400 mt-1">
                  Update your personal account details and avatar.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setMessage({ text: '', type: '' });
                }}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium px-4 py-2 rounded-xl transition text-sm"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-700 border-2 border-blue-500 flex items-center justify-center shrink-0">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Avatar Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-slate-300">
                      {formData.name?.[0] || formData.username?.[0] || 'U'}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Display Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Username Handle
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="e.g. agung_dev"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-xl transition text-sm disabled:opacity-50"
              >
                {loading ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Unified My Posts Section */}
      <div className="max-w-6xl w-full mx-auto px-6 py-12 flex-1">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            My Posts
          </h2>
        </div>

        {loadingPosts ? (
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
        ) : postError ? (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-lg text-center">
            {postError}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/40 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-lg mb-4">
              You haven't written any posts yet.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.slice(0, visibleCount).map((post) => (
              <article
                key={post.id}
                className="bg-slate-800/60 border border-slate-700/60 hover:border-blue-500/50 rounded-xl p-6 transition flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div>
                  {post.files && post.files.length > 0 ? (
                    <div className="mb-4 -mx-6 -mt-6 overflow-hidden rounded-t-xl">
                      <img
                        src={post.files?.[0]?.url || logo}
                        alt={post.files?.[0]?.name || post.title}
                        className="w-full h-48 object-cover border-b border-slate-700/60"
                      />
                    </div>
                  ) : (
                    <div className="mb-4 -mx-6 -mt-6  overflow-hidden rounded-t-xl">
                      <img
                        src={logo}
                        alt={post.title}
                        className="w-full h-48 object-cover border-b border-slate-700/60"
                      />
                    </div>
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
      </div>

      {/* My Photo Section */}
      <div className="max-w-6xl w-full mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            My Photo
          </h2>
        </div>

        {loadingPhoto ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
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
        ) : photoError ? (
          <div className="bg-red-900/30 border border-red-500/50 text-red-300 p-4 rounded-lg text-center">
            {photoError}
          </div>
        ) : photo.length === 0 ? (
          <div className="text-center py-16 bg-slate-800/40 rounded-xl border border-slate-800">
            <p className="text-slate-400 text-lg mb-4">No Photo Here.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {photo.slice(0, visibleCountFile).map((foto) => (
              <div
                key={foto.id}
                /* 👇 ADD relative z-20 (or z-30) here so the whole card elevates when active */
                className={`bg-slate-800/60 border border-slate-700/60 rounded-xl p-6 shadow-sm flex flex-col justify-between relative ${
                  activeDropdownId === foto.id ? 'z-30' : 'z-10'
                }`}
              >
                <div className="mb-4 -mx-6 -mt-6  overflow-hidden rounded-t-xl">
                  <img
                    src={foto.url}
                    alt={foto.name}
                    className="w-full h-48 object-cover border-b border-slate-700/60"
                  />
                </div>

                <div className="space-y-2 text-sm text-slate-300">
                  <div className="truncate">
                    <span className="font-semibold text-slate-400 mr-2">
                      Name:
                    </span>
                    {foto.name}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 mr-2">
                      Size:
                    </span>
                    {(foto.size / 1024).toFixed(1)} KB
                  </div>
                  <div>
                    <span className="font-semibold text-slate-400 mr-2">
                      Uploaded:
                    </span>
                    {new Date(foto.uploadTime).toLocaleDateString()}
                  </div>
                </div>

                {/* Footer Row with Far-Right Dropup Menu */}
                <div className="flex justify-end items-center pt-3 mt-3 border-t border-slate-700/40">
                  <div className="relative">
                    {/* Clickable 3-Dot Button */}
                    <button
                      onClick={() =>
                        setActiveDropdownId(
                          activeDropdownId === foto.id ? null : foto.id
                        )
                      }
                      className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition cursor-pointer flex items-center justify-center focus:outline-none"
                      title="More options"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>

                    {/* 👈 DROPUP MENU CONTAINER */}
                    {activeDropdownId === foto.id && (
                      <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 space-y-1">
                        <button
                          onClick={() => {
                            handleDownload(foto.id, foto.name);
                          }}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-slate-700/60 rounded-lg transition font-medium"
                        >
                          <svg
                            className="w-4 h-4 text-slate-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Download
                        </button>

                        <div className="border-t border-slate-700/60 my-1"></div>

                        <button
                          onClick={() => {
                            handleDeleteFile(foto.id);
                          }}
                          className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition font-medium"
                        >
                          <svg
                            className="w-4 h-4 text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {visibleCountFile < photo.length && (
          <button
            onClick={handleLoadMoreFile}
            className="load-more-btn mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Load More ({photo.length - visibleCountFile} remaining)
          </button>
        )}
      </div>
    </div>
  );
}
