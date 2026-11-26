import { normalizeBeanRating } from '../utils/beanRating';

const STAR_VALUES = [1, 2, 3, 4, 5];

export default function StarRating({
  value = 0,
  onChange,
  label = 'Valoración personal',
  showUnratedText = false
}) {
  const interactive = typeof onChange === 'function';
  const rating = normalizeBeanRating(value);

  if (!interactive) {
    return (
      <div
        className="inline-flex items-center gap-1"
        role="img"
        aria-label={rating > 0 ? `${label}: ${rating} de 5 estrellas` : `${label}: sin valorar`}
      >
        <span className="inline-flex text-amber-500" aria-hidden="true">
          {STAR_VALUES.map((star) => (
            <span key={star}>{star <= rating ? '★' : '☆'}</span>
          ))}
        </span>
        {showUnratedText && rating === 0 && (
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">Sin valorar</span>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-1" role="group" aria-label={label}>
        {STAR_VALUES.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`min-h-9 min-w-9 rounded-lg text-2xl transition cursor-pointer ${
              star <= rating
                ? 'text-amber-500'
                : 'text-slate-300 dark:text-slate-700 hover:text-amber-400'
            }`}
            aria-label={`${star} estrella${star === 1 ? '' : 's'}`}
            aria-pressed={star === rating}
            title={`Puntuar con ${star} estrella${star === 1 ? '' : 's'}`}
          >
            {star <= rating ? '★' : '☆'}
          </button>
        ))}
      </div>
      {rating > 0 && (
        <button
          type="button"
          onClick={() => onChange(0)}
          className="mt-1 text-[11px] font-semibold text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 cursor-pointer"
        >
          Quitar valoración
        </button>
      )}
    </div>
  );
}
