export default function Postscedule({
  handleSchedule,
  setScheduledDate,
  setIsScheduleModalOpen,
  scheduledDate,
}) {
  return (
    <div>
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
        <div className="bg-slate-800 text-white rounded-xl p-6 max-w-sm w-full space-y-4 shadow-xl border border-slate-700">
          <h3 className="text-lg font-semibold">Schedule Post Publication</h3>

          <form onSubmit={handleSchedule} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Select Date & Time (Future Only)
              </label>
              <input
                type="datetime-local"
                required
                min={new Date().toISOString().slice(0, 16)}
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs rounded transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition"
              >
                Confirm Schedule
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
