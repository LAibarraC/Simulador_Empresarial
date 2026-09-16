import os
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import padding, hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.backends import default_backend
import hmac
import hashlib

class SecurityUtils:
    """
    Utility for AES-256 encryption and Blind Indexing (HMAC-SHA256)
    to allow searching encrypted data.
    """
    def __init__(self):
        # Encryption Key (32 bytes for AES-256)
        # In production, this should be a fixed key from .env
        self.secret_key = os.getenv("ENCRYPTION_KEY", "super-secret-key-32-chars-long-!!").encode()
        # We need exactly 32 bytes for AES-256
        self.key = self.secret_key[:32].ljust(32, b'0')
        # Salt for hashing (Blind Index)
        self.salt = os.getenv("HASH_SALT", "another-secret-salt-for-hashing").encode()

    def encrypt(self, plaintext: str) -> str:
        if not plaintext:
            return None

        iv = os.urandom(16)
        cipher = Cipher(algorithms.AES(self.key), modes.CBC(iv), backend=default_backend())
        encryptor = cipher.encryptor()

        # Padding to match AES block size (128 bits)
        padder = padding.PKCS7(128).padder()
        padded_data = padder.update(plaintext.encode()) + padder.finalize()

        ciphertext = encryptor.update(padded_data) + encryptor.finalize()

        # Return IV + Ciphertext as base64 string
        return base64.b64encode(iv + ciphertext).decode('utf-8')

    def decrypt(self, ciphertext_b64: str) -> str:
        if not ciphertext_b64:
            return None

        try:
            data = base64.b64decode(ciphertext_b64)
            iv = data[:16]
            ciphertext = data[16:]

            cipher = Cipher(algorithms.AES(self.key), modes.CBC(iv), backend=default_backend())
            decryptor = cipher.decryptor()

            padded_plaintext = decryptor.update(ciphertext) + decryptor.finalize()

            unpadder = padding.PKCS7(128).unpadder()
            plaintext = unpadder.update(padded_plaintext) + unpadder.finalize()

            return plaintext.decode('utf-8')
        except Exception as e:
            print(f"Decryption error: {e}")
            return "[Error Descifrando]"

    def generate_blind_index(self, plaintext: str) -> str:
        """
        Generates a deterministic hash of the plaintext for searching.
        Uses HMAC-SHA256 to ensure the hash cannot be reversed without the salt.
        """
        if not plaintext:
            return None

        h = hmac.new(self.salt, plaintext.encode(), hashlib.sha256)
        return h.hexdigest()

# Singleton instance
security = SecurityUtils()
