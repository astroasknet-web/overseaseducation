-- Two-step verification was removed from the product. Clear any stored secrets and recovery codes so nobody is asked for a second factor. Idempotent.
UPDATE users SET mfa_secret = NULL, mfa_enabled_at = NULL, mfa_recovery = NULL, mfa_last_step = NULL WHERE mfa_enabled_at IS NOT NULL OR mfa_secret IS NOT NULL;
