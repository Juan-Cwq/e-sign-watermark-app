from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2
from cryptography.hazmat.backends import default_backend
import base64
import os
import hashlib

class SecurityManager:
    """Handle encryption and security for sensitive data"""
    
    def __init__(self, encryption_key=None):
        """
        Initialize security manager
        
        Args:
            encryption_key: Base encryption key (will be derived for actual use)
        """
        if encryption_key:
            self.key = self._derive_key(encryption_key.encode())
        else:
            # Generate a new key if none provided
            self.key = Fernet.generate_key()
        
        self.cipher = Fernet(self.key)
    
    def _derive_key(self, password, salt=None):
        """Derive a Fernet key from a password"""
        if salt is None:
            salt = b'signature_watermark_app_salt'  # In production, use a random salt
        
        kdf = PBKDF2(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
            backend=default_backend()
        )
        
        key = base64.urlsafe_b64encode(kdf.derive(password))
        return key
    
    def encrypt_data(self, data):
        """
        Encrypt data (string or bytes)
        
        Args:
            data: Data to encrypt
            
        Returns:
            Encrypted data as base64 string
        """
        try:
            if isinstance(data, str):
                data = data.encode()
            
            encrypted = self.cipher.encrypt(data)
            return base64.b64encode(encrypted).decode()
        
        except Exception as e:
            raise Exception(f"Encryption error: {str(e)}")
    
    def decrypt_data(self, encrypted_data):
        """
        Decrypt data
        
        Args:
            encrypted_data: Base64 encoded encrypted data
            
        Returns:
            Decrypted data as string
        """
        try:
            encrypted_bytes = base64.b64decode(encrypted_data)
            decrypted = self.cipher.decrypt(encrypted_bytes)
            return decrypted.decode()
        
        except Exception as e:
            raise Exception(f"Decryption error: {str(e)}")
    
    def encrypt_file(self, input_path, output_path=None):
        """
        Encrypt a file
        
        Args:
            input_path: Path to file to encrypt
            output_path: Path for encrypted file (optional)
            
        Returns:
            Path to encrypted file
        """
        try:
            if output_path is None:
                output_path = input_path + '.encrypted'
            
            with open(input_path, 'rb') as file:
                data = file.read()
            
            encrypted = self.cipher.encrypt(data)
            
            with open(output_path, 'wb') as file:
                file.write(encrypted)
            
            return output_path
        
        except Exception as e:
            raise Exception(f"File encryption error: {str(e)}")
    
    def decrypt_file(self, input_path, output_path=None):
        """
        Decrypt a file
        
        Args:
            input_path: Path to encrypted file
            output_path: Path for decrypted file (optional)
            
        Returns:
            Path to decrypted file
        """
        try:
            if output_path is None:
                output_path = input_path.replace('.encrypted', '')
            
            with open(input_path, 'rb') as file:
                encrypted_data = file.read()
            
            decrypted = self.cipher.decrypt(encrypted_data)
            
            with open(output_path, 'wb') as file:
                file.write(decrypted)
            
            return output_path
        
        except Exception as e:
            raise Exception(f"File decryption error: {str(e)}")
    
    def hash_data(self, data, algorithm='sha256'):
        """
        Create a hash of data
        
        Args:
            data: Data to hash
            algorithm: Hash algorithm (sha256, sha512, md5)
            
        Returns:
            Hex digest of hash
        """
        try:
            if isinstance(data, str):
                data = data.encode()
            
            if algorithm == 'sha256':
                return hashlib.sha256(data).hexdigest()
            elif algorithm == 'sha512':
                return hashlib.sha512(data).hexdigest()
            elif algorithm == 'md5':
                return hashlib.md5(data).hexdigest()
            else:
                raise ValueError(f"Unsupported algorithm: {algorithm}")
        
        except Exception as e:
            raise Exception(f"Hashing error: {str(e)}")
    
    def generate_secure_token(self, length=32):
        """Generate a secure random token"""
        return base64.urlsafe_b64encode(os.urandom(length)).decode()[:length]
    
    def verify_file_integrity(self, file_path, expected_hash, algorithm='sha256'):
        """
        Verify file integrity using hash comparison
        
        Args:
            file_path: Path to file
            expected_hash: Expected hash value
            algorithm: Hash algorithm to use
            
        Returns:
            True if hashes match, False otherwise
        """
        try:
            with open(file_path, 'rb') as file:
                data = file.read()
            
            actual_hash = self.hash_data(data, algorithm)
            return actual_hash == expected_hash
        
        except Exception as e:
            raise Exception(f"Integrity verification error: {str(e)}")
    
    def sanitize_filename(self, filename):
        """
        Sanitize filename to prevent directory traversal attacks
        
        Args:
            filename: Original filename
            
        Returns:
            Sanitized filename
        """
        # Remove any path components
        filename = os.path.basename(filename)
        
        # Remove or replace dangerous characters
        dangerous_chars = ['..', '/', '\\', '\0', ':', '*', '?', '"', '<', '>', '|']
        for char in dangerous_chars:
            filename = filename.replace(char, '_')
        
        return filename
    
    def validate_file_type(self, file_path, allowed_extensions):
        """
        Validate file type based on extension and magic bytes
        
        Args:
            file_path: Path to file
            allowed_extensions: List of allowed extensions
            
        Returns:
            True if valid, False otherwise
        """
        # Check extension
        ext = file_path.rsplit('.', 1)[-1].lower()
        if ext not in allowed_extensions:
            return False
        
        # Check magic bytes (file signature)
        magic_bytes = {
            'png': b'\x89PNG\r\n\x1a\n',
            'jpg': b'\xff\xd8\xff',
            'jpeg': b'\xff\xd8\xff',
            'pdf': b'%PDF',
            'svg': b'<?xml'
        }
        
        if ext in magic_bytes:
            try:
                with open(file_path, 'rb') as file:
                    header = file.read(len(magic_bytes[ext]))
                    return header.startswith(magic_bytes[ext])
            except:
                return False
        
        return True
    
    def rate_limit_check(self, identifier, max_requests=100, time_window=3600):
        """
        Simple rate limiting check (in-memory)
        In production, use Redis or similar
        
        Args:
            identifier: Unique identifier (IP, user ID, etc.)
            max_requests: Maximum requests allowed
            time_window: Time window in seconds
            
        Returns:
            True if within limits, False otherwise
        """
        # This is a simplified implementation
        # In production, implement with Redis or database
        return True
