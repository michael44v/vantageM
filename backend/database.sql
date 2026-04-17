-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Apr 12, 2026 at 10:19 AM
-- Server version: 8.0.45
-- PHP Version: 8.4.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `jvrzjzbc_vantage_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `copy_relationships`
--

CREATE TABLE `copy_relationships` (
  `id` bigint UNSIGNED NOT NULL,
  `copier_id` bigint UNSIGNED NOT NULL,
  `provider_id` bigint UNSIGNED NOT NULL,
  `trading_account_id` bigint UNSIGNED NOT NULL,
  `risk_multiplier` decimal(5,2) NOT NULL DEFAULT '1.00',
  `status` enum('active','paused','stopped') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `copy_relationships`
--

INSERT INTO `copy_relationships` (`id`, `copier_id`, `provider_id`, `trading_account_id`, `risk_multiplier`, `status`, `created_at`) VALUES
(2, 4, 2, 5, 1.00, 'active', '2026-04-11 07:10:15'),
(3, 4, 5, 6, 1.00, 'active', '2026-04-11 07:10:40'),
(9, 4, 1, 5, 1.00, 'active', '2026-04-11 14:34:16');

-- --------------------------------------------------------

--
-- Table structure for table `deposit_requests`
--

CREATE TABLE `deposit_requests` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `method` enum('bank_wire','crypto') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'bank_wire',
  `crypto_symbol` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tx_ref` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `receipt_url` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `admin_note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `deposit_requests`
--

INSERT INTO `deposit_requests` (`id`, `user_id`, `amount`, `currency`, `method`, `crypto_symbol`, `tx_ref`, `receipt_url`, `status`, `admin_note`, `created_at`, `updated_at`) VALUES
(1, 4, 1000.00, 'USD', 'crypto', 'BTC', '2740582-84u-9ur-992804', 'https://res.cloudinary.com/dguvkirdr/image/upload/v1775913854/vantage_deposits/ogoudgt3wnzkgn2j76mf.png', 'pending', NULL, '2026-04-11 13:24:15', '2026-04-11 13:24:15'),
(2, 4, 60000.00, 'USD', 'crypto', 'ETH', 'yiu98708079', 'https://res.cloudinary.com/dguvkirdr/image/upload/v1775915681/vantage_deposits/unnb5mxiobgpwj3o64nm.png', 'pending', NULL, '2026-04-11 13:54:44', '2026-04-11 13:54:44');

-- --------------------------------------------------------

--
-- Table structure for table `email_verifications`
--

CREATE TABLE `email_verifications` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `email_verifications`
--

INSERT INTO `email_verifications` (`id`, `user_id`, `token`, `expires_at`, `used_at`, `created_at`) VALUES
(2, 33, 'acfb6854d5f7f340e6f4e01fbfb26c52458bb00ec70d5324cb7454a06a436166', '2026-04-13 17:48:18', NULL, '2026-04-12 13:48:18'),
(3, 34, '08581fa05ac94e9cab3514b9c552312882a027fb1518ff3c2c4df5c0e0ea6c6c', '2026-04-13 17:57:24', NULL, '2026-04-12 13:57:24');

-- --------------------------------------------------------

--
-- Table structure for table `kyc_documents`
--

CREATE TABLE `kyc_documents` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `document_type` enum('identity','address') COLLATE utf8mb4_unicode_ci NOT NULL,
  `file_url` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `rejection_reason` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `kyc_documents`
--

INSERT INTO `kyc_documents` (`id`, `user_id`, `document_type`, `file_url`, `status`, `rejection_reason`, `created_at`) VALUES
(1, 4, 'identity', 'https://res.cloudinary.com/dguvkirdr/image/upload/v1775914381/vantage_kyc/ev4qjaagmsi0fqhsgpwq.png', 'pending', NULL, '2026-04-11 13:33:04');

-- --------------------------------------------------------

--
-- Table structure for table `leads`
--

CREATE TABLE `leads` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'website',
  `message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `trading_account_id` bigint UNSIGNED NOT NULL,
  `symbol` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('buy','sell') COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_type` enum('market','limit','stop') COLLATE utf8mb4_unicode_ci NOT NULL,
  `lots` decimal(10,2) NOT NULL,
  `price` decimal(18,5) DEFAULT NULL,
  `stop_loss` decimal(18,5) DEFAULT NULL,
  `take_profit` decimal(18,5) DEFAULT NULL,
  `status` enum('open','filled','cancelled','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `password_resets`
--

CREATE TABLE `password_resets` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `token_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `positions`
--

