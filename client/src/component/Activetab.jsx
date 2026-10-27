export default function ActiveTabButton({
  currentTab,
  setActiveTab,
  nameforthisone,
  nameForthis,
}) {
  return (
    <button
      onClick={() => setActiveTab(nameforthisone)}
      className={`pb-3 px-2 font-medium transition border-b-2 cursor-pointer ${
        currentTab === nameforthisone
          ? 'border-blue-500 text-blue-400'
          : 'border-transparent text-slate-400 hover:text-slate-200'
      }`}
    >
      {nameForthis}
    </button>
  );
}
