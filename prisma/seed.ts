import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.todo.deleteMany()
  await prisma.category.deleteMany()

  // Create categories
  const school = await prisma.category.create({
    data: { name: 'School' }
  })

  const personal = await prisma.category.create({
    data: { name: 'Personal' }
  })

  // Create todos
  await prisma.todo.createMany({
    data: [
      {
        name: 'Mow the Lawn',
        status: 'pending',
        categoryId: school.id,
        dueDate: new Date('2025-10-10')
      },
      {
        name: 'Finish my homework',
        status: 'in-progress',
        categoryId: school.id,
        dueDate: new Date('2025-10-08')
      },
      {
        name: 'Watch class video',
        status: 'completed',
        categoryId: school.id,
        dueDate: new Date('2025-10-03')
      }
    ]
  })

  console.log('✅ Database seeded successfully')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })