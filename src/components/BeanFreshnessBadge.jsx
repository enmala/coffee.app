import { getBeanFreshness } from '../utils/beanFreshness';

const STATUS_CLASSES = {
  resting: 'bg-sky-50 dark:bg-sky-950/30 text-sky-800 dark:text-sky-300 border-sky-200 dark:border-sky-900/50',
  optimal: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50',
  'past-optimal': 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50',
  stale: 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/50'
};

export default function BeanFreshnessBadge({ roastDate }) {
  const freshness = getBeanFreshness(roastDate);
  if (!freshness) return null;

  return (
    <span className={`inline-flex items-center border rounded-full px-2 py-0.5 text-[9px] font-bold leading-tight ${STATUS_CLASSES[freshness.status]}`}>
      {freshness.label}
    </span>
  );
}
