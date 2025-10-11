import { config } from "dotenv";
config({ path: "./config/config.env" });

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { Book } from "./models/bookModel.js";
import { User } from "./models/userModel.js";
import { Borrow } from "./models/borrowModel.js";
import { BookSuggestion } from "./models/bookSuggestionModel.js";
import { Archive } from "./models/archiveModel.js";

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try {
    await Book.deleteMany({});
    await User.deleteMany({ email: { $ne: 'admin@library.com' } }); // Keep admin
    await Borrow.deleteMany({});
    await BookSuggestion.deleteMany({});
    await Archive.deleteMany({});
    console.log("✅ Database cleared");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
  }
};

const seedBooks = async () => {
  const books = [
    // Fiction
    {
      title: "To Kill a Mockingbird",
      author: "Harper Lee",
      isbn: "978-0-06-112008-4",
      publisher: "Harper Perennial Modern Classics",
      genre: "Fiction",
      publicationYear: 1960,
      description: "A gripping, heart-wrenching, and wholly remarkable tale of coming-of-age in a South poisoned by virulent prejudice.",
      price: 12.99,
      quantity: 5
    },
    {
      title: "1984",
      author: "George Orwell",
      isbn: "978-0-452-28423-4",
      publisher: "Signet Classic",
      genre: "Science Fiction",
      publicationYear: 1949,
      description: "A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism.",
      price: 14.99,
      quantity: 8
    },
    {
      title: "Pride and Prejudice",
      author: "Jane Austen",
      isbn: "978-0-14-143951-8",
      publisher: "Penguin Classics",
      genre: "Romance",
      publicationYear: 1813,
      description: "A romantic novel of manners that follows the character development of Elizabeth Bennet.",
      price: 11.99,
      quantity: 6
    },
    {
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      isbn: "978-0-7432-7356-5",
      publisher: "Scribner",
      genre: "Fiction",
      publicationYear: 1925,
      description: "The story of the mysteriously wealthy Jay Gatsby and his love for the beautiful Daisy Buchanan.",
      price: 13.99,
      quantity: 7
    },
    {
      title: "The Catcher in the Rye",
      author: "J.D. Salinger",
      isbn: "978-0-316-76948-0",
      publisher: "Little, Brown and Company",
      genre: "Fiction",
      publicationYear: 1951,
      description: "The story of Holden Caulfield's experiences in New York City after being expelled from prep school.",
      price: 12.99,
      quantity: 4
    },
    
    // Science Fiction & Fantasy
    {
      title: "Dune",
      author: "Frank Herbert",
      isbn: "978-0-441-17271-9",
      publisher: "Ace",
      genre: "Science Fiction",
      publicationYear: 1965,
      description: "Set in the distant future amidst a huge interstellar empire, Dune tells the story of young Paul Atreides.",
      price: 16.99,
      quantity: 5
    },
    {
      title: "The Hobbit",
      author: "J.R.R. Tolkien",
      isbn: "978-0-547-92822-7",
      publisher: "Mariner Books",
      genre: "Fantasy",
      publicationYear: 1937,
      description: "A fantasy novel about the quest of home-loving Bilbo Baggins to win a share of the treasure guarded by a dragon.",
      price: 14.99,
      quantity: 10
    },
    {
      title: "Foundation",
      author: "Isaac Asimov",
      isbn: "978-0-553-29335-0",
      publisher: "Bantam",
      genre: "Science Fiction",
      publicationYear: 1951,
      description: "The first novel in the Foundation series, about the collapse of a galactic empire.",
      price: 13.99,
      quantity: 6
    },
    {
      title: "Neuromancer",
      author: "William Gibson",
      isbn: "978-0-441-56959-0",
      publisher: "Ace",
      genre: "Science Fiction",
      publicationYear: 1984,
      description: "A groundbreaking cyberpunk novel about a washed-up computer hacker hired for one last job.",
      price: 15.99,
      quantity: 4
    },
    
    // Mystery & Thriller
    {
      title: "The Da Vinci Code",
      author: "Dan Brown",
      isbn: "978-0-307-47921-4",
      publisher: "Anchor",
      genre: "Mystery",
      publicationYear: 2003,
      description: "A mystery thriller novel following symbologist Robert Langdon as he investigates a murder in the Louvre.",
      price: 14.99,
      quantity: 8
    },
    {
      title: "Gone Girl",
      author: "Gillian Flynn",
      isbn: "978-0-307-58836-4",
      publisher: "Crown Publishing Group",
      genre: "Thriller",
      publicationYear: 2012,
      description: "A psychological thriller about a woman who goes missing on her fifth wedding anniversary.",
      price: 15.99,
      quantity: 7
    },
    {
      title: "The Girl with the Dragon Tattoo",
      author: "Stieg Larsson",
      isbn: "978-0-307-45454-1",
      publisher: "Vintage Crime/Black Lizard",
      genre: "Mystery",
      publicationYear: 2005,
      description: "A mystery thriller about journalist Mikael Blomkvist and hacker Lisbeth Salander.",
      price: 14.99,
      quantity: 6
    },
    
    // Non-Fiction & Biography
    {
      title: "Sapiens: A Brief History of Humankind",
      author: "Yuval Noah Harari",
      isbn: "978-0-06-231609-7",
      publisher: "Harper",
      genre: "Non-Fiction",
      publicationYear: 2011,
      description: "An exploration of how Homo sapiens came to dominate the world.",
      price: 17.99,
      quantity: 9
    },
    {
      title: "Educated",
      author: "Tara Westover",
      isbn: "978-0-399-59050-4",
      publisher: "Random House",
      genre: "Biography",
      publicationYear: 2018,
      description: "A memoir about a young woman who grows up in a strict and abusive household in rural Idaho.",
      price: 16.99,
      quantity: 8
    },
    {
      title: "The Immortal Life of Henrietta Lacks",
      author: "Rebecca Skloot",
      isbn: "978-1-4000-5217-2",
      publisher: "Broadway Books",
      genre: "Biography",
      publicationYear: 2010,
      description: "The story of Henrietta Lacks and the immortal cell line, known as HeLa, that came from her.",
      price: 15.99,
      quantity: 5
    },
    
    // Science & Technology
    {
      title: "A Brief History of Time",
      author: "Stephen Hawking",
      isbn: "978-0-553-38016-3",
      publisher: "Bantam",
      genre: "Science",
      publicationYear: 1988,
      description: "A landmark volume in science writing, exploring the nature of the universe.",
      price: 14.99,
      quantity: 7
    },
    {
      title: "The Selfish Gene",
      author: "Richard Dawkins",
      isbn: "978-0-19-929114-4",
      publisher: "Oxford University Press",
      genre: "Science",
      publicationYear: 1976,
      description: "A gene-centered view of evolution and its implications.",
      price: 16.99,
      quantity: 6
    },
    {
      title: "Clean Code",
      author: "Robert C. Martin",
      isbn: "978-0-13-235088-4",
      publisher: "Prentice Hall",
      genre: "Technology",
      publicationYear: 2008,
      description: "A handbook of agile software craftsmanship that presents best practices for writing clean code.",
      price: 39.99,
      quantity: 12
    },
    {
      title: "Design Patterns",
      author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides",
      isbn: "978-0-201-63361-0",
      publisher: "Addison-Wesley",
      genre: "Technology",
      publicationYear: 1994,
      description: "Elements of reusable object-oriented software design patterns.",
      price: 44.99,
      quantity: 10
    },
    
    // Business & Self-Help
    {
      title: "Atomic Habits",
      author: "James Clear",
      isbn: "978-0-7352-1129-2",
      publisher: "Avery",
      genre: "Self-Help",
      publicationYear: 2018,
      description: "An easy and proven way to build good habits and break bad ones.",
      price: 16.99,
      quantity: 15
    },
    {
      title: "The 7 Habits of Highly Effective People",
      author: "Stephen R. Covey",
      isbn: "978-1-982-13709-9",
      publisher: "Simon & Schuster",
      genre: "Self-Help",
      publicationYear: 1989,
      description: "Powerful lessons in personal change for people seeking to improve themselves.",
      price: 15.99,
      quantity: 12
    },
    {
      title: "Think and Grow Rich",
      author: "Napoleon Hill",
      isbn: "978-1-585-42433-7",
      publisher: "TarcherPerigee",
      genre: "Business",
      publicationYear: 1937,
      description: "The classic guide to harnessing the power of the mind for wealth creation.",
      price: 12.99,
      quantity: 8
    },
    {
      title: "Start with Why",
      author: "Simon Sinek",
      isbn: "978-1-591-84653-4",
      publisher: "Portfolio",
      genre: "Business",
      publicationYear: 2009,
      description: "How great leaders inspire everyone to take action.",
      price: 17.99,
      quantity: 10
    },
    
    // History & Philosophy
    {
      title: "Guns, Germs, and Steel",
      author: "Jared Diamond",
      isbn: "978-0-393-31755-8",
      publisher: "W. W. Norton & Company",
      genre: "History",
      publicationYear: 1997,
      description: "The fates of human societies explained through environmental and geographical factors.",
      price: 18.99,
      quantity: 6
    },
    {
      title: "Meditations",
      author: "Marcus Aurelius",
      isbn: "978-0-14-044933-1",
      publisher: "Penguin Classics",
      genre: "Philosophy",
      publicationYear: 2002, // Modern edition year
      description: "Personal writings by the Roman Emperor, a series of reflections on Stoic philosophy. Originally written around 170-180 AD.",
      price: 11.99,
      quantity: 9
    },
    {
      title: "The Republic",
      author: "Plato",
      isbn: "978-0-14-045511-3",
      publisher: "Penguin Classics",
      genre: "Philosophy",
      publicationYear: 2007, // Modern edition year
      description: "Plato's dialogue concerning justice, the order of the ideal state, and the character of the just man. Originally written around 380 BC.",
      price: 13.99,
      quantity: 7
    },
    
    // Poetry & Drama
    {
      title: "The Complete Works of William Shakespeare",
      author: "William Shakespeare",
      isbn: "978-0-517-05361-2",
      publisher: "Barnes & Noble",
      genre: "Drama",
      publicationYear: 2007, // Modern complete edition
      description: "The complete collection of Shakespeare's plays and poems.",
      price: 24.99,
      quantity: 8
    },
    {
      title: "Leaves of Grass",
      author: "Walt Whitman",
      isbn: "978-0-14-042233-4",
      publisher: "Penguin Classics",
      genre: "Poetry",
      publicationYear: 2005, // Modern edition
      description: "A poetry collection celebrating the human body and nature. First published in 1855.",
      price: 12.99,
      quantity: 5
    },
    
    // Children & Young Adult
    {
      title: "Harry Potter and the Philosopher's Stone",
      author: "J.K. Rowling",
      isbn: "978-0-439-70818-8",
      publisher: "Scholastic",
      genre: "Young Adult",
      publicationYear: 1997,
      description: "The first book in the Harry Potter series about a young wizard's adventures.",
      price: 14.99,
      quantity: 20
    },
    {
      title: "The Hunger Games",
      author: "Suzanne Collins",
      isbn: "978-0-439-02348-1",
      publisher: "Scholastic Press",
      genre: "Young Adult",
      publicationYear: 2008,
      description: "A dystopian novel about a televised fight to the death in a post-apocalyptic future.",
      price: 13.99,
      quantity: 15
    },
    {
      title: "Charlotte's Web",
      author: "E.B. White",
      isbn: "978-0-06-440055-8",
      publisher: "Harper & Brothers",
      genre: "Children",
      publicationYear: 1952,
      description: "The story of a pig named Wilbur and his friendship with a barn spider named Charlotte.",
      price: 10.99,
      quantity: 12
    }
  ];

  try {
    const createdBooks = await Book.insertMany(books);
    console.log(`✅ ${createdBooks.length} books added to database`);
    return createdBooks;
  } catch (error) {
    console.error("❌ Error seeding books:", error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`   - ${key}: ${error.errors[key].message}`);
      });
    }
    throw error; // Re-throw to prevent continuing with undefined
  }
};

