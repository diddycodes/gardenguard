import { formatDistanceToNow } from "date-fns";

export default function RelativeTime({ date }) {
  if (!date) return null;
  try {
    return <span>{formatDistanceToNow(new Date(date), { addSuffix: true })}</span>;
  } catch {
    return null;
  }
}