import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Hover over 'category' in VS Code to see available methods
async function test() {
  // TypeScript knows all available methods and fields!
  const categories = await prisma.category.findMany()
  const todos = await prisma.todo.findMany({
    include: {
      category: true  // Include related category data
    }
  })
  
  console.log({ categories, todos })
}

test()