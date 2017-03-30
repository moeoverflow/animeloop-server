-- -----------------------------------------------------
-- Schema AnimeLoop
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `AnimeLoop` DEFAULT CHARACTER SET utf8 ;
USE `AnimeLoop` ;

-- -----------------------------------------------------
-- Table `AnimeLoop`.`Seires`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `AnimeLoop`.`Seires` ;

CREATE TABLE IF NOT EXISTS `AnimeLoop`.`Seires` (
  `id` INT NOT NULL,
  `name` VARCHAR(128) NULL,
  PRIMARY KEY (`id`));


-- -----------------------------------------------------
-- Table `AnimeLoop`.`Episode`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `AnimeLoop`.`Episode` ;

CREATE TABLE IF NOT EXISTS `AnimeLoop`.`Episode` (
  `id` INT NOT NULL,
  `name` VARCHAR(128) NULL,
  `series_id` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_series_idx` (`series_id` ASC),
  CONSTRAINT `fk_series`
    FOREIGN KEY (`series_id`)
    REFERENCES `AnimeLoop`.`Seires` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


-- -----------------------------------------------------
-- Table `AnimeLoop`.`Loop`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `AnimeLoop`.`Loop` ;

CREATE TABLE IF NOT EXISTS `AnimeLoop`.`Loop` (
  `id` INT NOT NULL,
  `cover_filename` VARCHAR(128) NULL,
  `video_filename` VARCHAR(128) NULL,
  `duration` DOUBLE NULL,
  `frame_start` INT NULL,
  `frame_end` INT NULL,
  `time_start` INT NULL,
  `time_end` INT NULL,
  `episode_id` INT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  UNIQUE INDEX `cover_filename_UNIQUE` (`cover_filename` ASC),
  UNIQUE INDEX `video_filename_UNIQUE` (`video_filename` ASC),
  INDEX `fk_episode_idx` (`episode_id` ASC),
  CONSTRAINT `fk_episode`
    FOREIGN KEY (`episode_id`)
    REFERENCES `AnimeLoop`.`Episode` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
