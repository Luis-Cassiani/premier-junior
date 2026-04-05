-- --------------------------------------------------------
-- Base de Datos: Premier Junior Max La Manga
-- --------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `premier_junior`;
USE `premier_junior`;

-- 1. Tabla de Equipos
CREATE TABLE IF NOT EXISTS `teams` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `logo` varchar(255) DEFAULT 'logo.jpg', -- Aquí guardas el nombre de la imagen de cada escudo
  `played` int(11) DEFAULT 0,
  `won` int(11) DEFAULT 0,
  `drawn` int(11) DEFAULT 0,
  `lost` int(11) DEFAULT 0,
  `gf` int(11) DEFAULT 0,
  `gc` int(11) DEFAULT 0,
  `points` int(11) DEFAULT 0,
  `active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insertar los 10 espacios para los equipos (Ahora también tienen estadísticas modificables)
INSERT INTO `teams` (`id`, `name`, `logo`, `played`, `won`, `drawn`, `lost`, `gf`, `gc`, `points`, `active`) VALUES
(1, 'Equipo 1', 'logo.jpg', 0, 0, 0, 0, 0, 0, 0, 1),
(2, 'Equipo 2', 'logo.jpg', 0, 0, 0, 0, 0, 0, 0, 1),
(3, 'Equipo 3', 'logo.jpg', 0, 0, 0, 0, 0, 0, 0, 1),
(4, 'Equipo 4', 'logo.jpg', 0, 0, 0, 0, 0, 0, 0, 1),
(5, 'Equipo 5', 'logo.jpg', 0, 0, 0, 0, 0, 0, 0, 1),
(6, 'Equipo 6', 'logo.jpg', 0, 0, 0, 0, 0, 0, 0, 1),
(7, 'Equipo 7', 'logo.jpg', 0, 0, 0, 0, 0, 0, 0, 1),
(8, 'Equipo 8', 'logo.jpg', 0, 0, 0, 0, 0, 0, 0, 1),
(9, 'Equipo 9', 'logo.jpg', 0, 0, 0, 0, 0, 0, 0, 1),
(10, 'Equipo 10', 'logo.jpg', 0, 0, 0, 0, 0, 0, 0, 1);

-- 2. Tabla de Partidos
CREATE TABLE IF NOT EXISTS `matches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `home_team_id` int(11) NOT NULL,
  `away_team_id` int(11) NOT NULL,
  `home_score` int(11) DEFAULT NULL,
  `away_score` int(11) DEFAULT NULL,
  `status` enum('scheduled','finished') DEFAULT 'scheduled',
  `date` varchar(50) DEFAULT 'Fecha 1',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`home_team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`away_team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Partidos (Las filas se añadirán manualmente por ti para coordinar las fechas)
-- Tu tabla 'matches' empieza vacía, sin partidos jugados ni programados todavía.
