/*
  Warnings:

  - Added the required column `fuelEfficiency` to the `Vehicle` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vehicle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "engine" TEXT NOT NULL,
    "mileage" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "fuel" TEXT NOT NULL,
    "capacity" TEXT NOT NULL,
    "doors" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "power" TEXT NOT NULL,
    "fuelEfficiency" TEXT NOT NULL
);
INSERT INTO "new_Vehicle" ("capacity", "category", "description", "doors", "engine", "fuel", "id", "image", "isAvailable", "mileage", "name", "power", "price", "transmission", "type", "year") SELECT "capacity", "category", "description", "doors", "engine", "fuel", "id", "image", "isAvailable", "mileage", "name", "power", "price", "transmission", "type", "year" FROM "Vehicle";
DROP TABLE "Vehicle";
ALTER TABLE "new_Vehicle" RENAME TO "Vehicle";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
