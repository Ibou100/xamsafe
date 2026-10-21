"""
In-memory Sliding Window Rate Limiter for XamSafe Backend.
Prevents automated abuse by restricting requests per IP address.

LIMITATION CONNUE :
Ce limiteur utilise un compteur en mémoire (dictionnaire de deques).
En conséquence, les compteurs sont réinitialisés à chaque redémarrage du processus
ou déploiement du conteneur (Render / Railway). Pour un déploiement multi-instances horizontal,
un magasin partagé (Redis / Valkey) sera nécessaire.
"""

import os
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
        """
        Extrait l'adresse IP du client de manière sécurisée.
        
        RÈGLES DE SÉCURITÉ :
        - Par défaut, l'en-tête X-Forwarded-For N'EST PAS lu afin d'empêcher les attaquants
          d'usurper leur adresse IP en injectant un faux en-tête. L'IP directe du socket est utilisée.
        - L'en-tête X-Forwarded-For n'est exploité QUE si la variable d'environnement TRUST_PROXY
          est explicitement activée (ex: "true", "1").
        - Derrière un reverse proxy de confiance (Render, Railway, Nginx), le proxy ajoute l'IP
          réelle du client à la fin de la chaîne. On prend donc la dernière IP ajoutée (parts[-1])
          et non aveuglément la première, pour neutraliser les faux en-têtes préfixés par le client.
        """
        trust_proxy = os.getenv("TRUST_PROXY", "").strip().lower() in ("true", "1", "yes")

        if trust_proxy:
            forwarded = request.headers.get("x-forwarded-for")
            if forwarded:
                parts = [p.strip() for p in forwarded.split(",") if p.strip()]
                if parts:
                    # En topologie de reverse proxy standard (1 saut de confiance),
                    # le proxy légitime accole l'IP du client à la fin de la chaîne.
                    return parts[-1]

        # IP directe de connexion réseau (fallback systématique ou mode direct)
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
