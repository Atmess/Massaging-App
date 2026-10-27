import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Postcard from './Postcard';
import PostCreateform from './Postcreateform';
import Postscedule from './Postschedule';
import { Link } from 'react-router-dom';
import ActiveTabButton from '../component/Activetab.jsx';
import API_BASE_URL from '../config.js'


export default function Dashboard() {
  const { user } = useAuth();

  // State management
  const [activeTab, setActiveTab] = useState('drafts'); // 'drafts' | 'published'
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    published: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Schedule Modal State
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [schedulingPostId, setSchedulingPostId] = useState(null);
  const [scheduledDate, setScheduledDate] = useState('');

  const token = localStorage.getItem('token');

  // 1. FETCH POSTS DEPENDING ON ACTIVE TAB
  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    setError('');

    const endpoint =
      activeTab === 'drafts'
        ? `${API_BASE_URL}/api/post/draft`
        : `${API_BASE_URL}/api/post/userpublished`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load posts');
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. CREATE OR UPDATE POST
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const isEditing = Boolean(editingPost);
    const url = isEditing
      ? `${API_BASE_URL}/api/post/${editingPost.id}`
      : `${API_BASE_URL}/api/post/publish`;

    const method = isEditing ? 'PUT' : 'POST';

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('published', formData.published);

      if (formData.publishTime) {
        data.append('publishTime', formData.publishTime);
      }

      const fileInput = document.querySelector('#UploadFile');
      if (fileInput && fileInput.files[0]) {
        data.append('upload', fileInput.files[0]);
      }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      if (!response.ok) throw new Error('Failed to save post');

      const result = await response.json();
      console.log('Saved post result:', result);

      closeModal();
      fetchPosts();
    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. PUBLISH DRAFT
  const handlePublishDraft = async (postId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/post/${postId}/publishdraft`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      console.log(data);
      if (!response.ok)
        throw new Error(data.message || 'Failed to publish draft ');
      fetchPosts();
    } catch (err) {
      alert(err.message);
    }
  };

  // 4. SCHEDULE POST
  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!scheduledDate || !schedulingPostId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/post/${schedulingPostId}/publishdraft`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            publishTime: scheduledDate,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to schedule post');

      setIsScheduleModalOpen(false);
      setSchedulingPostId(null);
      fetchPosts();
    } catch (err) {
      alert(err.message);
    }
  };

  // 5. DELETE POST
  const handleDeletePost = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/post/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || 'Failed to delete post');

      console.log(data);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      alert(err.message);
    }
  };

  // MODAL HELPERS
  const openCreateModal = () => {
    setEditingPost(null);
    setFormData({ title: '', content: '', published: false });
    setIsModalOpen(true);
  };

  const openEditModal = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      published: post.published,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
    setFormData({ title: '', content: '', published: false });
  };

  const openScheduleModal = (postId) => {
    setSchedulingPostId(postId);
    setScheduledDate('');
    setIsScheduleModalOpen(true);
  };

  return (
    <div className=" text-slate-100 p-6 sm:p-12 space-y-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/90 p-6 rounded-xl border border-slate-700 shadow-md">
          <div>
            <h1 className="text-2xl font-bold">Author Dashboard</h1>
            <p className="text-sm text-slate-400">
              Manage your published articles and draft manuscripts.
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition"
          >
            + Create New Post
          </button>
        </div>

        {/* TABS & NAVIGATION */}
        <div className="flex border-b border-slate-700 gap-4">
          <ActiveTabButton
            currentTab={activeTab}
            setActiveTab={setActiveTab}
            nameforthisone={'drafts'}
            nameForthis={'My Draft'}
          />
          <ActiveTabButton
            currentTab={activeTab}
            setActiveTab={setActiveTab}
            nameforthisone={'published'}
            nameForthis={'Published Posts'}
          />
        </div>

        {/* POSTS LISTING AREA */}
        {!user ? (
          <div className="text-center py-16 bg-slate-800/50 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white">Access Restricted</h2>
            <p className="text-slate-400 text-sm">
              Please log in to view and manage your posts.
            </p>
            <div>
              <Link
                to="/login"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-xl transition text-sm"
              >
                Log In
              </Link>
            </div>
          </div>
        ) : loading ? (
          <div className="text-center py-12 text-slate-400">
            Loading articles...
          </div>
        ) : error ? (
          <div className="p-4 bg-red-900/30 border border-red-500 rounded-lg text-red-300">
            {error}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-800">
            <p className="text-slate-400">No {activeTab} found.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {posts.map((post) => (
              <Postcard
                key={post.id}
                post={post}
                activeTab={activeTab}
                openScheduleModal={openScheduleModal}
                handlePublishDraft={handlePublishDraft}
                openEditModal={openEditModal}
                handleDeletePost={handleDeletePost}
              />
            ))}
          </div>
        )}

        {/* CREATE / EDIT POST MODAL */}
        {isModalOpen && (
          <PostCreateform
            formData={formData}
            setFormData={setFormData}
            handleSubmit={handleSubmit}
            closeModal={closeModal}
            isSubmitting={isSubmitting}
            editingPost={editingPost}
          />
        )}

        {/* SCHEDULE MODAL */}
        {isScheduleModalOpen && (
          <Postscedule
            handleSchedule={handleSchedule}
            setIsScheduleModalOpen={setIsScheduleModalOpen}
            setScheduledDate={setScheduledDate}
            scheduledDate={scheduledDate}
          />
        )}
      </div>
    </div>
  );
}