const seedUsers = async () => {
  const hashedPassword = await bcrypt.hash("password123", 10);
  
  const users = [
    {
      name: "John Doe",
      email: "john.doe@library.com",
      password: hashedPassword,
      role: "User",
      accountVerified: true,
      fineBalance: 0,
      totalFinesPaid: 0
    },
    {
      name: "Jane Smith",
      email: "jane.smith@library.com",
      password: hashedPassword,
      role: "User",
      accountVerified: true,
      fineBalance: 0,
      totalFinesPaid: 0
    },
    {
      name: "Mike Johnson",
      email: "mike.johnson@library.com",
      password: hashedPassword,
      role: "User",
      accountVerified: true,
      fineBalance: 5.50,
      totalFinesPaid: 12.00
    },
    {
      name: "Sarah Williams",
      email: "sarah.williams@library.com",
      password: hashedPassword,
      role: "User",
      accountVerified: true,
      fineBalance: 0,
      totalFinesPaid: 8.50
    },
    {
      name: "David Brown",
      email: "david.brown@library.com",
      password: hashedPassword,
      role: "User",
      accountVerified: true,
      fineBalance: 0,
      totalFinesPaid: 0
    },
    {
      name: "Emily Davis",
      email: "emily.davis@library.com",
      password: hashedPassword,
      role: "User",
      accountVerified: true,
      fineBalance: 3.20,
      totalFinesPaid: 5.00
    }
  ];

  try {
    const createdUsers = await User.insertMany(users);
    console.log(`✅ ${createdUsers.length} users added to database`);
    return createdUsers;
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error; // Re-throw to prevent continuing with undefined
  }
};

