-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "phone" TEXT,
    "nationality" TEXT,
    "idOrPassport" TEXT,
    "carType" TEXT,
    "pickupDate" TEXT,
    "pickupTime" TEXT,
    "returnDate" TEXT,
    "returnTime" TEXT,
    "rentalDays" INTEGER,
    "returnConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "fullTank" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);
