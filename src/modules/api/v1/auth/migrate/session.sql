CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `secret_hash` blob NOT NULL,
  `created_at` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;