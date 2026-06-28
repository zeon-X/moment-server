ALTER TABLE "User"
ADD COLUMN "postCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "commentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "likeCount" INTEGER NOT NULL DEFAULT 0;

UPDATE "User" u
SET "postCount" = (
  SELECT COUNT(*)
  FROM "Post" p
  WHERE p."authorId" = u."id"
);

UPDATE "User" u
SET "commentCount" = (
  SELECT COUNT(*)
  FROM "Comment" c
  JOIN "Post" p ON p."id" = c."postId"
  WHERE p."authorId" = u."id"
);

UPDATE "User" u
SET "likeCount" = (
  SELECT COUNT(*)
  FROM "Like" l
  JOIN "Post" p ON p."id" = l."postId"
  WHERE p."authorId" = u."id"
);