const seedBorrows = async (books, users) => {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const twentyOneDaysAgo = new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000);
  
  const borrows = [
    // Active borrows
    {
      user: {
        id: users[0]._id,
        name: users[0].name,
        email: users[0].email
      },
      book: books[0]._id,
      borrowDate: sevenDaysAgo,
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      fine: 0,
      renewalCount: 0
    },
    {
      user: {
        id: users[1]._id,
        name: users[1].name,
        email: users[1].email
      },
      book: books[2]._id,
      borrowDate: fourteenDaysAgo,
      dueDate: new Date(now.getTime() + 0 * 24 * 60 * 60 * 1000), // Due today
      fine: 0,
      renewalCount: 0
    },
    // Overdue borrow
    {
      user: {
        id: users[2]._id,
        name: users[2].name,
        email: users[2].email
      },
      book: books[5]._id,
      borrowDate: twentyOneDaysAgo,
      dueDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Overdue by 7 days
      fine: 0,
      renewalCount: 0
    },
    // Returned with fine
    {
      user: {
        id: users[2]._id,
        name: users[2].name,
        email: users[2].email
      },
      book: books[8]._id,
      borrowDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000),
      returnDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      fine: 5.50,
      finePaid: false,
      renewalCount: 0
    },
    // Returned - no fine
    {
      user: {
        id: users[3]._id,
        name: users[3].name,
        email: users[3].email
      },
      book: books[10]._id,
      borrowDate: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      returnDate: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      fine: 0,
      finePaid: true,
      renewalCount: 0
    },
    // Active borrow - renewed
    {
      user: {
        id: users[4]._id,
        name: users[4].name,
        email: users[4].email
      },
      book: books[15]._id,
      borrowDate: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      dueDate: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000),
      renewedAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
      fine: 0,
      renewalCount: 1
    }
  ];

  try {
    const createdBorrows = await Borrow.insertMany(borrows);
    console.log(`✅ ${createdBorrows.length} borrow records added`);
    
    // Update book quantities
    for (const borrow of createdBorrows) {
      if (!borrow.returnDate) {
        await Book.findByIdAndUpdate(borrow.book, {
          $inc: { quantity: -1 }
        });
      }
    }
    console.log("✅ Book quantities updated");
  } catch (error) {
    console.error("❌ Error seeding borrows:", error);
  }
};

