"""Acceptance tests for can_book (AC1-AC5). Run: python -m unittest -v test_booking"""
import copy
import unittest

from booking import can_book

NOW = 540
EXISTING = [(600, 660)]


class AcceptanceTests(unittest.TestCase):
    """Task 4 base cases: now=540, blocked=False, existing=[(600, 660)]."""

    def test_touching_end_is_available(self):  # AC4
        self.assertTrue(can_book(660, 720, NOW, False, EXISTING))

    def test_touching_start_is_available(self):  # AC4
        self.assertTrue(can_book(570, 600, NOW, False, EXISTING))

    def test_overlap_is_unavailable(self):  # AC4
        self.assertFalse(can_book(630, 690, NOW, False, EXISTING))

    def test_inside_booking_is_unavailable(self):  # AC4
        self.assertFalse(can_book(610, 650, NOW, False, EXISTING))

    def test_covering_booking_is_unavailable(self):  # AC4
        self.assertFalse(can_book(590, 670, NOW, False, EXISTING))

    def test_blocked_room_is_unavailable(self):  # AC3
        self.assertFalse(can_book(660, 720, NOW, True, EXISTING))

    def test_exactly_120_minutes_is_available(self):  # AC2
        self.assertTrue(can_book(720, 840, NOW, False, EXISTING))

    def test_121_minutes_is_unavailable(self):  # AC2
        self.assertFalse(can_book(720, 841, NOW, False, EXISTING))

    def test_starts_now_is_unavailable(self):  # AC1
        self.assertFalse(can_book(540, 570, NOW, False, EXISTING))

    def test_starts_before_now_is_unavailable(self):  # AC1
        self.assertFalse(can_book(500, 530, NOW, False, []))


class BoundaryTests(unittest.TestCase):
    """Extra cases: reversed times, day bounds, multiple bookings, inputs, types."""

    def test_reversed_times(self):  # AC1
        self.assertFalse(can_book(720, 660, NOW, False, EXISTING))

    def test_zero_length(self):  # AC1
        self.assertFalse(can_book(720, 720, NOW, False, EXISTING))

    def test_end_exactly_1440_is_available(self):  # AC1
        self.assertTrue(can_book(1380, 1440, NOW, False, EXISTING))

    def test_end_after_1440(self):  # AC1
        self.assertFalse(can_book(1380, 1441, NOW, False, EXISTING))

    def test_negative_start(self):  # AC1
        self.assertFalse(can_book(-10, 30, -20, False, []))

    def test_start_zero_with_earlier_now_not_possible(self):  # AC1: now >= 0 so start 0 is never after now
        self.assertFalse(can_book(0, 60, 0, False, []))

    def test_non_integer_minutes(self):  # AC1
        self.assertFalse(can_book(660.5, 720, NOW, False, EXISTING))

    def test_bool_is_not_a_minute_value(self):  # AC1
        self.assertFalse(can_book(True, 60, 0, False, []))

    def test_multiple_bookings_gap_fits(self):  # AC4
        bookings = [(600, 660), (720, 780)]
        self.assertTrue(can_book(660, 720, NOW, False, bookings))

    def test_multiple_bookings_overlaps_second(self):  # AC4
        bookings = [(600, 660), (720, 780)]
        self.assertFalse(can_book(700, 730, NOW, False, bookings))

    def test_no_existing_bookings(self):
        self.assertTrue(can_book(600, 700, NOW, False, []))

    def test_inputs_unchanged(self):  # AC5
        bookings = [(720, 780), (600, 660)]
        snapshot = copy.deepcopy(bookings)
        can_book(660, 720, NOW, False, bookings)
        can_book(630, 690, NOW, False, bookings)
        self.assertEqual(bookings, snapshot)

    def test_returns_real_bool(self):  # AC5
        self.assertIs(can_book(660, 720, NOW, False, EXISTING), True)
        self.assertIs(can_book(630, 690, NOW, False, EXISTING), False)


if __name__ == "__main__":
    unittest.main(verbosity=2)
