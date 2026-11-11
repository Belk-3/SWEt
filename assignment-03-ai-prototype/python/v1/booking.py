"""Smart Campus Room Availability Checker - booking rules (v1, first AI generation)."""


def can_book(start, end, now, blocked, existing):
    if blocked:
        return False
    if start < 0 or end > 1440 or start >= end:
        return False
    if start <= now:
        return False
    if end - start > 120:
        return False
    for b_start, b_end in existing:
        if start <= b_end and b_start <= end:
            return False
    return True