const seedSuggestions = async (users) => {
  const suggestions = [
    {
      title: "Project Hail Mary",
      author: "Andy Weir",
      description: "A lone astronaut must save the earth from disaster in this incredible new science-based thriller.",
      suggestedBy: {
        id: users[0]._id,
        name: users[0].name,
        email: users[0].email
      },
      votes: [users[0]._id, users[1]._id, users[3]._id],
      status: "pending"
    },
    {
      title: "The Midnight Library",
      author: "Matt Haig",
      description: "A dazzling novel about all the choices that go into a life well lived.",
      suggestedBy: {
        id: users[1]._id,
        name: users[1].name,
        email: users[1].email
      },
      votes: [users[1]._id, users[2]._id],
      status: "pending"
    },
    {
      title: "Klara and the Sun",
      author: "Kazuo Ishiguro",
      description: "A thrilling book that offers a look at our changing world through the eyes of an unforgettable narrator.",
      suggestedBy: {
        id: users[3]._id,
        name: users[3].name,
        email: users[3].email
      },
      votes: [users[3]._id, users[4]._id, users[5]._id, users[0]._id],
      status: "approved",
      adminNotes: "Approved - will be ordered next month"
    }
  ];

  try {
    const createdSuggestions = await BookSuggestion.insertMany(suggestions);
    console.log(`✅ ${createdSuggestions.length} book suggestions added`);
  } catch (error) {
    console.error("❌ Error seeding suggestions:", error);
  }
};

