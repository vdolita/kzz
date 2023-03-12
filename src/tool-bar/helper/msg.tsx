export default function IntervalMsg() {
  return (
    <div className="flex flex-col gap-y-2 bg-stone-50 p-2">
      <p className="text-base text-center">定时发言</p>
      <div className="flex flex-row gap-x-4">
        <span className="basis-16">发言间隔:</span>
        <input
          type="number"
          min={1}
          max={86400}
          className="basis-20 rounded border-2 border-slate-400"
        />
        <span>秒</span>
        <button className="rounded bg-sky-400 hover:bg-sky-500 py-1 px-6 text-white">
          结束
        </button>
      </div>
      <div className="flex flex-row gap-x-4">
        <span className="basis-16">发言内容:</span>
        <textarea className="h-20 border-2 border-slate-400 rounded flex-grow"></textarea>
      </div>
    </div>
  );
}
