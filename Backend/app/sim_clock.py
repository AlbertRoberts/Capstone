"""
sim_clock.py — Shared simulation clock for the backend.

Tracks sim time independently of real time.
- Sim starts at 8:00am day 1
- Speed multiplier controls how many sim minutes pass per real second
  (default 1.0 = 1 sim minute per real second, 0.0 = paused)
- Provides time-of-day context strings for the LLM planner
"""

import time
from dataclasses import dataclass, field


@dataclass
class SimClock:
    # Accumulated sim minutes up to the last speed change
    _base_sim_minutes: float = 9 * 60   # 9:00am — first "morning" period, workplace enforcement active
    # Real timestamp of the last speed change
    _last_real_time: float = field(default_factory=time.time)
    # Sim minutes that advance per real second (0 = paused, 1 = default, 2 = 2x, 4 = 4x)
    _speed: float = 1.0

    def set_speed(self, new_speed: float) -> None:
        """Change the simulation speed. Captures accumulated minutes first."""
        self._base_sim_minutes = self._current_sim_minutes()
        self._last_real_time   = time.time()
        self._speed            = max(0.0, float(new_speed))

    def get_speed(self) -> float:
        return self._speed


    def _current_sim_minutes(self) -> float:
        elapsed_real = time.time() - self._last_real_time
        return self._base_sim_minutes + elapsed_real * self._speed


    def get_total_sim_minutes(self) -> int:
        return int(self._current_sim_minutes()) % (24 * 60)

    def get_hour(self) -> int:
        return self.get_total_sim_minutes() // 60

    def get_minute(self) -> int:
        return self.get_total_sim_minutes() % 60

    def get_time_string(self) -> str:
        """Returns e.g. '9:04am' or '2:30pm'"""
        total        = self.get_total_sim_minutes()
        hours        = total // 60
        minutes      = total % 60
        period       = "am" if hours < 12 else "pm"
        display_hour = hours % 12 or 12
        return f"{display_hour}:{minutes:02d}{period}"

    def get_day_period(self) -> str:
        """Returns a broad time-of-day label for LLM context."""
        hour = self.get_hour()
        if 5  <= hour < 9:  return "early morning"
        if 9  <= hour < 12: return "morning"
        if 12 <= hour < 14: return "midday"
        if 14 <= hour < 17: return "afternoon"
        if 17 <= hour < 20: return "evening"
        if 20 <= hour < 23: return "night"
        return "late night"

    def get_state(self) -> dict:
        return {
            "time":       self.get_time_string(),
            "day_period": self.get_day_period(),
            "hour":       self.get_hour(),
            "minute":     self.get_minute(),
            "speed":      self._speed,
        }

    def reset(self) -> None:
        self._base_sim_minutes = 9 * 60
        self._last_real_time   = time.time()
        self._speed            = 1.0


# Single shared instance — imported by routes.py and planner.py
sim_clock = SimClock()
