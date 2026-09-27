# DEPLOYMENT_SECURITY_CHECKLIST.md

## Production Deployment Security Checklist

Before deploying DrishtiAI in a live border or critical infrastructure environment, ensure the following steps are taken:

- [ ] **Change Default Passwords**: Ensure the seeded `admin` account password is changed immediately.
- [ ] **JWT Secrets**: Generate a strong, cryptographically secure 256-bit key for `JWT_SECRET` in `.env`.
- [ ] **Enable HTTPS/TLS**: The frontend and backend must communicate over TLS 1.3. Do not run over plain HTTP in production.
- [ ] **Blockchain Node**: Switch `BLOCKCHAIN_MODE` from `MOCK` to `PERMISSIONED` and configure the Hyperledger Fabric connection profile.
- [ ] **Network Segmentation**: Isolate the backend API from the public internet. Only allow access via a secure VPN or dedicated private network.
- [ ] **Database Encryption**: Ensure the SQLite database or migrated PostgreSQL database is encrypted at rest (TDE).
- [ ] **Device Mutual TLS (mTLS)**: Enforce mTLS for all cameras and edge sensors connecting to the `Stream Proxy` and `/api/devices/{id}/heartbeat`.
- [ ] **Rate Limiting**: Configure aggressive rate limiting on the `/api/auth/login` endpoint at the reverse proxy (Nginx/Traefik).
- [ ] **Remove Mock Data**: Remove the mock cameras configured in `main.py` startup event.
