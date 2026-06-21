-- comments-spa — MySQL 8.x DDL (logical equivalent for MySQL Workbench)
-- Runtime DB is PostgreSQL; types mapped for ER model / forward engineering.

CREATE TABLE `Comment` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `userName` TEXT NOT NULL,
    `email` TEXT NOT NULL,
    `homePage` TEXT NULL,
    `text` TEXT NOT NULL,
    `fileUrl` TEXT NULL,
    `fileName` TEXT NULL,
    `fileSize` INT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `parentId` INT NULL,

    PRIMARY KEY (`id`),
    CONSTRAINT `Comment_parentId_fkey`
        FOREIGN KEY (`parentId`) REFERENCES `Comment` (`id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
