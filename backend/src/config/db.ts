import prisma from "./prisma";

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log("Подключено к БД");
    return true;
  } catch (error) {
    console.log("❌ Ошибка подключения к БД", error);
    throw error;
  }
}
