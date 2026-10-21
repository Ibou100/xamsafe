"""
In-memory Sliding Window Rate Limiter for XamSafe Backend.
Prevents automated abuse by restricting requests per IP address.
"""

import time
from collections import defaultdict, deque
from typing import Dict, Optional
from fastapi import Request, HTTPException


class RateLimiter:
    def __init__(self, requests_per_minute: int = 20, window_seconds: int = 60):
        self.requests_per_minute = requests_per_minute
        self.window_seconds = window_seconds
        self._history: Dict[str, deque] = defaultdict(deque)

    def _get_client_ip(self, request: Request) -> str:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            ip = forwarded.split(",")[0].strip()
            if ip:
                return ip
        if request.client and request.client.host:
            return request.client.host
        return "127.0.0.1"

    def check(self, request: Request) -> None:
        client_ip = self._get_client_ip(request)
        now = time.time()
        timestamps = self._history[client_ip]

        # Purge entries outside current sliding window
        while timestamps and (now - timestamps[0]) > self.window_seconds:
            timestamps.popleft()

        if len(timestamps) >= self.requests_per_minute:
            raise HTTPException(
                status_code=429,
                detail=f"Limite de requêtes atteinte ({self.requests_per_minute} requêtes/minute). Veuillez patienter quelques instants avant de réessayer."
            )

        timestamps.append(now)

    def reset(self) -> None:
        """Clears all tracked IPs (useful for testing)."""
        self._history.clear()


# Global default instance
global_rate_limiter = RateLimiter(requests_per_minute=20, window_seconds=60)
