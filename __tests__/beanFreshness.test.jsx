import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { getBeanFreshness } from '../src/utils/beanFreshness';
import { act, fireEvent, render, screen } from '@testing-library/react';
import BeansTab from '../src/components/tabs/BeansTab';
import BeanFreshnessBadge from '../src/components/BeanFreshnessBadge';

describe('bean freshness', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 20, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test.each([
    ['2026-07-20', 'resting', 'Reposo y desgasificación · 0 días'],
    ['2026-07-15', 'resting', 'Reposo y desgasificación · 5 días'],
    ['2026-07-14', 'optimal', 'Ventana óptima · 6 días'],
    ['2026-06-20', 'optimal', 'Ventana óptima · 30 días'],
    ['2026-06-19', 'past-optimal', 'Fuera de ventana óptima · 31 días'],
    ['2026-06-05', 'past-optimal', 'Fuera de ventana óptima · 45 días'],
    ['2026-06-04', 'stale', 'Pérdida progresiva de frescura · 46 días']
  ])('classifies roast date %s', (roastDate, status, label) => {
    const freshness = getBeanFreshness(roastDate, new Date(2026, 6, 20, 12));
    expect(freshness).toMatchObject({ status, label });
  });

  test('classifies beans roasted over 45 days ago as losing freshness', () => {
    expect(getBeanFreshness('2026-06-04', new Date(2026, 6, 20, 12))).toMatchObject({
      status: 'stale',
      label: 'Pérdida progresiva de frescura · 46 días'
    });
  });

  test.each(['', '2026-02-30', '15-07-2026', '2026-07-21'])(
    'does not classify invalid or future roast date %s',
    (roastDate) => {
      expect(getBeanFreshness(roastDate, new Date(2026, 6, 20, 12))).toBeNull();
    }
  );

  test('shows a freshness badge on bean cards with a valid roast date', () => {
    render(
      <BeansTab
        beans={[{ id: 'bean-1', name: 'Café de prueba', roast_date: '2026-07-15' }]}
        beanSearchQuery=""
        setBeanSearchQuery={vi.fn()}
        onAddBean={vi.fn()}
        onEditBean={vi.fn()}
        onDeleteBean={vi.fn()}
        onShareBean={vi.fn()}
      />
    );

    expect(screen.getByText('Reposo y desgasificación · 5 días')).toBeInTheDocument();
  });

  test('refreshes the freshness badge at local midnight', () => {
    vi.setSystemTime(new Date(2026, 6, 20, 23, 59, 59));

    render(<BeanFreshnessBadge roastDate="2026-07-15" />);

    expect(screen.getByText('Reposo y desgasificación · 5 días')).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Ventana óptima · 6 días')).toBeInTheDocument();
  });

  test('refreshes the freshness badge when the page becomes visible', () => {
    const visibilityDescriptor = Object.getOwnPropertyDescriptor(document, 'visibilityState');
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });

    render(<BeanFreshnessBadge roastDate="2026-07-15" />);
    expect(screen.getByText('Reposo y desgasificación · 5 días')).toBeInTheDocument();

    vi.setSystemTime(new Date(2026, 6, 21, 12));
    fireEvent(document, new Event('visibilitychange'));
    expect(screen.getByText('Ventana óptima · 6 días')).toBeInTheDocument();

    if (visibilityDescriptor) {
      Object.defineProperty(document, 'visibilityState', visibilityDescriptor);
    } else {
      delete document.visibilityState;
    }
  });
});
