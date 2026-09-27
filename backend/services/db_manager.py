import sqlite3
import logging
from passlib.context import CryptContext

logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class DBManager:
    def __init__(self, db_path: str = "drishti.db"):
        self.db_path = db_path
        self._init_db()

    def get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def _init_db(self):
        conn = self.get_connection()
        cursor = conn.cursor()

        # Users and Auth
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE,
                password_hash TEXT,
                role TEXT,
                failed_login_attempts INTEGER DEFAULT 0,
                locked_until TEXT
            )
        ''')

        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                refresh_token TEXT,
                expires_at TEXT,
                is_revoked INTEGER DEFAULT 0
            )
        ''')

        # Devices
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS devices (
                device_id TEXT PRIMARY KEY,
                device_name TEXT,
                device_type TEXT,
                manufacturer TEXT,
                model TEXT,
                serial_number TEXT,
                assigned_zone TEXT,
                network_identifier TEXT,
                certificate_fingerprint TEXT,
                public_key TEXT,
                firmware_version TEXT,
                status TEXT,
                last_heartbeat TEXT,
                registration_timestamp TEXT,
                last_verified_timestamp TEXT,
                revoked_at TEXT,
                revocation_reason TEXT
            )
        ''')

        # Security Events
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS security_events (
                security_event_id TEXT PRIMARY KEY,
                event_type TEXT,
                severity TEXT,
                source_ip TEXT,
                user_id TEXT,
                device_id TEXT,
                endpoint TEXT,
                description TEXT,
                metadata TEXT,
                detected_at TEXT,
                resolved_at TEXT,
                status TEXT,
                evidence_reference TEXT,
                blockchain_transaction_id TEXT
            )
        ''')

        # Blockchain Transactions
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS blockchain_transactions (
                transaction_id TEXT PRIMARY KEY,
                entity_id TEXT,
                entity_type TEXT,
                transaction_type TEXT,
                hash TEXT,
                previous_hash TEXT,
                timestamp TEXT,
                metadata TEXT
            )
        ''')

        # Evidence
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS evidence (
                evidence_id TEXT PRIMARY KEY,
                event_id TEXT,
                file_name TEXT,
                media_type TEXT,
                storage_reference TEXT,
                encrypted INTEGER DEFAULT 0,
                file_size INTEGER,
                sha256_hash TEXT,
                created_at TEXT,
                created_by TEXT,
                retention_until TEXT,
                classification TEXT,
                current_status TEXT
            )
        ''')

        # Evidence Chain of Custody
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS evidence_chain_of_custody (
                id TEXT PRIMARY KEY,
                evidence_id TEXT,
                action TEXT,
                actor_id TEXT,
                actor_role TEXT,
                timestamp TEXT,
                reason TEXT,
                source_ip TEXT,
                device_id TEXT,
                previous_record_hash TEXT,
                current_record_hash TEXT,
                blockchain_transaction_id TEXT
            )
        ''')

        # Access Audit Logs
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS access_audit_logs (
                id TEXT PRIMARY KEY,
                user_id TEXT,
                role TEXT,
                action TEXT,
                resource TEXT,
                timestamp TEXT,
                reason TEXT,
                source_ip TEXT,
                device_id TEXT,
                blockchain_transaction_id TEXT
            )
        ''')

        # AI Model Registry
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS ai_model_registry (
                model_id TEXT PRIMARY KEY,
                model_name TEXT,
                model_type TEXT,
                version TEXT,
                file_hash TEXT,
                training_dataset_hash TEXT,
                framework TEXT,
                metrics TEXT,
                confidence_thresholds TEXT,
                created_by TEXT,
                approval_status TEXT,
                deployed_at TEXT,
                retired_at TEXT,
                blockchain_transaction_id TEXT
            )
        ''')

        # Security Policies
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS security_policies (
                policy_name TEXT PRIMARY KEY,
                policy_value TEXT
            )
        ''')

        conn.commit()

        # Seed admin user if it doesn't exist
        cursor.execute("SELECT * FROM users WHERE username = 'admin'")
        if not cursor.fetchone():
            hashed_pwd = pwd_context.hash("admin123")
            cursor.execute('''
                INSERT INTO users (id, username, password_hash, role)
                VALUES (?, ?, ?, ?)
            ''', ("user-admin-001", "admin", hashed_pwd, "ADMIN"))
            conn.commit()
            logger.info("Seeded default admin user.")

        conn.close()

db_manager = DBManager()
