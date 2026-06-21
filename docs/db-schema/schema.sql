-- comments-spa — PostgreSQL DDL
-- Canonical source: backend/prisma/schema.prisma
-- Apply via Prisma: task db:migrate

CREATE TABLE "Comment" (
    "id" SERIAL NOT NULL,
    "userName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "homePage" TEXT,
    "text" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parentId" INTEGER,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Comment"
    ADD CONSTRAINT "Comment_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "Comment" ("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;
