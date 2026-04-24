"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function startContractClock(contractId: string, termMonths: number) {
  try {
    const startDate = new Date();
    const maturityDate = new Date();
    maturityDate.setMonth(startDate.getMonth() + termMonths);

    const contract = await prisma.financeContract.update({
      where: { id: contractId },
      data: {
        startDate,
        maturityDate,
        status: "ACTIVE",
      },
    });

    revalidatePath("/staff/operations-dashboard");
    return { success: true, contract };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function recordDailyPayment(contractId: string, amountPaid: number, recordedByUsername?: string) {
  try {
    const contract = await prisma.financeContract.findUnique({
      where: { id: contractId },
    });

    if (!contract) throw new Error("Contract not found");

    // Create the payment record
    await prisma.financePayment.create({
      data: {
        contractId,
        amount: amountPaid,
        notes: "Daily payment",
      },
    });

    // Update the contract balance
    const updatedContract = await prisma.financeContract.update({
      where: { id: contractId },
      data: {
        amountPaid: { increment: amountPaid },
      },
    });

    // Check if the "Clock" should stop (Total Paid)
    if (updatedContract.amountPaid >= updatedContract.totalPrice) {
      await prisma.financeContract.update({
        where: { id: contractId },
        data: { 
          status: "COMPLETED", 
          endDate: new Date() 
        },
      });
    }

    // Log the payment in the Ledger/Income table for the Accountant
    await prisma.income.create({
      data: {
        amount: amountPaid,
        category: "car_rental_finance", // Map to existing enum if necessary
        description: `Daily payment for Contract ${contractId}`,
        date: new Date(),
        paymentMethod: "Cash", // Adjust as necessary
        clientName: contract.clientName,
        clientPhone: contract.clientPhone,
      },
    });

    revalidatePath("/staff/operations-dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
