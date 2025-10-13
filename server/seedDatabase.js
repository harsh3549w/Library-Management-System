import { config } from "dotenv";
config({ path: "./config/config.env" });

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { Book } from "./models/bookModel.js";
import { User } from "./models/userModel.js";
import { Borrow } from "./models/borrowModel.js";
import { BookSuggestion } from "./models/bookSuggestionModel.js";
import { Archive } from "./models/archiveModel.js";

// Mode flags
const APPEND_ONLY = process.argv.includes('--append');
const FORCE_UNIQUE = process.argv.includes('--unique'); // adds a unique suffix to generated ISBNs
const REPLACE_WITH_PROVIDED = process.argv.includes('--replace-books'); // remove all books and insert provided list
const ADD_CURATED = process.argv.includes('--add-curated'); // add curated general list without removing

const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "MERN_STACK_LIBRARY_MANAGEMENT",
    });
    console.log("✅ Database connected successfully (DB: MERN_STACK_LIBRARY_MANAGEMENT)");
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

const seedBooks = async ({ mode = 'full', unique = false } = {}) => {
  const baseBooks = [
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

  // Generate 30 Computer Science/Technology books
  const csBooks = [];
  for (let i = 1; i <= 30; i++) {
    const suffix = unique ? `-${Date.now()}-${i}` : ''
    csBooks.push({
      title: `Computer Science Essentials Vol ${i}`,
      author: `CS Author ${i}`,
      isbn: `978-CS-${100000 + i}${suffix}`,
      publisher: "Tech Press",
      genre: "Technology",
      publicationYear: 2000 + (i % 24),
      description: "A comprehensive guide covering core concepts in computer science.",
      price: 24.99 + (i % 12),
      quantity: 5 + (i % 7)
    })
  }

  // Generate 20 books with different genres
  const otherGenres = [
    "Fiction",
    "Non-Fiction",
    "Science",
    "History",
    "Biography",
    "Philosophy",
    "Poetry",
    "Drama",
    "Fantasy",
    "Mystery",
  ]
  const otherBooks = [];
  for (let i = 1; i <= 20; i++) {
    const g = otherGenres[i % otherGenres.length]
    const suffix = unique ? `-${Date.now()}-${i}` : ''
    otherBooks.push({
      title: `${g} Collection Book ${i}`,
      author: `${g} Author ${i}`,
      isbn: `978-OG-${100000 + i}${suffix}`,
      publisher: "General Press",
      genre: g,
      publicationYear: 1980 + (i % 45),
      description: `An engaging ${g.toLowerCase()} title for readers of all levels.`,
      price: 9.99 + (i % 15),
      quantity: 3 + (i % 12)
    })
  }

  const books = mode === 'append' ? [...csBooks, ...otherBooks] : [...baseBooks, ...csBooks, ...otherBooks];

  try {
    if (mode === 'append') {
      // Upsert by ISBN to avoid duplicates when re-running
      const ops = books.map(b => ({
        updateOne: {
          filter: { isbn: b.isbn },
          update: { $setOnInsert: b },
          upsert: true
        }
      }))
      const result = await Book.bulkWrite(ops, { ordered: false });
      const insertedCount = (result.upsertedCount) || 0;
      const totalBooks = await Book.countDocuments();
      console.log(`✅ ${insertedCount} books added (upserted)`);
      console.log(`📚 Total books in database now: ${totalBooks}`);
      // Return payloads (IDs not needed in append branch)
      return books;
    } else {
      // Full seed after clearing: simple insertMany returns docs with _id
      const createdBooks = await Book.insertMany(books, { ordered: false });
      console.log(`✅ ${createdBooks.length} books inserted`);
      const totalBooks = await Book.countDocuments();
      console.log(`📚 Total books in database now: ${totalBooks}`);
      return createdBooks;
    }
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

// Seed with user-provided curated list (replaces existing books)
const seedProvidedBooks = async () => {
  const books = [
    { title: "Introduction to Algorithms", author: "Thomas H. Cormen et al.", isbn: "9780262046305", publicationYear: 2022, quantity: 10, price: 95, genre: "Computer Science", publisher: "MIT Press", description: "Comprehensive reference on data structures and algorithms." },
    { title: "The C Programming Language", author: "Brian W. Kernighan, Dennis M. Ritchie", isbn: "9780131103627", publicationYear: 1988, quantity: 15, price: 45, genre: "Programming", publisher: "Prentice Hall", description: "Classic guide to C programming from its original creators." },
    { title: "Operating System Concepts", author: "Abraham Silberschatz, Peter Galvin, Greg Gagne", isbn: "9781119800361", publicationYear: 2022, quantity: 8, price: 90, genre: "Operating Systems", publisher: "Wiley", description: "Foundational OS text covering processes, memory, and file systems." },
    { title: "Modern Operating Systems", author: "Andrew S. Tanenbaum", isbn: "9780133591620", publicationYear: 2015, quantity: 10, price: 80, genre: "Operating Systems", publisher: "Pearson", description: "Detailed OS principles with examples from modern systems." },
    { title: "Computer Networks", author: "Andrew S. Tanenbaum, David Wetherall", isbn: "9789332575772", publicationYear: 2017, quantity: 12, price: 75, genre: "Networking", publisher: "Pearson", description: "In-depth explanation of network architectures and protocols." },
    { title: "Computer Networking: A Top-Down Approach", author: "James F. Kurose, Keith W. Ross", isbn: "9781292405469", publicationYear: 2021, quantity: 10, price: 88, genre: "Networking", publisher: "Pearson", description: "Modern networking concepts explained from application layer down." },
    { title: "Database System Concepts", author: "Silberschatz, Korth, Sudarshan", isbn: "9780078022159", publicationYear: 2019, quantity: 14, price: 70, genre: "Databases", publisher: "McGraw-Hill", description: "Widely used database management and design textbook." },
    { title: "Database Management Systems", author: "Raghu Ramakrishnan, Johannes Gehrke", isbn: "9780072465631", publicationYear: 2003, quantity: 6, price: 65, genre: "Databases", publisher: "McGraw-Hill", description: "Solid foundation for relational databases and query optimization." },
    { title: "Computer Organization and Design", author: "David A. Patterson, John L. Hennessy", isbn: "9780128201091", publicationYear: 2020, quantity: 9, price: 95, genre: "Computer Architecture", publisher: "Morgan Kaufmann", description: "Classic text explaining hardware and digital logic foundations." },
    { title: "Digital Design and Computer Architecture", author: "David M. Harris, Sarah L. Harris", isbn: "9780128000564", publicationYear: 2015, quantity: 7, price: 75, genre: "Hardware Design", publisher: "Morgan Kaufmann", description: "Practical introduction to digital design principles." },
    { title: "Compiler Design: Principles, Techniques, and Tools", author: "Aho, Sethi, Ullman", isbn: "9780201100884", publicationYear: 2006, quantity: 6, price: 80, genre: "Compiler Design", publisher: "Pearson", description: "The “Dragon Book” — authoritative guide to compilers." },
    { title: "Theory of Computation", author: "Michael Sipser", isbn: "9788131525296", publicationYear: 2012, quantity: 10, price: 65, genre: "Theory", publisher: "Cengage Learning", description: "Covers automata, complexity, and formal languages." },
    { title: "Automata Theory, Languages, and Computation", author: "Hopcroft, Motwani, Ullman", isbn: "9781292039053", publicationYear: 2013, quantity: 9, price: 70, genre: "Theory", publisher: "Pearson", description: "Core text for automata and formal language theory." },
    { title: "Software Engineering: A Practitioner’s Approach", author: "Roger S. Pressman, Bruce Maxim", isbn: "9781260474213", publicationYear: 2020, quantity: 10, price: 90, genre: "Software Engineering", publisher: "McGraw-Hill", description: "Complete coverage of software lifecycle and process models." },
    { title: "Design Patterns", author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides", isbn: "9780201633610", publicationYear: 1994, quantity: 8, price: 65, genre: "Software Design", publisher: "Addison-Wesley", description: "Introduces reusable object-oriented design patterns." },
    { title: "Artificial Intelligence: A Modern Approach", author: "Stuart Russell, Peter Norvig", isbn: "9781292401133", publicationYear: 2021, quantity: 10, price: 95, genre: "Artificial Intelligence", publisher: "Pearson", description: "The standard textbook on AI fundamentals." },
    { title: "Machine Learning", author: "Tom M. Mitchell", isbn: "9780070428072", publicationYear: 1997, quantity: 6, price: 70, genre: "Machine Learning", publisher: "McGraw-Hill", description: "Introductory text for ML concepts and algorithms." },
    { title: "Pattern Recognition and Machine Learning", author: "Christopher Bishop", isbn: "9780387310732", publicationYear: 2006, quantity: 5, price: 85, genre: "Machine Learning", publisher: "Springer", description: "Probabilistic approach to ML and pattern recognition." },
    { title: "Data Mining: Concepts and Techniques", author: "Jiawei Han, Micheline Kamber, Jian Pei", isbn: "9780123814793", publicationYear: 2011, quantity: 7, price: 75, genre: "Data Mining", publisher: "Morgan Kaufmann", description: "Comprehensive coverage of data mining methods." },
    { title: "Cryptography and Network Security", author: "William Stallings", isbn: "9780134444284", publicationYear: 2016, quantity: 8, price: 80, genre: "Cyber Security", publisher: "Pearson", description: "Covers cryptographic algorithms and network security design." },
    { title: "Distributed Systems: Concepts and Design", author: "George Coulouris et al.", isbn: "9780132143011", publicationYear: 2012, quantity: 7, price: 70, genre: "Distributed Systems", publisher: "Pearson", description: "Explains distributed architectures and protocols." },
    { title: "Cloud Computing: Theory and Practice", author: "Dan C. Marinescu", isbn: "9780128128109", publicationYear: 2017, quantity: 6, price: 85, genre: "Cloud Computing", publisher: "Morgan Kaufmann", description: "Explores principles and technologies behind modern clouds." },
    { title: "Internet of Things: A Hands-On Approach", author: "Arshdeep Bahga, Vijay Madisetti", isbn: "9780996025515", publicationYear: 2014, quantity: 10, price: 65, genre: "IoT", publisher: "Universities Press", description: "Practical guide with projects on IoT systems." },
    { title: "Computer Graphics: Principles and Practice", author: "John F. Hughes et al.", isbn: "9780321399526", publicationYear: 2014, quantity: 6, price: 90, genre: "Graphics", publisher: "Addison-Wesley", description: "Comprehensive book on rendering and 3D computer graphics." },
    { title: "Digital Image Processing", author: "Rafael C. Gonzalez, Richard E. Woods", isbn: "9780133356724", publicationYear: 2018, quantity: 5, price: 95, genre: "Image Processing", publisher: "Pearson", description: "Industry-standard text on image enhancement and filtering." },
    { title: "Data Science from Scratch", author: "Joel Grus", isbn: "9781492041139", publicationYear: 2019, quantity: 12, price: 60, genre: "Data Science", publisher: "O’Reilly", description: "Practical introduction to data science using Python." },
    { title: "Python Crash Course", author: "Eric Matthes", isbn: "9781718502703", publicationYear: 2023, quantity: 10, price: 45, genre: "Programming", publisher: "No Starch Press", description: "Hands-on Python programming guide." },
    { title: "Deep Learning", author: "Ian Goodfellow, Yoshua Bengio, Aaron Courville", isbn: "9780262035613", publicationYear: 2016, quantity: 7, price: 95, genre: "Deep Learning", publisher: "MIT Press", description: "The definitive book on deep learning theory and applications." },
    { title: "Computer Security: Principles and Practice", author: "Stallings, Brown", isbn: "9780134794105", publicationYear: 2018, quantity: 8, price: 85, genre: "Cyber Security", publisher: "Pearson", description: "Covers computer and information security principles." },
    { title: "Engineering Mathematics", author: "B. V. Ramana", isbn: "9780070620490", publicationYear: 2010, quantity: 15, price: 40, genre: "Mathematics", publisher: "McGraw-Hill", description: "Core math textbook for engineering courses." },
  ];

  try {
    await Book.deleteMany({});
    const created = await Book.insertMany(books, { ordered: false });
    console.log(`✅ Replaced books: inserted ${created.length} new books`);
    const totalBooks = await Book.countDocuments();
    console.log(`📚 Total books in database now: ${totalBooks}`);
    return created;
  } catch (error) {
    console.error("❌ Error replacing books:", error);
    throw error;
  }
};

// Add curated general list without removing existing (upsert by ISBN)
const addCuratedBooks = async () => {
  const books = [
    { title: "It Ends With Us", author: "Colleen Hoover", isbn: "9781501110368", publicationYear: 2016, quantity: 20, price: 15, genre: "Romance", publisher: "Atria Books", description: "Emotional novel exploring love and resilience." },
    { title: "White Nights", author: "Fyodor Dostoevsky", isbn: "9780140447281", publicationYear: 1848, quantity: 10, price: 8, genre: "Classic", publisher: "Penguin Classics", description: "A lonely man’s dreamlike story of love and hope." },
    { title: "To Kill a Mockingbird", author: "Harper Lee", isbn: "9780061120084", publicationYear: 1960, quantity: 12, price: 12, genre: "Classic", publisher: "HarperCollins", description: "A timeless novel on justice, race, and childhood." },
    { title: "1984", author: "George Orwell", isbn: "9780451524935", publicationYear: 1949, quantity: 15, price: 10, genre: "Dystopian", publisher: "Signet Classics", description: "Visionary story of surveillance and totalitarianism." },
    { title: "Pride and Prejudice", author: "Jane Austen", isbn: "9780141439518", publicationYear: 1813, quantity: 14, price: 10, genre: "Romance", publisher: "Penguin", description: "Classic story of manners, marriage, and society." },
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", isbn: "9780743273565", publicationYear: 1925, quantity: 10, price: 12, genre: "Classic", publisher: "Scribner", description: "Portrait of ambition and disillusionment in the Jazz Age." },
    { title: "The Alchemist", author: "Paulo Coelho", isbn: "9780062315007", publicationYear: 1988, quantity: 18, price: 13, genre: "Fiction", publisher: "HarperOne", description: "Philosophical tale about following your dreams." },
    { title: "The Kite Runner", author: "Khaled Hosseini", isbn: "9781594631931", publicationYear: 2003, quantity: 10, price: 14, genre: "Drama", publisher: "Riverhead Books", description: "Powerful story of friendship, guilt, and redemption." },
    { title: "The Fault in Our Stars", author: "John Green", isbn: "9780525478812", publicationYear: 2012, quantity: 15, price: 13, genre: "Romance", publisher: "Dutton Books", description: "Heartbreaking teenage love story about illness and hope." },
    { title: "The Book Thief", author: "Markus Zusak", isbn: "9780375842207", publicationYear: 2005, quantity: 8, price: 14, genre: "Historical Fiction", publisher: "Knopf", description: "Story of a young girl’s courage in Nazi Germany." },
    { title: "Atomic Habits", author: "James Clear", isbn: "9780735211292", publicationYear: 2018, quantity: 20, price: 18, genre: "Self-Help", publisher: "Penguin", description: "Practical strategies to build good habits and break bad ones." },
    { title: "Sapiens: A Brief History of Humankind", author: "Yuval Noah Harari", isbn: "9780062316097", publicationYear: 2015, quantity: 10, price: 20, genre: "History", publisher: "Harper", description: "Thought-provoking history of humanity." },
    { title: "The Silent Patient", author: "Alex Michaelides", isbn: "9781250301697", publicationYear: 2019, quantity: 10, price: 15, genre: "Thriller", publisher: "Celadon Books", description: "Psychological thriller about silence and revenge." },
    { title: "The Girl on the Train", author: "Paula Hawkins", isbn: "9781594634024", publicationYear: 2015, quantity: 10, price: 14, genre: "Thriller", publisher: "Riverhead Books", description: "A gripping tale of suspense and perception." },
    { title: "Becoming", author: "Michelle Obama", isbn: "9781524763138", publicationYear: 2018, quantity: 8, price: 20, genre: "Biography", publisher: "Crown", description: "Inspiring memoir of the former First Lady." },
    { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", isbn: "9780374533557", publicationYear: 2011, quantity: 12, price: 16, genre: "Psychology", publisher: "Farrar, Straus and Giroux", description: "Exploration of human thinking and biases." },
    { title: "Educated", author: "Tara Westover", isbn: "9780399590504", publicationYear: 2018, quantity: 8, price: 17, genre: "Memoir", publisher: "Random House", description: "Memoir of resilience and self-education." },
    { title: "One Hundred Years of Solitude", author: "Gabriel García Márquez", isbn: "9780060883287", publicationYear: 1967, quantity: 7, price: 15, genre: "Magical Realism", publisher: "Harper Perennial", description: "Epic tale of the Buendía family in Macondo." },
    { title: "The Hobbit", author: "J.R.R. Tolkien", isbn: "9780261103344", publicationYear: 1937, quantity: 10, price: 14, genre: "Fantasy", publisher: "HarperCollins", description: "Adventure fantasy of Bilbo Baggins and the dragon Smaug." },
    { title: "The Lord of the Rings", author: "J.R.R. Tolkien", isbn: "9780261102385", publicationYear: 1954, quantity: 7, price: 35, genre: "Fantasy", publisher: "HarperCollins", description: "Epic fantasy trilogy about power and courage." },
  ]

  try {
    const ops = books.map(b => ({
      updateOne: {
        filter: { isbn: b.isbn },
        update: { $setOnInsert: b },
        upsert: true
      }
    }))
    const result = await Book.bulkWrite(ops, { ordered: false });
    const insertedCount = result.upsertedCount || 0;
    const total = await Book.countDocuments();
    console.log(`✅ Curated add: ${insertedCount} books upserted`);
    console.log(`📚 Total books now: ${total}`);
  } catch (err) {
    console.error('❌ Error adding curated books:', err);
    throw err;
  }
}

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
    if (ADD_CURATED) {
      console.log("\n📚 Adding curated general list (no removal)...");
      await addCuratedBooks();
      mongoose.connection.close();
      process.exit(0);
    }
    if (REPLACE_WITH_PROVIDED) {
      console.log("\n📚 Replacing all books with provided curated list...");
      const books = await seedProvidedBooks();
      console.log("\n✅ Book replacement completed.");
      console.log("\n📊 Summary:");
      console.log(`   - ${books.length} books inserted`);
      mongoose.connection.close();
      process.exit(0);
    }
    if (!APPEND_ONLY) {
      await clearDatabase();
    } else {
      console.log("ℹ️ Append-only mode: existing data will be preserved.");
    }
    
    console.log("\n📚 Seeding books...");
    const books = await seedBooks({ mode: APPEND_ONLY ? 'append' : 'full', unique: FORCE_UNIQUE });
    
    if (!books || books.length === 0) {
      throw new Error("Failed to create books");
    }
    
    let users = [];
    if (!APPEND_ONLY) {
      console.log("\n👥 Seeding users...");
      users = await seedUsers();
    }
    // In append-only mode we skip user-dependent seeders; don't require users
    if (!APPEND_ONLY) {
      if (!users || users.length === 0) {
        throw new Error("Failed to create users");
      }
    }
    
    if (!APPEND_ONLY) {
      console.log("\n📖 Seeding borrow records...");
      await seedBorrows(books, users);
    }
    
    if (!APPEND_ONLY) {
      console.log("\n💡 Seeding book suggestions... (skipping invalid category validation in seed)");
      try {
        await seedSuggestions(users);
      } catch (e) {
        console.warn("⚠️ Skipped suggestions seeding due to validation error.");
      }
    }
    
    if (!APPEND_ONLY) {
      console.log("\n📁 Seeding archives... (skipping validation-sensitive fields in seed)");
      try {
        await seedArchives(users);
      } catch (e) {
        console.warn("⚠️ Skipped archives seeding due to validation error.");
      }
    }
    
    console.log("\n✅ Database seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Books processed: ${books.length} (upserted; existing kept)`);
    if (!APPEND_ONLY) {
      console.log(`   - ${users.length} users`);
      console.log(`   - 6 borrow records`);
      console.log(`   - 3 book suggestions`);
      console.log(`   - 3 archives`);
    }
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

