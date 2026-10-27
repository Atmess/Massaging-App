export default function PostCreateform({
  setFormData,
  handleSubmit,
  formData,
  closeModal,
  isSubmitting,
  editingPost,
}) {
  return (
    <div>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
          <h2 className="text-xl font-bold text-white">
            {editingPost ? 'Edit Post' : 'Create New Post'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                placeholder="Article title..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Content
              </label>
              <textarea
                required
                rows="6"
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
                placeholder="Write article body..."
              />
            </div>

            <div>
              <label
                htmlFor="UploadFile"
                className="block text-sm font-medium text-slate-300 mb-1"
              >
                Upload Attachment
              </label>
              <input
                type="file"
                name="UploadFile"
                id="UploadFile"
                className="w-full text-sm text-slate-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-600 file:text-white
                      file:cursor-pointer hover:file:bg-blue-700
                      bg-slate-900 border border-slate-700 rounded-lg cursor-pointer
                      file:transition"
              />
            </div>

            {!editingPost && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={formData.published}
                  onChange={(e) =>
                    setFormData({ ...formData, published: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700"
                />
                <label htmlFor="published" className="text-sm text-slate-300">
                  Publish immediately
                </label>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
              >
                {isSubmitting
                  ? 'Saving...'
                  : editingPost
                    ? 'Update Post'
                    : 'Save Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
