import mongoose from "mongoose";
import { Book } from "./models/bookModel.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: "./config/config.env" });

const connect = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    dbName: "MERN_STACK_LIBRARY_MANAGEMENT",
  });
  console.log("✅ DB connected to MERN_STACK_LIBRARY_MANAGEMENT");
};

const booksData = {
  "computer_science_books": [
    {
      "title": "Introduction to Algorithms",
      "author": "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein",
      "isbn": "978-0-2620-3384-8",
      "publisher": "MIT Press",
      "genre": "Computer Science",
      "publicationYear": 2009,
      "description": "The essential 'bible' of algorithms, covering a broad range of algorithms in depth.",
      "price": 99.99,
      "quantity": 15,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/13096929991729535238"
      }
    },
    {
      "title": "Operating System Concepts",
      "author": "Abraham Silberschatz, Peter B. Galvin, Greg Gagne",
      "isbn": "978-1-1180-6333-0",
      "publisher": "Wiley",
      "genre": "Computer Science",
      "publicationYear": 2012,
      "description": "A foundational text on the principles and functions of modern operating systems.",
      "price": 175.50,
      "quantity": 12,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/14150585871564903235"
      }
    },
    {
      "title": "Database System Concepts",
      "author": "Abraham Silberschatz, Henry F. Korth, S. Sudarshan",
      "isbn": "978-0-0735-2332-3",
      "publisher": "McGraw-Hill",
      "genre": "Computer Science",
      "publicationYear": 2010,
      "description": "A comprehensive guide to the design, implementation, and management of database systems.",
      "price": 149.00,
      "quantity": 18,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/6976469562153748079"
      }
    },
    {
      "title": "Computer Networking: A Top-Down Approach",
      "author": "James F. Kurose, Keith W. Ross",
      "isbn": "978-0-1335-4423-4",
      "publisher": "Pearson",
      "genre": "Computer Science",
      "publicationYear": 2016,
      "description": "Teaches computer networking from the application layer down to the physical layer.",
      "price": 165.25,
      "quantity": 20,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/239388679201752820"
      }
    },
    {
      "title": "The C++ Programming Language",
      "author": "Bjarne Stroustrup",
      "isbn": "978-0-3215-6384-2",
      "publisher": "Addison-Wesley",
      "genre": "Programming",
      "publicationYear": 2013,
      "description": "The definitive guide to C++ written by its creator.",
      "price": 79.99,
      "quantity": 25,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/16721035635686588299"
      }
    },
    {
      "title": "Clean Code: A Handbook of Agile Software Craftsmanship",
      "author": "Robert C. Martin",
      "isbn": "978-0-1323-5088-4",
      "publisher": "Prentice Hall",
      "genre": "Software Engineering",
      "publicationYear": 2008,
      "description": "A book on best practices for writing readable, maintainable, and robust code.",
      "price": 45.99,
      "quantity": 30,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/10883407375670658594"
      }
    },
    {
      "title": "Compilers: Principles, Techniques, and Tools",
      "author": "Alfred V. Aho, Monica S. Lam, Ravi Sethi, Jeffrey D. Ullman",
      "isbn": "978-0-3214-8681-3",
      "publisher": "Pearson",
      "genre": "Computer Science",
      "publicationYear": 2006,
      "description": "The classic 'Dragon Book' on compiler design and theory.",
      "price": 185.00,
      "quantity": 8,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/15832276933170288554"
      }
    },
    {
      "title": "Artificial Intelligence: A Modern Approach",
      "author": "Stuart Russell, Peter Norvig",
      "isbn": "978-0-1360-4259-4",
      "publisher": "Prentice Hall",
      "genre": "Artificial Intelligence",
      "publicationYear": 2020,
      "description": "A comprehensive and up-to-date introduction to the theory and practice of AI.",
      "price": 199.99,
      "quantity": 11,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/10651150083509434612"
      }
    },
    {
      "title": "Discrete Mathematics and Its Applications",
      "author": "Kenneth H. Rosen",
      "isbn": "978-0-0733-8309-5",
      "publisher": "McGraw-Hill",
      "genre": "Mathematics",
      "publicationYear": 2011,
      "description": "A fundamental text for understanding the mathematical structures essential for computer science.",
      "price": 140.00,
      "quantity": 14,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/8490542277454102500"
      }
    },
    {
      "title": "Computer Organization and Design",
      "author": "David A. Patterson, John L. Hennessy",
      "isbn": "978-0-1240-7726-3",
      "publisher": "Morgan Kaufmann",
      "genre": "Computer Architecture",
      "publicationYear": 2013,
      "description": "Explores the hardware/software interface, focusing on RISC-V architecture.",
      "price": 89.95,
      "quantity": 16,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/8711254932247767124"
      }
    },
    {
      "title": "Head First Java",
      "author": "Kathy Sierra, Bert Bates",
      "isbn": "978-0-5960-0920-5",
      "publisher": "O'Reilly Media",
      "genre": "Programming",
      "publicationYear": 2005,
      "description": "A visually rich and brain-friendly guide to learning Java.",
      "price": 54.99,
      "quantity": 22,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/3479483305788212444"
      }
    },
    {
      "title": "Python Crash Course",
      "author": "Eric Matthes",
      "isbn": "978-1-5932-7928-8",
      "publisher": "No Starch Press",
      "genre": "Programming",
      "publicationYear": 2019,
      "description": "A fast-paced, project-based introduction to Python programming.",
      "price": 39.95,
      "quantity": 40,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/12491302252845850337"
      }
    },
    {
      "title": "Designing Data-Intensive Applications",
      "author": "Martin Kleppmann",
      "isbn": "978-1-4493-7332-0",
      "publisher": "O'Reilly Media",
      "genre": "Software Engineering",
      "publicationYear": 2017,
      "description": "The essential guide to understanding the pros and cons of different technologies for processing and storing data.",
      "price": 59.99,
      "quantity": 18,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/17385112519799654954"
      }
    },
    {
      "title": "Software Engineering: A Practitioner's Approach",
      "author": "Roger S. Pressman, Bruce R. Maxim",
      "isbn": "978-0-0780-2212-8",
      "publisher": "McGraw-Hill",
      "genre": "Software Engineering",
      "publicationYear": 2014,
      "description": "A classic textbook covering all aspects of the software engineering process.",
      "price": 210.00,
      "quantity": 9,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/7572710634161256798"
      }
    },
    {
      "title": "The C Programming Language",
      "author": "Brian W. Kernighan, Dennis M. Ritchie",
      "isbn": "978-0-1311-0362-7",
      "publisher": "Prentice Hall",
      "genre": "Programming",
      "publicationYear": 1988,
      "description": "The seminal work on the C programming language, often referred to as K&R.",
      "price": 65.00,
      "quantity": 28,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/10981734742941159025"
      }
    },
    {
      "title": "Introduction to the Theory of Computation",
      "author": "Michael Sipser",
      "isbn": "978-1-1331-8779-0",
      "publisher": "Cengage Learning",
      "genre": "Computer Science",
      "publicationYear": 2012,
      "description": "A highly accessible introduction to formal languages, automata, and complexity.",
      "price": 225.95,
      "quantity": 7,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/16082415561224843002"
      }
    },
    {
      "title": "Hands-On Machine Learning with Scikit-Learn, Keras & TensorFlow",
      "author": "Aurélien Géron",
      "isbn": "978-1-4920-3264-9",
      "publisher": "O'Reilly Media",
      "genre": "Machine Learning",
      "publicationYear": 2019,
      "description": "A practical guide to implementing machine learning models using popular Python frameworks.",
      "price": 69.99,
      "quantity": 25,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/186668626046612971"
      }
    },
    {
      "title": "Head First Design Patterns",
      "author": "Eric Freeman, Elisabeth Robson",
      "isbn": "978-0-5960-0712-6",
      "publisher": "O'Reilly Media",
      "genre": "Software Engineering",
      "publicationYear": 2004,
      "description": "An engaging guide to learning and applying common software design patterns.",
      "price": 59.95,
      "quantity": 19,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/8836474978375231543"
      }
    },
    {
      "title": "Cracking the Coding Interview",
      "author": "Gayle Laakmann McDowell",
      "isbn": "978-0-9847-8285-7",
      "publisher": "CareerCup",
      "genre": "Interview Preparation",
      "publicationYear": 2015,
      "description": "A comprehensive book with programming questions and solutions for technical interviews.",
      "price": 39.95,
      "quantity": 50,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/11872933030687819584"
      }
    },
    {
      "title": "Eloquent JavaScript",
      "author": "Marijn Haverbeke",
      "isbn": "978-1-5932-7950-9",
      "publisher": "No Starch Press",
      "genre": "Programming",
      "publicationYear": 2018,
      "description": "A modern introduction to programming with JavaScript.",
      "price": 39.95,
      "quantity": 33,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/5581120991699873007"
      }
    },
    {
      "title": "Cryptography and Network Security",
      "author": "William Stallings",
      "isbn": "978-0-1344-4428-4",
      "publisher": "Pearson",
      "genre": "Cybersecurity",
      "publicationYear": 2016,
      "description": "An exploration of the principles and practices of cryptography and network security.",
      "price": 195.00,
      "quantity": 10,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/15473432096014541711"
      }
    },
    {
      "title": "Structure and Interpretation of Computer Programs",
      "author": "Harold Abelson, Gerald Jay Sussman, Julie Sussman",
      "isbn": "978-0-2625-1087-5",
      "publisher": "MIT Press",
      "genre": "Computer Science",
      "publicationYear": 1996,
      "description": "A classic text that fundamentally shaped computer science education, using the Scheme language.",
      "price": 75.00,
      "quantity": 13,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/12857078626172528395"
      }
    },
    {
      "title": "System Design Interview – An insider's guide",
      "author": "Alex Xu",
      "isbn": "978-1-7360-4911-2",
      "publisher": "Byte-Byte-Go",
      "genre": "Interview Preparation",
      "publicationYear": 2021,
      "description": "A guide to preparing for system design interviews with a step-by-step framework.",
      "price": 34.99,
      "quantity": 45,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/10829173597570403046"
      }
    },
    {
      "title": "The Linux Programming Interface",
      "author": "Michael Kerrisk",
      "isbn": "978-1-5932-7220-3",
      "publisher": "No Starch Press",
      "genre": "Operating Systems",
      "publicationYear": 2010,
      "description": "A definitive guide to the Linux and UNIX system programming interface.",
      "price": 99.95,
      "quantity": 9,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/4789037911674484948"
      }
    },
    {
      "title": "Grokking Algorithms",
      "author": "Aditya Y. Bhargava",
      "isbn": "978-1-6172-9223-1",
      "publisher": "Manning",
      "genre": "Computer Science",
      "publicationYear": 2016,
      "description": "An illustrated guide for programmers to learn algorithms in a more intuitive way.",
      "price": 44.99,
      "quantity": 35,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/4140026021926630467"
      }
    },
    {
      "title": "The Pragmatic Programmer",
      "author": "David Thomas, Andrew Hunt",
      "isbn": "978-0-1359-5705-9",
      "publisher": "Addison-Wesley",
      "genre": "Software Engineering",
      "publicationYear": 2019,
      "description": "A collection of tips to improve development productivity, from personal responsibility to architectural techniques.",
      "price": 54.99,
      "quantity": 21,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/419646613588794256"
      }
    },
    {
      "title": "Fundamentals of Computer Graphics",
      "author": "Peter Shirley, Steve Marschner",
      "isbn": "978-1-4822-2939-4",
      "publisher": "CRC Press",
      "genre": "Computer Graphics",
      "publicationYear": 2015,
      "description": "A comprehensive introduction to the principles of 3D computer graphics.",
      "price": 89.95,
      "quantity": 8,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/13890148026112652894"
      }
    },
    {
      "title": "Competitive Programmer's Handbook",
      "author": "Antti Laaksonen",
      "isbn": "978-9-5268-9112-2",
      "publisher": "Self-published",
      "genre": "Competitive Programming",
      "publicationYear": 2018,
      "description": "A book that teaches modern competitive programming techniques and algorithms.",
      "price": 25.00,
      "quantity": 38,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/584199099779015959"
      }
    },
    {
      "title": "Deep Learning",
      "author": "Ian Goodfellow, Yoshua Bengio, Aaron Courville",
      "isbn": "978-0-2620-3561-3",
      "publisher": "MIT Press",
      "genre": "Machine Learning",
      "publicationYear": 2016,
      "description": "A foundational text that introduces a broad range of topics in deep learning.",
      "price": 85.00,
      "quantity": 12,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/7228975908438467510"
      }
    },
    {
      "title": "The Mythical Man-Month",
      "author": "Frederick P. Brooks Jr.",
      "isbn": "978-0-2018-3595-3",
      "publisher": "Addison-Wesley",
      "genre": "Software Engineering",
      "publicationYear": 1995,
      "description": "A classic collection of essays on software engineering and project management.",
      "price": 39.99,
      "quantity": 17,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/3390348898532426009"
      }
    }
  ],
  "other_genres": [
    {
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "isbn": "978-0-7432-7356-5",
      "publisher": "Scribner",
      "genre": "Classic Fiction",
      "publicationYear": 1925,
      "description": "A critique of the American Dream set in the Jazz Age on Long Island.",
      "price": 12.99,
      "quantity": 5,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/11135904159125259383"
      }
    },
    {
      "title": "To Kill a Mockingbird",
      "author": "Harper Lee",
      "isbn": "978-0-0611-2008-4",
      "publisher": "Harper Perennial Modern Classics",
      "genre": "Classic Fiction",
      "publicationYear": 1960,
      "description": "A novel about racial injustice in a small Southern town, seen through the eyes of a child.",
      "price": 14.99,
      "quantity": 10,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/17496461852044072582"
      }
    },
    {
      "title": "1984",
      "author": "George Orwell",
      "isbn": "978-0-4515-2493-5",
      "publisher": "Signet Classics",
      "genre": "Dystopian Fiction",
      "publicationYear": 1949,
      "description": "A terrifying vision of a totalitarian future where critical thought is suppressed.",
      "price": 9.99,
      "quantity": 15,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/7592755491027242910"
      }
    },
    {
      "title": "Dune",
      "author": "Frank Herbert",
      "isbn": "978-0-4410-1359-3",
      "publisher": "Ace Books",
      "genre": "Science Fiction",
      "publicationYear": 1965,
      "description": "A landmark sci-fi epic of politics, religion, and ecology on a desert planet.",
      "price": 18.00,
      "quantity": 12,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/14515189071909040459"
      }
    },
    {
      "title": "Sapiens: A Brief History of Humankind",
      "author": "Yuval Noah Harari",
      "isbn": "978-0-0623-1609-7",
      "publisher": "Harper",
      "genre": "Non-Fiction",
      "publicationYear": 2015,
      "description": "A sweeping survey of human history, from the Stone Age to the present day.",
      "price": 24.99,
      "quantity": 20,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/10245633253105267760"
      }
    },
    {
      "title": "Atomic Habits",
      "author": "James Clear",
      "isbn": "978-0-7352-1129-2",
      "publisher": "Avery",
      "genre": "Self-Help",
      "publicationYear": 2018,
      "description": "A practical guide on how to build good habits and break bad ones.",
      "price": 27.00,
      "quantity": 30,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/11885287487881492524"
      }
    },
    {
      "title": "The Hobbit",
      "author": "J.R.R. Tolkien",
      "isbn": "978-0-6182-6030-0",
      "publisher": "Houghton Mifflin Harcourt",
      "genre": "Fantasy",
      "publicationYear": 1937,
      "description": "The enchanting prelude to The Lord of the Rings, following Bilbo Baggins on an unexpected journey.",
      "price": 15.99,
      "quantity": 18,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/10291370833463325839"
      }
    },
    {
      "title": "The Alchemist",
      "author": "Paulo Coelho",
      "isbn": "978-0-0611-2241-5",
      "publisher": "HarperOne",
      "genre": "Philosophical Fiction",
      "publicationYear": 1988,
      "description": "An allegorical novel about a young shepherd who follows his dreams of finding treasure.",
      "price": 16.99,
      "quantity": 25,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/7440043926181309440"
      }
    },
    {
      "title": "Pride and Prejudice",
      "author": "Jane Austen",
      "isbn": "978-0-1414-3951-8",
      "publisher": "Penguin Classics",
      "genre": "Classic Romance",
      "publicationYear": 1813,
      "description": "A classic romance novel about the societal pressures and misunderstandings between lovers in Regency England.",
      "price": 8.99,
      "quantity": 14,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/1775257448599011550"
      }
    },
    {
      "title": "The Book Thief",
      "author": "Markus Zusak",
      "isbn": "978-0-3758-4220-9",
      "publisher": "Alfred A. Knopf",
      "genre": "Historical Fiction",
      "publicationYear": 2005,
      "description": "A story set in Nazi Germany, narrated by Death, about a young girl who steals books.",
      "price": 14.99,
      "quantity": 11,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/974426003338917666"
      }
    },
    {
      "title": "Educated: A Memoir",
      "author": "Tara Westover",
      "isbn": "978-0-3995-9050-4",
      "publisher": "Random House",
      "genre": "Memoir",
      "publicationYear": 2018,
      "description": "A powerful memoir about a young woman who, raised in a survivalist family, pursues education against all odds.",
      "price": 28.00,
      "quantity": 9,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/7208170149036450588"
      }
    },
    {
      "title": "Thinking, Fast and Slow",
      "author": "Daniel Kahneman",
      "isbn": "978-0-3745-3355-7",
      "publisher": "Farrar, Straus and Giroux",
      "genre": "Psychology",
      "publicationYear": 2011,
      "description": "A fascinating exploration of the two systems that drive the way we think.",
      "price": 18.00,
      "quantity": 16,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/15967550694388342433"
      }
    },
    {
      "title": "Where the Crawdads Sing",
      "author": "Delia Owens",
      "isbn": "978-0-7352-1909-0",
      "publisher": "G.P. Putnam's Sons",
      "genre": "Contemporary Fiction",
      "publicationYear": 2018,
      "description": "A coming-of-age story and a murder mystery set in the marshes of North Carolina.",
      "price": 26.00,
      "quantity": 22,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/6803848261836116659"
      }
    },
    {
      "title": "Harry Potter and the Sorcerer's Stone",
      "author": "J.K. Rowling",
      "isbn": "978-0-5903-5342-7",
      "publisher": "Scholastic",
      "genre": "Fantasy",
      "publicationYear": 1997,
      "description": "The first book in the series about a young wizard who discovers his magical heritage.",
      "price": 24.99,
      "quantity": 35,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/3372641991459687324"
      }
    },
    {
      "title": "Rich Dad Poor Dad",
      "author": "Robert T. Kiyosaki",
      "isbn": "978-1-6126-8019-4",
      "publisher": "Plata Publishing",
      "genre": "Personal Finance",
      "publicationYear": 1997,
      "description": "A book that challenges conventional wisdom about money and investing.",
      "price": 19.99,
      "quantity": 40,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/11251629230695004225"
      }
    },
    {
      "title": "The Silent Patient",
      "author": "Alex Michaelides",
      "isbn": "978-1-2503-0169-7",
      "publisher": "Celadon Books",
      "genre": "Thriller",
      "publicationYear": 2019,
      "description": "A psychological thriller about a woman's act of violence against her husband and the therapist obsessed with uncovering her motive.",
      "price": 26.99,
      "quantity": 15,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/17211549213111636152"
      }
    },
    {
      "title": "Circe",
      "author": "Madeline Miller",
      "isbn": "978-0-3165-5634-7",
      "publisher": "Little, Brown and Company",
      "genre": "Fantasy Fiction",
      "publicationYear": 2018,
      "description": "A retelling of Greek mythology from the perspective of the minor goddess and enchantress, Circe.",
      "price": 16.99,
      "quantity": 13,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/15937140974814086953"
      }
    },
    {
      "title": "Becoming",
      "author": "Michelle Obama",
      "isbn": "978-1-5247-6313-8",
      "publisher": "Crown",
      "genre": "Memoir",
      "publicationYear": 2018,
      "description": "The intimate and powerful memoir by the former First Lady of the United States.",
      "price": 32.50,
      "quantity": 28,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/5282195586869257199"
      }
    },
    {
      "title": "The Martian",
      "author": "Andy Weir",
      "isbn": "978-0-8041-3902-1",
      "publisher": "Crown Publishing Group",
      "genre": "Science Fiction",
      "publicationYear": 2014,
      "description": "An astronaut's struggle to survive after being stranded on Mars, told with scientific accuracy and humor.",
      "price": 15.00,
      "quantity": 24,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/1164009026875018289"
      }
    },
    {
      "title": "The Subtle Art of Not Giving a F*ck",
      "author": "Mark Manson",
      "isbn": "978-0-0624-5771-4",
      "publisher": "HarperOne",
      "genre": "Self-Help",
      "publicationYear": 2016,
      "description": "A counterintuitive approach to living a good life by focusing only on what is truly important.",
      "price": 24.99,
      "quantity": 32,
      "coverImage": {
        "url": "http://googleusercontent.com/image_collection/image_retrieval/12883106960716764065"
      }
    }
  ]
};

const addBooks = async () => {
  try {
    await connect();
    
    const allBooks = [...booksData.computer_science_books, ...booksData.other_genres];
    
    console.log(`📚 Adding ${allBooks.length} books to the database...`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const bookData of allBooks) {
      try {
        // Check if book with same ISBN already exists
        const existingBook = await Book.findOne({ isbn: bookData.isbn });
        
        if (existingBook) {
          console.log(`⚠️  Book with ISBN ${bookData.isbn} already exists: "${bookData.title}"`);
          skippedCount++;
          continue;
        }
        
        // Create new book
        const book = await Book.create(bookData);
        console.log(`✅ Added: "${book.title}" by ${book.author}`);
        addedCount++;
        
      } catch (error) {
        console.error(`❌ Error adding book "${bookData.title}":`, error.message);
        skippedCount++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`✅ Books added: ${addedCount}`);
    console.log(`⚠️  Books skipped: ${skippedCount}`);
    console.log(`📚 Total books processed: ${allBooks.length}`);
    
  } catch (error) {
    console.error("❌ Failed to add books:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Database connection closed");
  }
};

addBooks();