CREATE TABLE `positions` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `trading_account_id` bigint UNSIGNED NOT NULL,
  `symbol` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('long','short') COLLATE utf8mb4_unicode_ci NOT NULL,
  `lots` decimal(10,2) NOT NULL,
  `entry_price` decimal(18,5) NOT NULL,
  `current_price` decimal(18,5) NOT NULL,
  `stop_loss` decimal(18,5) DEFAULT NULL,
  `take_profit` decimal(18,5) DEFAULT NULL,
  `pnl` decimal(18,2) NOT NULL DEFAULT '0.00',
  `execution_type` enum('manual','copy') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'manual',
  `copy_trade_id` bigint UNSIGNED DEFAULT NULL,
  `status` enum('open','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `closed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `positions`
--

INSERT INTO `positions` (`id`, `user_id`, `trading_account_id`, `symbol`, `type`, `lots`, `entry_price`, `current_price`, `stop_loss`, `take_profit`, `pnl`, `execution_type`, `copy_trade_id`, `status`, `created_at`, `closed_at`) VALUES
(1, 4, 3, 'EUR/USD', 'long', 0.01, 1.08445, 1.08494, NULL, NULL, 0.49, 'manual', NULL, 'closed', '2026-04-09 22:31:10', '2026-04-09 22:31:21'),
(2, 4, 3, 'EUR/USD', 'long', 1.00, 1.08671, 1.08701, NULL, NULL, 30.00, 'manual', NULL, 'closed', '2026-04-09 22:32:24', '2026-04-11 07:51:41'),
(3, 4, 6, 'EUR/USD', 'long', 10.00, 1.08604, 1.08614, NULL, NULL, 100.00, 'manual', NULL, 'closed', '2026-04-09 22:34:48', '2026-04-09 22:34:52'),
(4, 4, 6, 'EUR/USD', 'long', 10.00, 1.08654, 1.08693, NULL, NULL, 390.00, 'manual', NULL, 'closed', '2026-04-09 22:34:58', '2026-04-09 22:36:08'),
(5, 4, 4, 'EUR/USD', 'short', 1.00, 1.08707, 1.08717, NULL, NULL, -10.00, 'manual', NULL, 'closed', '2026-04-09 22:36:35', '2026-04-09 22:36:42'),
(6, 4, 4, 'EUR/USD', 'long', 0.10, 1.08691, 1.08643, NULL, NULL, -4.80, 'manual', NULL, 'closed', '2026-04-09 22:37:10', '2026-04-09 22:37:32'),
(7, 4, 4, 'EUR/USD', 'long', 0.01, 1.08670, 1.08670, NULL, NULL, 0.00, 'manual', NULL, 'open', '2026-04-09 22:39:43', NULL),
(8, 4, 4, 'EUR/USD', 'short', 0.10, 1.08614, 1.08650, NULL, NULL, -3.60, 'manual', NULL, 'closed', '2026-04-09 22:40:02', '2026-04-09 22:40:09'),
(9, 4, 5, 'EUR/USD', 'long', 0.50, 1.08823, 1.08809, NULL, NULL, -7.00, 'manual', NULL, 'closed', '2026-04-10 06:04:33', '2026-04-10 06:04:40'),
(10, 4, 5, 'EUR/USD', 'long', 0.50, 1.08564, 1.08564, NULL, NULL, 0.00, 'manual', NULL, 'closed', '2026-04-10 06:11:55', '2026-04-10 06:19:39'),
(11, 4, 5, 'EUR/USD', 'long', 0.20, 1.08694, 1.08647, NULL, NULL, -9.40, 'manual', NULL, 'closed', '2026-04-10 06:20:41', '2026-04-10 06:42:22'),
(12, 4, 5, 'EUR/USD', 'long', 0.20, 1.08762, 1.08761, NULL, NULL, -0.20, 'manual', NULL, 'closed', '2026-04-10 06:22:46', '2026-04-10 06:42:07'),
(13, 4, 5, 'EUR/USD', 'long', 0.50, 1.08794, 1.08803, NULL, NULL, 4.50, 'manual', NULL, 'closed', '2026-04-10 06:34:50', '2026-04-10 06:35:02'),
(14, 4, 5, 'EUR/USD', 'long', 0.50, 1.08598, 1.08571, NULL, NULL, -13.50, 'manual', NULL, 'closed', '2026-04-10 06:36:24', '2026-04-10 06:36:29'),
(15, 4, 5, 'EUR/USD', 'long', 0.50, 1.08552, 1.08535, NULL, NULL, -8.50, 'manual', NULL, 'closed', '2026-04-10 06:42:35', '2026-04-10 06:42:48'),
(16, 4, 5, 'EUR/USD', 'long', 0.50, 1.08256, 1.08221, NULL, NULL, -17.50, 'manual', NULL, 'closed', '2026-04-10 06:44:06', '2026-04-10 06:44:10'),
(17, 4, 5, 'EUR/USD', 'long', 0.50, 1.08347, 1.08377, NULL, NULL, 15.00, 'manual', NULL, 'closed', '2026-04-10 06:44:38', '2026-04-10 06:44:48'),
(18, 4, 5, 'EUR/USD', 'long', 0.50, 1.08206, 1.08177, NULL, NULL, -14.50, 'manual', NULL, 'closed', '2026-04-10 06:44:59', '2026-04-10 06:45:02'),
(19, 4, 5, 'EUR/USD', 'long', 0.50, 1.08324, 1.08361, NULL, NULL, 18.50, 'manual', NULL, 'closed', '2026-04-10 06:45:09', '2026-04-10 06:55:27'),
(20, 4, 5, 'EUR/USD', 'short', 0.50, 1.08264, 1.08308, NULL, NULL, -22.00, 'manual', NULL, 'closed', '2026-04-10 06:45:26', '2026-04-10 06:45:30'),
(21, 4, 5, 'EUR/USD', 'long', 0.50, 1.08344, 1.08344, NULL, NULL, 0.00, 'manual', NULL, 'closed', '2026-04-10 06:45:39', '2026-04-10 06:45:53'),
(22, 4, 5, 'EUR/USD', 'short', 0.50, 1.08273, 1.08310, NULL, NULL, -18.50, 'manual', NULL, 'closed', '2026-04-10 06:46:13', '2026-04-10 06:55:02'),
(23, 4, 5, 'EUR/USD', 'long', 0.50, 1.08775, 1.08779, NULL, NULL, 2.00, 'manual', NULL, 'closed', '2026-04-10 06:58:38', '2026-04-10 06:59:23'),
(24, 4, 5, 'XAU/USD', 'long', 0.10, 2345.09956, 2345.09948, NULL, NULL, -0.80, 'manual', NULL, 'closed', '2026-04-10 07:02:02', '2026-04-10 07:06:56'),
(25, 4, 5, 'EUR/USD', 'long', 0.01, 1.08418, 1.08390, NULL, NULL, -0.28, 'manual', NULL, 'closed', '2026-04-10 07:07:03', '2026-04-10 07:14:40'),
(26, 4, 5, 'EUR/USD', 'long', 0.01, 1.08438, 1.08438, NULL, NULL, 0.00, 'manual', NULL, 'open', '2026-04-10 07:14:35', NULL),
(27, 5, 7, 'XAU/USD', 'long', 0.10, 2310.50000, 2345.10000, NULL, NULL, 346.00, 'manual', NULL, 'closed', '2026-04-01 06:17:40', '2026-04-02 06:17:40'),
(28, 5, 7, 'XAU/USD', 'long', 0.15, 2298.00000, 2320.50000, NULL, NULL, 337.50, 'manual', NULL, 'closed', '2026-04-03 06:17:40', '2026-04-04 06:17:40'),
(29, 5, 7, 'XAU/USD', 'short', 0.10, 2380.00000, 2355.00000, NULL, NULL, 250.00, 'manual', NULL, 'closed', '2026-04-05 06:17:40', '2026-04-06 06:17:40'),
(30, 5, 7, 'XAU/USD', 'long', 0.10, 2305.00000, 2298.00000, NULL, NULL, -70.00, 'manual', NULL, 'closed', '2026-04-07 06:17:40', '2026-04-08 06:17:40'),
(31, 6, 8, 'EUR/USD', 'long', 0.50, 1.08200, 1.08542, NULL, NULL, 171.00, 'manual', NULL, 'closed', '2026-04-02 06:17:40', '2026-04-03 06:17:40'),
(32, 6, 8, 'GBP/USD', 'short', 0.30, 1.26800, 1.26431, NULL, NULL, 110.70, 'manual', NULL, 'closed', '2026-04-04 06:17:40', '2026-04-05 06:17:40'),
(33, 6, 8, 'EUR/USD', 'long', 0.50, 1.07900, 1.08100, NULL, NULL, 100.00, 'manual', NULL, 'closed', '2026-04-06 06:17:40', '2026-04-07 06:17:40'),
(34, 6, 8, 'USD/JPY', 'long', 0.20, 149.50000, 151.20000, NULL, NULL, 340.00, 'manual', NULL, 'closed', '2026-04-08 06:17:40', '2026-04-09 06:17:40'),
(35, 7, 9, 'BTC/USD', 'long', 0.05, 62000.00000, 68432.50000, NULL, NULL, 321.63, 'manual', NULL, 'closed', '2026-04-03 06:17:40', '2026-04-04 06:17:40'),
(36, 7, 9, 'ETH/USD', 'long', 0.50, 3100.00000, 3421.15000, NULL, NULL, 160.58, 'manual', NULL, 'closed', '2026-04-05 06:17:40', '2026-04-06 06:17:40'),
(37, 7, 9, 'BTC/USD', 'short', 0.03, 71000.00000, 68000.00000, NULL, NULL, 90.00, 'manual', NULL, 'closed', '2026-04-07 06:17:40', '2026-04-08 06:17:40'),
(38, 8, 10, 'USD/JPY', 'short', 0.20, 152.10000, 151.42300, NULL, NULL, 135.40, 'manual', NULL, 'closed', '2026-04-04 06:17:40', '2026-04-05 06:17:40'),
(39, 8, 10, 'EUR/USD', 'long', 0.10, 1.07500, 1.08200, NULL, NULL, 70.00, 'manual', NULL, 'closed', '2026-04-06 06:17:40', '2026-04-07 06:17:40'),
(40, 8, 10, 'AUD/USD', 'long', 0.20, 0.64800, 0.65340, NULL, NULL, 108.00, 'manual', NULL, 'closed', '2026-04-08 06:17:40', '2026-04-09 06:17:40'),
(41, 9, 11, 'EUR/USD', 'long', 1.00, 1.07900, 1.08542, NULL, NULL, 642.00, 'manual', NULL, 'closed', '2026-04-02 06:17:40', '2026-04-03 06:17:40'),
(42, 9, 11, 'XAU/USD', 'long', 0.50, 2290.00000, 2345.10000, NULL, NULL, 2755.00, 'manual', NULL, 'closed', '2026-04-04 06:17:40', '2026-04-05 06:17:40'),
(43, 9, 11, 'GBP/USD', 'long', 1.00, 1.24500, 1.26431, NULL, NULL, 1931.00, 'manual', NULL, 'closed', '2026-04-06 06:17:40', '2026-04-07 06:17:40'),
(44, 4, 5, 'EUR/USD', 'short', 1.00, 1.08528, 1.08528, NULL, NULL, 0.00, 'manual', NULL, 'open', '2026-04-11 07:48:16', NULL),
(45, 4, 5, 'EUR/USD', 'long', 0.90, 1.08401, 1.08447, NULL, NULL, 41.40, 'manual', NULL, 'closed', '2026-04-11 08:12:41', '2026-04-11 14:36:45'),
(46, 4, 5, 'XAU/USD', 'long', 0.10, 2345.09900, 2345.09900, NULL, NULL, 0.00, 'manual', NULL, 'open', '2026-04-11 14:36:35', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `signals`
--

CREATE TABLE `signals` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `roi` decimal(10,2) NOT NULL DEFAULT '0.00',
  `win_rate` decimal(5,2) NOT NULL DEFAULT '0.00',
  `drawdown` decimal(5,2) NOT NULL DEFAULT '0.00',
  `subscribers` int NOT NULL DEFAULT '0',
  `status` enum('active','inactive') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `signals`
--

INSERT INTO `signals` (`id`, `user_id`, `name`, `description`, `roi`, `win_rate`, `drawdown`, `subscribers`, `status`, `created_at`) VALUES
(1, 5, 'GoldStrategy', 'Specialises in XAU/USD with disciplined entries on key support zones. Consistent weekly targets.', 154.20, 78.00, 12.00, 1241, 'active', '2026-04-11 06:17:40'),
(2, 6, 'AlphaForex', 'Conservative multi-pair forex strategy. Consistency over aggression. Majors only.', 82.50, 65.00, 8.00, 851, 'active', '2026-04-11 06:17:40'),
(3, 7, 'CryptoElite', 'High-frequency BTC & ETH scalping. High risk, high reward. Not for the faint-hearted.', 412.00, 52.00, 35.00, 2100, 'active', '2026-04-11 06:17:40'),
(4, 8, 'StableYield', 'Low-drawdown swing trading on majors. Ideal for conservative copiers. Prioritises capital preservation.', 45.80, 92.00, 4.00, 420, 'active', '2026-04-11 06:17:40'),
(5, 9, 'Momentum Pro', 'Trend-following strategy across forex and indices. 3-5 trades per week. Strong risk management.', 198.60, 71.00, 18.00, 931, 'active', '2026-04-11 06:17:40');

-- --------------------------------------------------------

--
-- Table structure for table `trading_accounts`
--

CREATE TABLE `trading_accounts` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `account_number` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('standard_stp','raw_ecn','pro_ecn') COLLATE utf8mb4_unicode_ci NOT NULL,
  `is_demo` tinyint(1) NOT NULL DEFAULT '0',
  `balance` decimal(18,2) NOT NULL DEFAULT '0.00',
  `leverage` int NOT NULL DEFAULT '500',
  `currency` char(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `status` enum('active','suspended','closed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trading_accounts`
--

INSERT INTO `trading_accounts` (`id`, `user_id`, `account_number`, `type`, `is_demo`, `balance`, `leverage`, `currency`, `status`, `created_at`) VALUES
(1, 2, '8800123', 'raw_ecn', 0, 5000.00, 100, 'USD', 'active', '2026-04-05 09:30:09'),
(2, 2, '9900456', 'standard_stp', 1, 10000.00, 500, 'USD', 'active', '2026-04-05 09:30:09'),
(3, 4, '5791734', 'standard_stp', 1, 5810.98, 500, 'USD', 'active', '2026-04-09 18:41:35'),
(4, 4, '1646277', 'standard_stp', 1, 123.98, 200, 'USD', 'active', '2026-04-09 19:19:38'),
(5, 4, '6067828', 'standard_stp', 0, 393896.90, 500, 'USD', 'active', '2026-04-09 19:19:55'),
(6, 4, '8730277', 'standard_stp', 0, 27.10, 500, 'USD', 'active', '2026-04-09 19:41:20'),
(7, 5, '2000001', 'raw_ecn', 0, 25000.00, 500, 'USD', 'active', '2026-04-11 06:17:40'),
(8, 6, '2000002', 'standard_stp', 0, 40000.00, 200, 'USD', 'active', '2026-04-11 06:17:40'),
(9, 7, '2000003', 'pro_ecn', 0, 80000.00, 100, 'USD', 'active', '2026-04-11 06:17:40'),
(10, 8, '2000004', 'raw_ecn', 0, 15000.00, 500, 'USD', 'active', '2026-04-11 06:17:40'),
(11, 9, '2000005', 'pro_ecn', 0, 150000.00, 50, 'USD', 'active', '2026-04-11 06:17:40'),
(12, 10, '9638515', 'standard_stp', 0, 0.00, 500, 'USD', 'active', '2026-04-11 07:52:46'),
(13, 11, '3023449', 'standard_stp', 1, 0.00, 500, 'USD', 'active', '2026-04-11 07:59:28'),
(14, 11, '9906278', 'standard_stp', 0, 0.00, 500, 'USD', 'active', '2026-04-11 07:59:48');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `reference` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('deposit','withdrawal','internal_transfer') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(18,2) NOT NULL,
  `currency` char(3) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USD',
  `method` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `crypto_symbol` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `crypto_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','processing','completed','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `receipt_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tx_hash` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `from_account_id` bigint UNSIGNED DEFAULT NULL,
  `to_account_id` bigint UNSIGNED DEFAULT NULL,
  `notes` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `reference`, `type`, `amount`, `currency`, `method`, `crypto_symbol`, `crypto_address`, `status`, `receipt_url`, `tx_hash`, `from_account_id`, `to_account_id`, `notes`, `created_at`, `updated_at`) VALUES
(1, 4, 'WD-37333ACB6FCF', 'withdrawal', 500.00, 'USD', 'crypto_BNB', 'BNB', '379463927623723gyi23r', 'rejected', NULL, NULL, NULL, NULL, 'Crypto withdrawal: BNB to 379463927623723gyi23r', '2026-04-11 13:55:18', '2026-04-11 13:56:48'),
(2, 4, 'WD-D599DD1800FC', 'withdrawal', 800.00, 'USD', 'crypto_USDT', 'USDT', '8769776976779bvjgh', 'pending', NULL, NULL, NULL, NULL, 'Crypto withdrawal: USDT to 8769776976779bvjgh', '2026-04-11 13:55:53', '2026-04-11 13:55:53'),
(3, 4, 'WD-2292F3518CD8', 'withdrawal', 100.00, 'USD', 'crypto_USDT', 'USDT', '7896987o80o78', 'pending', NULL, NULL, NULL, NULL, 'Crypto withdrawal: USDT to 7896987o80o78', '2026-04-11 14:02:41', '2026-04-11 14:02:41');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(120) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(180) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `profile_image` varchar(512) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `wallet_balance` decimal(18,2) NOT NULL DEFAULT '0.00',
  `role` enum('trader','admin') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'trader',
  `status` enum('active','pending','suspended','deleted') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `phone`, `country`, `wallet_balance`, `role`, `status`, `email_verified_at`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'Admin User', 'admin@vantageCFD.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, NULL, 0.00, 'admin', 'active', '2026-04-05 09:30:09', NULL, '2026-04-05 09:30:09', '2026-04-05 09:30:09'),
(2, 'Demo Trader', 'trader@vantageCFD.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, NULL, -31367.00, 'trader', 'active', '2026-04-05 09:30:09', NULL, '2026-04-05 09:30:09', '2026-04-09 21:56:11'),
(4, 'Michael Nwankwo', 'michaelnwankwoscloud@gmail.cm', '$2y$10$L1jOGjepSzO.7Gyw8BZnYONwAPBx5K7ewgqxVwxTsI9D8kOgva5jK', NULL, 'Nigeria', 338.92, 'trader', 'pending', NULL, NULL, '2026-04-06 08:07:34', '2026-04-12 05:48:29'),
(5, 'James Okafor', 'james@vantageCFD.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, NULL, 5000.00, 'trader', 'active', '2026-04-11 06:17:40', NULL, '2026-04-11 06:17:40', '2026-04-11 06:17:40'),
(6, 'Sofia Reyes', 'sofia@vantageCFD.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, NULL, 8000.00, 'trader', 'active', '2026-04-11 06:17:40', NULL, '2026-04-11 06:17:40', '2026-04-11 06:17:40'),
(7, 'Marcus Chen', 'marcus@vantageCFD.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, NULL, 12000.00, 'trader', 'active', '2026-04-11 06:17:40', NULL, '2026-04-11 06:17:40', '2026-04-11 06:17:40'),
(8, 'Amara Diallo', 'amara@vantageCFD.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, NULL, 3500.00, 'trader', 'active', '2026-04-11 06:17:40', NULL, '2026-04-11 06:17:40', '2026-04-11 06:17:40'),
(9, 'Viktor Petrov', 'viktor@vantageCFD.com', '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, NULL, 20000.00, 'trader', 'active', '2026-04-11 06:17:40', NULL, '2026-04-11 06:17:40', '2026-04-11 06:17:40'),
(10, 'Test Test', 'test@gmail.com', '$2y$10$goSbbZR0jW/6IqxEpkdTgusQnQgg3SDzUYPsBGk32xM1KooJF0Uhi', NULL, 'Ethiopia', 0.00, 'trader', 'pending', NULL, NULL, '2026-04-11 07:51:59', '2026-04-11 07:51:59'),
(11, 'Cy Watson', 'cytradingcommunity@gmail.com', '$2y$10$GaPsU0j2.1W1mPHs0zQUEuCyMGTOKkjnJ.zn6HP6u/2wkUt9NghwC', NULL, 'United Kingdom', 0.00, 'trader', 'pending', NULL, NULL, '2026-04-11 07:57:02', '2026-04-11 07:57:02'),
(26, 'jsf dfdfd', 'hectorchri60@gmail.com', '$2y$10$NegeNEl4sXy8ry2A/sAtR.TRV3lhwtYSRy/30N7iyUtTk/uAtGo4q', '24525252', 'Ghana', 0.00, 'trader', 'pending', NULL, NULL, '2026-04-12 05:43:03', '2026-04-12 05:43:03'),
(30, 'Test2 Test', 'test2@gmail.com', '$2y$10$7/FcW0taBgmwL1HIV7iT/.Rb1V.7PKWH8TikEyOwRHXMHD79w5xRy', '+1225846375284', 'Ethiopia', 0.00, 'trader', 'pending', NULL, NULL, '2026-04-12 06:56:52', '2026-04-12 06:56:52'),
(31, 'Test3 Test', 'cryptovaultsupp0rt@gmail.com', '$2y$10$mJMLGSmz2V4Uy2RxpHCoduyjl5QIetBxDdFHf66xer5mMYGbVMCUC', '+12258463512', 'Ethiopia', 0.00, 'trader', 'pending', NULL, NULL, '2026-04-12 06:58:33', '2026-04-12 06:58:33'),
(33, 'sgsg sgsggfd', 'michaelnwankwoscloud@gmail.com', '$2y$10$rgha5jeMiLOpDMFnEnsjve/8N7bIpmJV1QLmXbg6pnUrVcPgE1fL.', '23245252242', 'South Africa', 0.00, 'trader', 'pending', NULL, NULL, '2026-04-12 13:48:18', '2026-04-12 13:48:18'),
(34, 'reeve eerer', 'hectorchris60@gmail.com', '$2y$10$/hRABMmdHU7/XQ83c5MzDuAiKu57HxyukYJMeoEh8V3sFz.SPWOw6', '80938771013', 'South Africa', 0.00, 'trader', 'pending', NULL, NULL, '2026-04-12 13:57:24', '2026-04-12 13:57:24');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `copy_relationships`
--
ALTER TABLE `copy_relationships`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_copy_copier` (`copier_id`),
  ADD KEY `fk_copy_provider` (`provider_id`),
  ADD KEY `fk_copy_acc` (`trading_account_id`);

--
-- Indexes for table `deposit_requests`
--
ALTER TABLE `deposit_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_dr_user` (`user_id`),
  ADD KEY `idx_dr_status` (`status`);

--
-- Indexes for table `email_verifications`
--
ALTER TABLE `email_verifications`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_ev_token` (`token`),
  ADD KEY `idx_ev_user` (`user_id`);

--
-- Indexes for table `kyc_documents`
--
ALTER TABLE `kyc_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_kyc_user` (`user_id`);

--
-- Indexes for table `leads`
--
ALTER TABLE `leads`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_leads_email` (`email`),
  ADD KEY `idx_leads_created` (`created_at`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order_user` (`user_id`),
  ADD KEY `fk_order_acc` (`trading_account_id`);

--
-- Indexes for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pr_user` (`user_id`),
  ADD KEY `idx_pr_expires` (`expires_at`);

--
-- Indexes for table `positions`
--
ALTER TABLE `positions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_pos_user` (`user_id`),
  ADD KEY `fk_pos_acc` (`trading_account_id`),
  ADD KEY `idx_pos_copy` (`copy_trade_id`);

--
-- Indexes for table `signals`
--
ALTER TABLE `signals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sig_user` (`user_id`);

--
-- Indexes for table `trading_accounts`
--
ALTER TABLE `trading_accounts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_acc_number` (`account_number`),
  ADD KEY `fk_acc_user` (`user_id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_txn_reference` (`reference`),
  ADD KEY `idx_txn_user` (`user_id`),
  ADD KEY `idx_txn_status` (`status`),
  ADD KEY `idx_txn_type` (`type`),
  ADD KEY `idx_txn_created` (`created_at`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_email` (`email`),
  ADD KEY `idx_users_status` (`status`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_created` (`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `copy_relationships`
--
ALTER TABLE `copy_relationships`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `deposit_requests`
--
ALTER TABLE `deposit_requests`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `email_verifications`
--
ALTER TABLE `email_verifications`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `kyc_documents`
--
ALTER TABLE `kyc_documents`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `leads`
--
ALTER TABLE `leads`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `password_resets`
--
ALTER TABLE `password_resets`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `positions`
--
ALTER TABLE `positions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=51;

--
-- AUTO_INCREMENT for table `signals`
--
ALTER TABLE `signals`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `trading_accounts`
--
ALTER TABLE `trading_accounts`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `copy_relationships`
--
ALTER TABLE `copy_relationships`
  ADD CONSTRAINT `fk_copy_acc` FOREIGN KEY (`trading_account_id`) REFERENCES `trading_accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_copy_copier` FOREIGN KEY (`copier_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_copy_provider` FOREIGN KEY (`provider_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `deposit_requests`
--
ALTER TABLE `deposit_requests`
  ADD CONSTRAINT `fk_dr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `email_verifications`
--
ALTER TABLE `email_verifications`
  ADD CONSTRAINT `fk_ev_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `kyc_documents`
--
ALTER TABLE `kyc_documents`
  ADD CONSTRAINT `fk_kyc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_order_acc` FOREIGN KEY (`trading_account_id`) REFERENCES `trading_accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_order_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `password_resets`
--
ALTER TABLE `password_resets`
  ADD CONSTRAINT `fk_pr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `positions`
--
ALTER TABLE `positions`
  ADD CONSTRAINT `fk_pos_acc` FOREIGN KEY (`trading_account_id`) REFERENCES `trading_accounts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pos_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `signals`
--
ALTER TABLE `signals`
  ADD CONSTRAINT `fk_sig_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `trading_accounts`
--
ALTER TABLE `trading_accounts`
  ADD CONSTRAINT `fk_acc_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `fk_txn_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

-- --------------------------------------------------------
-- Table structure for table `settings`
--
CREATE TABLE `settings` (
  `key` varchar(100) NOT NULL,
  `value` text,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `settings` (`key`, `value`) VALUES
('site_name', 'vāntãgeCFD'),
('support_email', 'support@vantageCFD.com'),
('min_deposit', '50'),
('max_deposit', '1000000'),
('default_currency', 'USD'),
('copy_trading_enabled', '1'),
('registration_open', '1'),
('site_logo', 'https://www.vantagemarkets.com/wp-content/themes/vantage/images/logo.svg'),
('wallet_btc', ''),
('wallet_eth', ''),
('wallet_usdt', '');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'info',
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_notifications_user` (`user_id`),
  CONSTRAINT `fk_notifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
