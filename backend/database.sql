-- ============================================================
-- ABle Markets — MySQL Database Schema
-- Engine: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci
-- ============================================================

CREATE DATABASE IF NOT EXISTS `ablemarkets`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `ablemarkets`;

-- ─── Users ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS `users` (
    `id`            BIGINT UNSIGNED     NOT NULL AUTO_INCREMENT,
    `name`          VARCHAR(120)        NOT NULL,
    `email`         VARCHAR(180)        NOT NULL,
    `password_hash` VARCHAR(255)        NOT NULL,
    `phone`         VARCHAR(30)         NULL,
    `country`       VARCHAR(80)         NULL,
    `account_type`  ENUM('standard','raw_ecn','pro_ecn','demo')
                                        NOT NULL DEFAULT 'standard',
    `balance`       DECIMAL(18,2)       NOT NULL DEFAULT 0.00,
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
    `type`       ENUM('deposit','withdrawal')
                                     NOT NULL,
    `amount`     DECIMAL(18,2)       NOT NULL,
    `currency`   CHAR(3)             NOT NULL DEFAULT 'USD',
    `method`     VARCHAR(60)         NOT NULL,
    `status`     ENUM('pending','processing','completed','rejected')
                                     NOT NULL DEFAULT 'pending',
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

INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `status`, `account_type`, `email_verified_at`)
VALUES (
    'Admin User',
    'admin@ablemarkets.com',
    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin',
    'active',
    'pro_ecn',
    NOW()
);

-- Demo trader account — password = "trader123"
INSERT INTO `users` (`name`, `email`, `password_hash`, `role`, `status`, `account_type`, `balance`, `email_verified_at`)
VALUES (
    'Demo Trader',
    'trader@ablemarkets.com',
    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'trader',
    'active',
    'raw_ecn',
    10000.00,
    NOW()
);
