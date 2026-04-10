-- ============================================================
-- Vantage Markets — MySQL Database Schema
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ============================================================

CREATE DATABASE IF NOT EXISTS `vantagemarkets`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `vantagemarkets`;

-- ─── Users ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `users` (
    `id`            BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `name`          VARCHAR(120)        NOT NULL,
    `email`         VARCHAR(180)        NOT NULL,
    `password_hash` VARCHAR(255)        NOT NULL,
    `phone`         VARCHAR(30)         NULL,
    `country`       VARCHAR(80)         NULL,
    `wallet_balance` DECIMAL(18,2)      NOT NULL DEFAULT 0.00,
    `role`          ENUM('trader','admin')
                                        NOT NULL DEFAULT 'trader',
    `status`        ENUM('active','pending','suspended','deleted')
                                        NOT NULL DEFAULT 'pending',
    `email_verified_at` TIMESTAMP       NULL,
    `last_login_at`     TIMESTAMP       NULL,
    `created_at`    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                 ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE  KEY `uq_users_email`  (`email`),
    INDEX   `idx_users_status`    (`status`),
    INDEX   `idx_users_role`      (`role`),
    INDEX   `idx_users_created`   (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Transactions ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `transactions` (
    `id`         BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`    BIGINT UNSIGNED     NOT NULL,
    `reference`  VARCHAR(30)         NOT NULL,
    `type`       ENUM('deposit','withdrawal', 'internal_transfer')
                                     NOT NULL,
    `amount`     DECIMAL(18,2)       NOT NULL,
    `currency`   CHAR(3)             NOT NULL DEFAULT 'USD',
    `method`     VARCHAR(60)         NOT NULL,
    `status`     ENUM('pending','processing','completed','rejected')
                                     NOT NULL DEFAULT 'pending',
    `receipt_url` VARCHAR(255)       NULL,
    `tx_hash`    VARCHAR(255)        NULL,
    `from_account_id` BIGINT UNSIGNED NULL,
    `to_account_id`   BIGINT UNSIGNED NULL,
    `notes`      TEXT                NULL,
    `created_at` TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP
                                              ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE  KEY `uq_txn_reference`   (`reference`),
    INDEX   `idx_txn_user`           (`user_id`),
    INDEX   `idx_txn_status`         (`status`),
    INDEX   `idx_txn_type`           (`type`),
    INDEX   `idx_txn_created`        (`created_at`),

    CONSTRAINT `fk_txn_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Leads ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `leads` (
    `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `name`       VARCHAR(120)    NULL,
    `email`      VARCHAR(180)    NOT NULL,
    `phone`      VARCHAR(30)     NULL,
    `country`    VARCHAR(80)     NULL,
    `source`     VARCHAR(60)     NOT NULL DEFAULT 'website',
    `message`    TEXT            NULL,
    `created_at` TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    INDEX `idx_leads_email`   (`email`),
    INDEX `idx_leads_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Trading Accounts ────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `trading_accounts` (
    `id`             BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `user_id`        BIGINT UNSIGNED     NOT NULL,
    `account_number` VARCHAR(20)         NOT NULL,
    `type`           ENUM('standard_stp', 'raw_ecn', 'pro_ecn') NOT NULL,
    `is_demo`        BOOLEAN             NOT NULL DEFAULT FALSE,
    `balance`        DECIMAL(18,2)       NOT NULL DEFAULT 0.00,
    `leverage`       INTEGER             NOT NULL DEFAULT 500,
    `currency`       CHAR(3)             NOT NULL DEFAULT 'USD',
    `status`         ENUM('active', 'suspended', 'closed') NOT NULL DEFAULT 'active',
    `created_at`     TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    UNIQUE KEY `uq_acc_number` (`account_number`),
    CONSTRAINT `fk_acc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── KYC Documents ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `kyc_documents` (
    `id`               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`          BIGINT UNSIGNED NOT NULL,
    `document_type`    ENUM('identity', 'address') NOT NULL,
    `file_url`         VARCHAR(255)    NOT NULL,
    `status`           ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
    `rejection_reason` TEXT            NULL,
    `created_at`       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    CONSTRAINT `fk_kyc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Orders & Positions ─────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `orders` (
    `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`            BIGINT UNSIGNED NOT NULL,
    `trading_account_id` BIGINT UNSIGNED NOT NULL,
    `symbol`             VARCHAR(20)     NOT NULL,
    `type`               ENUM('buy', 'sell') NOT NULL,
    `order_type`         ENUM('market', 'limit', 'stop') NOT NULL,
    `lots`               DECIMAL(10,2)   NOT NULL,
    `price`              DECIMAL(18,5)   NULL,
    `stop_loss`          DECIMAL(18,5)   NULL,
    `take_profit`        DECIMAL(18,5)   NULL,
    `status`             ENUM('open', 'filled', 'cancelled', 'closed') NOT NULL DEFAULT 'open',
    `created_at`         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_order_acc`  FOREIGN KEY (`trading_account_id`) REFERENCES `trading_accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `positions` (
    `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`            BIGINT UNSIGNED NOT NULL,
    `trading_account_id` BIGINT UNSIGNED NOT NULL,
    `symbol`             VARCHAR(20)     NOT NULL,
    `type`               ENUM('long', 'short') NOT NULL,
    `lots`               DECIMAL(10,2)   NOT NULL,
    `entry_price`        DECIMAL(18,5)   NOT NULL,
    `current_price`      DECIMAL(18,5)   NOT NULL,
    `stop_loss`          DECIMAL(18,5)   NULL,
    `take_profit`        DECIMAL(18,5)   NULL,
    `pnl`                DECIMAL(18,2)   NOT NULL DEFAULT 0.00,
    `status`             ENUM('open', 'closed') NOT NULL DEFAULT 'open',
    `created_at`         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `closed_at`          TIMESTAMP       NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT `fk_pos_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_pos_acc`  FOREIGN KEY (`trading_account_id`) REFERENCES `trading_accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Copy Trading ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `signals` (
    `id`          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`     BIGINT UNSIGNED NOT NULL,
    `name`        VARCHAR(100)    NOT NULL,
    `description` TEXT            NULL,
    `roi`         DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    `win_rate`    DECIMAL(5,2)    NOT NULL DEFAULT 0.00,
    `drawdown`    DECIMAL(5,2)    NOT NULL DEFAULT 0.00,
    `subscribers` INTEGER         NOT NULL DEFAULT 0,
    `status`      ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at`  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    CONSTRAINT `fk_sig_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `copy_relationships` (
    `id`                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `copier_id`          BIGINT UNSIGNED NOT NULL,
    `provider_id`        BIGINT UNSIGNED NOT NULL,
    `trading_account_id` BIGINT UNSIGNED NOT NULL,
    `risk_multiplier`    DECIMAL(5,2)    NOT NULL DEFAULT 1.00,
    `status`             ENUM('active', 'paused', 'stopped') NOT NULL DEFAULT 'active',
    `created_at`         TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    CONSTRAINT `fk_copy_copier` FOREIGN KEY (`copier_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_copy_provider` FOREIGN KEY (`provider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_copy_acc` FOREIGN KEY (`trading_account_id`) REFERENCES `trading_accounts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Password Reset Tokens ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `password_resets` (
    `id`         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    `user_id`    BIGINT UNSIGNED NOT NULL,
    `token_hash` VARCHAR(255)    NOT NULL,
    `expires_at` TIMESTAMP       NOT NULL,
    `used_at`    TIMESTAMP       NULL,
    `created_at` TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (`id`),
    INDEX `idx_pr_user`    (`user_id`),
    INDEX `idx_pr_expires` (`expires_at`),

    CONSTRAINT `fk_pr_user`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─── Seed Data ────────────────────────────────────────────────────────────────
-- Default admin account — change the password immediately after deployment.
-- Hash below = bcrypt of "admin123" with cost 12.

INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `status`, `wallet_balance`, `email_verified_at`)
VALUES (
    'Admin User',
    'admin@vantagemarkets.com',
    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    'active',
    0.00,
    NOW()
);

-- Demo trader account — password = "trader123"
INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `status`, `wallet_balance`, `email_verified_at`)
VALUES (
    'Demo Trader',
    'trader@vantagemarkets.com',
    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'trader',
    'active',
    1000.00,
    NOW()
);

INSERT INTO `trading_accounts` (`user_id`, `account_number`, `type`, `is_demo`, `balance`, `leverage`)
VALUES (2, '8800123', 'raw_ecn', FALSE, 5000.00, 500);

INSERT INTO `trading_accounts` (`user_id`, `account_number`, `type`, `is_demo`, `balance`, `leverage`)
VALUES (2, '9900456', 'standard_stp', TRUE, 10000.00, 500);

-- Dummy Signal Providers
INSERT INTO `signals` (`user_id`, `name`, `description`, `roi`, `win_rate`, `drawdown`, `subscribers`, `status`)
VALUES
(1, 'Alpha Elite Strategy', 'High-frequency trading on major forex pairs.', 145.20, 78.50, 12.30, 1250, 'active'),
(1, 'Steady Gains AI', 'Low-risk algorithmic trading focusing on stability.', 42.15, 89.20, 4.50, 840, 'active'),
(1, 'Crypto Whale Tracker', 'Following large movements in the BTC and ETH markets.', 210.80, 65.00, 25.40, 3100, 'active');

-- Dummy Copy Relationships for Demo Trader (user_id 2)
INSERT INTO `copy_relationships` (`copier_id`, `provider_id`, `trading_account_id`, `risk_multiplier`, `status`)
VALUES
(2, 1, 1, 1.00, 'active'),
(2, 2, 1, 0.50, 'active');
