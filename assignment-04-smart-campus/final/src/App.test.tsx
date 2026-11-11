import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import App from '@/App';

afterEach(cleanup);

const verdict = () => screen.getByTestId('result').querySelector('p')!.textContent;
const setText = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const pickRoom = (name: RegExp) => fireEvent.click(screen.getByRole('radio', { name }));
const roomOptions = () => screen.getAllByRole('radio').map((r) => r.getAttribute('aria-label'));

describe('App integration', () => {
  it('F5: switching rooms re-evaluates against the chosen room bookings', () => {
    render(<App />);
    setText('Start time', '10:00');
    setText('End time', '10:30');
    expect(verdict()).toBe('Unavailable'); // B-204 is booked 10:00-11:00
    expect(screen.getByTestId('result').textContent).toContain('Overlaps booking 10:00–11:00.');

    pickRoom(/A-101/); // A-101 is only booked 12:00-13:00
    expect(verdict()).toBe('Available');
    expect(screen.getByTestId('result').textContent).toContain('Room A-101');

    pickRoom(/C-310/); // C-310 has its own 10:00-12:00 booking
    expect(verdict()).toBe('Unavailable');
    expect(screen.getByTestId('result').textContent).toContain('Overlaps booking 10:00–12:00.');
  });

  it('F3: a blocked room in the catalog is never reported available', () => {
    render(<App />);
    pickRoom(/E-120/);
    expect(verdict()).toBe('Unavailable');
    expect(screen.getByTestId('result').textContent).toContain('Room is blocked (maintenance).');
  });

  it('F1 + F2: shows only rooms satisfying the selected requirements', () => {
    render(<App />);
    expect(roomOptions()).toHaveLength(5);
    setText('Attendees', '30');
    expect(roomOptions()).toEqual(['B-204 Lab', 'C-310 Lecture Hall']);
    fireEvent.click(screen.getByLabelText('Microphone'));
    expect(roomOptions()).toEqual(['C-310 Lecture Hall']);
  });

  it('F4: shows an empty state and no stale verdict when nothing matches', () => {
    render(<App />);
    setText('Attendees', '500');
    expect(screen.getByText('No rooms match your requirements.')).toBeTruthy();
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
    expect(screen.queryByTestId('result')).toBeNull();
  });

  it('F5: a filtered-out selection falls back to a matching room and refreshes', () => {
    render(<App />);
    pickRoom(/D-015/);
    expect(verdict()).toBe('Available');
    setText('Attendees', '30');
    expect(screen.getByTestId('result').textContent).toContain('Room B-204');
  });

  it('AC6: shows clear feedback for malformed time and invalid attendees', () => {
    render(<App />);
    setText('Start time', '9am');
    expect(verdict()).toBe('Unavailable');
    expect(screen.getByTestId('result').textContent).toContain('Start time must be in HH:MM format.');
    setText('Attendees', '-1');
    expect(screen.getByRole('alert').textContent).toContain('whole number');
  });

  it('simulated maintenance applies only to the room it was set on', () => {
    render(<App />);
    fireEvent.click(screen.getByLabelText(/Room blocked/));
    expect(verdict()).toBe('Unavailable');
    pickRoom(/A-101/);
    expect(verdict()).toBe('Available');
  });
});
