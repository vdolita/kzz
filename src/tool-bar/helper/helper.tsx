import Explanation from "./explanation";
import IntervalMsg from "./msg";

export default function Helper() {
  return (
    <div className="grid grid-cols-3 gap-2">
      <IntervalMsg />
      <Explanation />
    </div>
  );
}
