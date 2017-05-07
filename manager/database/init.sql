-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema anime_loop
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `anime_loop` ;

-- -----------------------------------------------------
-- Schema anime_loop
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `anime_loop` DEFAULT CHARACTER SET utf8 ;
USE `anime_loop` ;

-- -----------------------------------------------------
-- Table `anime_loop`.`Series`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `anime_loop`.`Series` ;

CREATE TABLE IF NOT EXISTS `anime_loop`.`Series` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `anime_loop`.`Episode`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `anime_loop`.`Episode` ;

CREATE TABLE IF NOT EXISTS `anime_loop`.`Episode` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(128) NULL,
  `series_id` INT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_series_idx` (`series_id` ASC),
  CONSTRAINT `fk_series`
    FOREIGN KEY (`series_id`)
    REFERENCES `anime_loop`.`Series` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `anime_loop`.`Media`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `anime_loop`.`Media` ;

CREATE TABLE IF NOT EXISTS `anime_loop`.`Media` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `hash` CHAR(65) NULL,
  `name` VARCHAR(128) NULL,
  `type` VARCHAR(16) NULL,
  `size` MEDIUMTEXT NULL,
  `width` INT NULL,
  `height` INT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `anime_loop`.`Loop`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `anime_loop`.`Loop` ;

CREATE TABLE IF NOT EXISTS `anime_loop`.`Loop` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `cover_id` INT NULL,
  `video_id` INT NULL,
  `duration` DOUBLE NULL,
  `frame_start` INT NULL,
  `frame_end` INT NULL,
  `time_start` TIME NULL,
  `time_end` TIME NULL,
  `episode_id` INT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  UNIQUE INDEX `cover_filename_UNIQUE` (`cover_id` ASC),
  UNIQUE INDEX `video_filename_UNIQUE` (`video_id` ASC),
  INDEX `fk_episode_idx` (`episode_id` ASC),
  CONSTRAINT `fk_episode`
    FOREIGN KEY (`episode_id`)
    REFERENCES `anime_loop`.`Episode` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_cover`
    FOREIGN KEY (`cover_id`)
    REFERENCES `anime_loop`.`Media` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_video`
    FOREIGN KEY (`video_id`)
    REFERENCES `anime_loop`.`Media` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `anime_loop`.`Image`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `anime_loop`.`Image` ;

CREATE TABLE IF NOT EXISTS `anime_loop`.`Image` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `hash` VARCHAR(64) NULL,
  `name` VARCHAR(45) NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
