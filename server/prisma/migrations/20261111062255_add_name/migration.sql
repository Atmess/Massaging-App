-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "mediaName" TEXT,
ADD COLUMN     "mediaSize" INTEGER,
ADD COLUMN     "mediaType" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "name" TEXT DEFAULT '';
