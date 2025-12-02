import prisma from "./prisma";

export async function connectDB() {
  try {
    console.log("Попытка подключения к БД");
    await prisma.$connect();
    console.log("✅ Подключено к БД");
    return true;
  } catch (error) {
    console.log("❌ Ошибка подключения к БД", error);
    throw error;
  }
}
