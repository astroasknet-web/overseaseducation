-- Overseas education enquiries: the free-counselling form and the newsletter box on the public home page.
-- No account is needed to send one, so there is no user_id. Idempotent like every portal migration.

CREATE TABLE IF NOT EXISTS overseas_enquiries (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  kind VARCHAR(16) NOT NULL DEFAULT 'counselling',
  full_name VARCHAR(120) NOT NULL DEFAULT '',
  email VARCHAR(190) NOT NULL,
  phone VARCHAR(30) NOT NULL DEFAULT '',
  destination VARCHAR(60) NOT NULL DEFAULT '',
  study_level VARCHAR(40) NOT NULL DEFAULT '',
  intake VARCHAR(40) NOT NULL DEFAULT '',
  service VARCHAR(80) NOT NULL DEFAULT '',
  source VARCHAR(60) NOT NULL DEFAULT 'home',
  status VARCHAR(20) NOT NULL DEFAULT 'new',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_overseas_enquiries_created (created_at),
  KEY idx_overseas_enquiries_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
