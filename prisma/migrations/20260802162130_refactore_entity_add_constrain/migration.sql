/*
  Warnings:

  - You are about to drop the column `channelId` on the `SavedEpisode` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,episodeId]` on the table `Comment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,episodeId]` on the table `SavedEpisode` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,episodeId]` on the table `like` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `episodeId` to the `SavedEpisode` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SavedEpisode" DROP CONSTRAINT "SavedEpisode_channelId_fkey";

-- AlterTable
ALTER TABLE "SavedEpisode" DROP COLUMN "channelId",
ADD COLUMN     "episodeId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Comment_userId_episodeId_key" ON "Comment"("userId", "episodeId");

-- CreateIndex
CREATE UNIQUE INDEX "SavedEpisode_userId_episodeId_key" ON "SavedEpisode"("userId", "episodeId");

-- CreateIndex
CREATE UNIQUE INDEX "like_userId_episodeId_key" ON "like"("userId", "episodeId");

-- AddForeignKey
ALTER TABLE "SavedEpisode" ADD CONSTRAINT "SavedEpisode_episodeId_fkey" FOREIGN KEY ("episodeId") REFERENCES "Episode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
