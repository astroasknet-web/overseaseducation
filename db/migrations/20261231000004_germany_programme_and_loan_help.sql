-- Germany public universities programme: one row per enrolled student (created when the programme is paid for, or by staff).
-- Loan help: a student asks Yugty to help with an education loan; staff follow the request through to a bank decision.
-- Idempotent like every portal migration.

CREATE TABLE IF NOT EXISTS germany_enrolments (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'enrolled',
  test_score DECIMAL(5,2) NULL,
  consistent TINYINT NULL,
  outcome VARCHAR(12) NOT NULL DEFAULT 'pending',
  refund_inr INT NULL,
  note VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_germany_enrolment_user UNIQUE (user_id),
  CONSTRAINT fk_germany_enrolment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS loan_help_requests (
  id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount_inr BIGINT NOT NULL DEFAULT 0,
  country VARCHAR(40) NOT NULL DEFAULT '',
  university VARCHAR(120) NOT NULL DEFAULT '',
  intake VARCHAR(30) NOT NULL DEFAULT '',
  coapplicant VARCHAR(20) NOT NULL DEFAULT '',
  collateral VARCHAR(12) NOT NULL DEFAULT '',
  phone VARCHAR(30) NOT NULL DEFAULT '',
  note VARCHAR(500) NOT NULL DEFAULT '',
  status VARCHAR(12) NOT NULL DEFAULT 'new',
  staff_note VARCHAR(500) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_loan_help_user (user_id),
  KEY idx_loan_help_status (status, created_at),
  CONSTRAINT fk_loan_help_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
