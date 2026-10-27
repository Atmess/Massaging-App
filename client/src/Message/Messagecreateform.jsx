export default function MessageCreateForm({
  formData,
  setFormData,
  handleSubmit,
  closeModal,
  isSubmitting,
}) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        <h2 className="text-xl font-bold text-white">New Message</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
<div>
  <label htmlFor="recipient" className="block text-sm font-medium text-slate-300 mb-1">
    To
  </label>
  <input
    id="recipient"
    type="text"
    required
    value={formData.recipient}
    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
    placeholder="Username or email..."
  />
</div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-1">
              Message
            </label>
            <textarea
              id="content"
              required
              rows="6"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-blue-500"
              placeholder="Write your message..."
            />
          </div>

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
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}