"""
sim_clock.py — Shared simulation clock for the backend.

Tracks sim time independently of real time.
- Sim starts at 8:00am day 1
- Each real second = 1 sim minute (configurable via REAL_SECONDS_PER_SIM_MINUTE)
- Provides time-of-day context strings for the LLM planner
"""

import time
from dataclasses import dataclass, field

# 1 real second = 1 sim minute by default
REAL_SECONDS_PER_SIM_MINUTE = 1

@dataclass
class SimClock:
    start_real_time: float = field(default_factory=time.time)
    start_sim_minute: int = 8 * 60  # 8:00am

    def get_total_sim_minutes(self) -> int:
        elapsed_real = time.time() - self.start_real_time
        elapsed_sim  = int(elapsed_real / REAL_SECONDS_PER_SIM_MINUTE)
        return (self.start_sim_minute + elapsed_sim) % (24 * 60)

    def get_hour(self) -> int:
        return self.get_total_sim_minutes() // 60

    def get_minute(self) -> int:
        return self.get_total_sim_minutes() % 60

    def get_time_string(self) -> str:
        """Returns e.g. '9:04am' or '2:30pm'"""
        total   = self.get_total_sim_minutes()
        hours   = total // 60
        minutes = total % 60
        period  = "am" if hours < 12 else "pm"
        display_hour = hours % 12
        if display_hour == 0:
            display_hour = 12
        return f"{display_hour}:{minutes:02d}{period}"

    def get_day_period(self) -> str:
        """Returns a broad time-of-day label for LLM context."""
        hour = self.get_hour()
        if 5 <= hour < 9:
            return "early morning"
        elif 9 <= hour < 12:
            return "morning"
        elif 12 <= hour < 14:
            return "midday"
        elif 14 <= hour < 17:
            return "afternoon"
        elif 17 <= hour < 20:
            return "evening"
        elif 20 <= hour < 23:
            return "night"
        else:
            return "late night"

    def get_state(self) -> dict:
        return {
            "time":       self.get_time_string(),
            "day_period": self.get_day_period(),
            "hour":       self.get_hour(),
            "minute":     self.get_minute(),
        }

# Single shared instance — imported by routes.py and planner.py
sim_clock = SimClock()