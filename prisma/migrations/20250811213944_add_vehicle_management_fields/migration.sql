-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "licensePlate" TEXT,
ADD COLUMN     "maintenanceDate" TIMESTAMP(3),
ADD COLUMN     "maintenanceNotes" TEXT,
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "quantityUpdateDate" TIMESTAMP(3),
ADD COLUMN     "quantityUpdateReason" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'available',
ADD COLUMN     "vehicleId" TEXT;
