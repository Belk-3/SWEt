"""Smart Campus Room Availability Checker - booking rules (final version).

Times are integer minutes after midnight (0..1440). The function only checks
availability; it never creates bookings or modifies its inputs.
"""

DAY_END = 1440
MAX_DURATION = 120


def _is_minute(value):
    # bool is a subclass of int, so exclude it explicitly
    return isinstance(value, int) and not isinstance(value, bool)


def can_book(start, end, now, blocked, existing):
    """Return True only if the request [start, end) satisfies AC1-AC4."""
    # AC1: integer minutes, 0 <= start < end <= 1440, start strictly after now
    if not (_is_minute(start) and _is_minute(end)):
        return False
    if not (0 <= start < end <= DAY_END):
        return False
    if start <= now:
        return False

    # AC2: duration up to and including 120 minutes
    if end - start > MAX_DURATION:
        return False

    # AC3: a blocked room rejects every request
    if blocked:
        return False

    # AC4: half-open intervals; touching at an endpoint is not an overlap
    for b_start, b_end in existing:
        if start < b_end and b_start < end:
            return False

    return True