const seedArchives = async (users) => {
  const archives = [
    {
      title: "Computer Science Past Papers 2023",
      description: "Collection of past examination papers for Computer Science courses from 2023",
      category: "Past Papers",
      fileUrl: "https://example.com/cs-papers-2023.pdf",
      publicId: "archive_cs_2023",
      uploadedBy: {
        id: users[0]._id,
        name: users[0].name
      },
      downloads: 45,
      views: 120
    },
    {
      title: "Mathematics Research Thesis 2022",
      description: "PhD thesis on Applied Mathematics and Statistical Analysis",
      category: "Thesis",
      fileUrl: "https://example.com/math-thesis-2022.pdf",
      publicId: "archive_math_thesis",
      uploadedBy: {
        id: users[1]._id,
        name: users[1].name
      },
      downloads: 23,
      views: 67
    },
    {
      title: "Engineering Design Projects Collection",
      description: "Best engineering final year projects from 2021-2023",
      category: "Research",
      fileUrl: "https://example.com/engineering-projects.pdf",
      publicId: "archive_eng_projects",
      uploadedBy: {
        id: users[2]._id,
        name: users[2].name
      },
      downloads: 89,
      views: 234
    }
  ];

  try {
    const createdArchives = await Archive.insertMany(archives);
    console.log(`✅ ${createdArchives.length} archives added`);
  } catch (error) {
    console.error("❌ Error seeding archives:", error);
  }
};

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...\n");
    
    await connectDatabase();
    await clearDatabase();
    
    console.log("\n📚 Seeding books...");
    const books = await seedBooks();
    
    if (!books || books.length === 0) {
      throw new Error("Failed to create books");
    }
    
    console.log("\n👥 Seeding users...");
    const users = await seedUsers();
    
    if (!users || users.length === 0) {
      throw new Error("Failed to create users");
    }
    
    console.log("\n📖 Seeding borrow records...");
    await seedBorrows(books, users);
    
    console.log("\n💡 Seeding book suggestions...");
    await seedSuggestions(users);
    
    console.log("\n📁 Seeding archives...");
    await seedArchives(users);
    
    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - ${books.length} books`);
    console.log(`   - ${users.length} users`);
    console.log(`   - 6 borrow records`);
    console.log(`   - 3 book suggestions`);
    console.log(`   - 3 archives`);
    console.log("\n🔐 Test User Credentials:");
    console.log("   Email: john.doe@library.com");
    console.log("   Password: password123");
    console.log("\n   All test users have the same password: password123\n");
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Fatal error during seeding:", error);
    mongoose.connection.close();
    process.exit(1);
  }
};

seedDatabase();

