export default function Postcard({
  activeTab,
  post,
  openEditModal,
  openScheduleModal,
  handleDeletePost,
  handlePublishDraft,
}) {
  return (
    <div>
      {' '}
      {/* POSTS LISTING AREA */}
      <div
        key={post.id}
        className="bg-slate-800/80 p-5 rounded-xl border border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        {/* Left Section: Text Content & Optional Image Thumbnail */}
        <div className="flex items-start gap-4 max-w-2xl">
          {post.files && post.files.length > 0 && (
            <div className="shrink-0 flex gap-2">
              <img
                src={post.files[0].url}
                alt={post.files.name}
                className="h-20 w-20 rounded-lg object-cover border border-slate-700"
              />
            </div>
          )}

          <div className="space-y-1">
            <h2 className="text-xl font-semibold text-white">{post.title}</h2>
            <p className="text-sm text-slate-400 line-clamp-2">
              {post.content}
            </p>
            <p className="text-xs text-slate-500">
              Last updated: {new Date(post.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {activeTab === 'drafts' ? (
            <>
              {!post.published && (
                <button
                  onClick={() => openScheduleModal(post.id)}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-2 rounded transition"
                >
                  Schedule
                </button>
              )}
              {!post.published && (
                <button
                  onClick={() => handlePublishDraft(post.id)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-2 rounded transition"
                >
                  Publish
                </button>
              )}
              <button
                onClick={() => openEditModal(post)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-3 py-2 rounded transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeletePost(post.id)}
                className="bg-red-600/80 hover:bg-red-600 text-white text-xs px-3 py-2 rounded transition"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => openEditModal(post)}
                className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs px-3 py-2 rounded transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeletePost(post.id)}
                className="bg-red-600/80 hover:bg-red-600 text-white text-xs px-3 py-2 rounded transition"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
