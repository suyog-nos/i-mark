const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Article = require('./models/Article');
const Category = require('./models/Category');

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding...');
  } catch (err) {
    console.error('Error connecting to DB:', err.message);
    process.exit(1);
  }
};

const categories = [
  { name: 'Politics', slug: 'politics', color: '#ef4444', description: 'Government, elections, and political news' },
  { name: 'Sports', slug: 'sports', color: '#10b981', description: 'Sports events, scores, and athlete news' },
  { name: 'Technology', slug: 'technology', color: '#3b82f6', description: 'Tech innovations, gadgets, and digital trends' },
  { name: 'Business', slug: 'business', color: '#f59e0b', description: 'Markets, economy, and business developments' },
  { name: 'Health', slug: 'health', color: '#8b5cf6', description: 'Medical news, wellness, and health tips' },
  { name: 'Entertainment', slug: 'entertainment', color: '#ec4899', description: 'Movies, music, celebrities, and entertainment' },
  { name: 'Science', slug: 'science', color: '#06b6d4', description: 'Scientific discoveries and research' },
  { name: 'Education', slug: 'education', color: '#84cc16', description: 'Educational news and academic updates' }
];

const seedData = async () => {
  try {
    /*
     * THE DATA INITIALIZATION ENGINE (Workflow Overview)
     * This script is the foundational reset button for the entire Insight World platform. 
     * To ensure a completely clean state for testing and presentation, we first purge all 
     * existing records from the User, Article, and Category collections. The workflow then 
     * transitions into a "Security First" phase—instead of just saving plain passwords, we 
     * generate unique salt-rounds and hashes for each seeded user. This mirrors real-world 
     * production environments where data integrity is paramount. Finally, it links articles 
     * to their respective authors and categories, building a complex relational graph that 
     * powers the frontend's discovery features.
     */
    await User.deleteMany();
    await Article.deleteMany();
    await Category.deleteMany();
    console.log('Existing data cleared.');

    // Create Users
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const admin = await User.create({
      name: 'Arun Subedi',
      email: 'admin@imark.com',
      password: 'password123', // This will be hashed by the pre-save hook
      role: 'admin',
      status: 'active'
    });

    const publishers = await User.insertMany([
      {
        name: 'Bimal Adhikari',
        email: 'bimal@imark.com',
        password: hashedPassword, // Manually hashed for insertMany
        role: 'publisher',
        status: 'active',
        profile: { bio: 'Senior political correspondent with 15 years of experience in Nepali journalism.' }
      },
      {
        name: 'Pratima Pandey',
        email: 'pratima@imark.com',
        password: hashedPassword, // Manually hashed for insertMany
        role: 'publisher',
        status: 'active',
        profile: { bio: 'Tech enthusiast specializing in the burgeoning IT landscape of Nepal.' }
      }
    ]);

    const readers = await User.insertMany([
      { name: 'Sushila Thapa', email: 'sushila@example.com', password: hashedPassword, role: 'reader' },
      { name: 'Dipesh Rai', email: 'dipesh@example.com', password: hashedPassword, role: 'reader' },
      { name: 'Manisha Shrestha', email: 'manisha@example.com', password: hashedPassword, role: 'reader' },
      { name: 'Gopal Gurung', email: 'gopal@example.com', password: hashedPassword, role: 'reader' }
    ]);

    console.log('Users seeded with hashed passwords.');

    // Create Categories
    await Category.insertMany(categories);
    console.log('Categories seeded.');

    // Create Articles
    const articlesData = [
      {
        title: 'New Digital Policy Announced by Government',
        content: 'The government has announced a comprehensive new digital policy aimed at boosting the tech sector and improving cybersecurity infrastructure across the nation. The policy includes tax incentives for startups and major investments in broadband connectivity for rural areas...',
        author: publishers[0]._id,
        category: 'Politics',
        status: 'published',
        views: 1250,
        featured: true,
        featuredImage: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1000',
        tags: ['government', 'digital', 'policy']
      },
      {
        title: 'Local Team Wins Championship in Thrilling Final',
        content: 'In a game that will be remembered for years, the local football team secured the national championship with a last-minute goal. The atmosphere in the stadium was electric as fans celebrated the historic victory...',
        author: publishers[0]._id,
        category: 'Sports',
        status: 'published',
        views: 3400,
        featuredImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000',
        tags: ['sports', 'football', 'championship']
      },
      {
        title: 'Next-Gen AI Models are Changing Software Development',
        content: 'The landscape of software engineering is undergoing a radical shift as new large language models specifically tuned for code are being deployed. Developers are seeing 2x productivity gains, but questions remain about long-term job security...',
        author: publishers[1]._id,
        category: 'Technology',
        status: 'published',
        views: 5600,
        featuredImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1000',
        tags: ['AI', 'tech', 'software']
      },
      {
        title: 'Stock Market Reaches Record High Amid Economic Growth',
        content: 'The national stock exchange closed at an all-time high today, driven by strong quarterly earnings from the tech and energy sectors. Analysts point to declining inflation and robust consumer spending as the primary drivers...',
        author: publishers[0]._id,
        category: 'Business',
        status: 'published',
        views: 890,
        featuredImage: 'https://images.unsplash.com/photo-1611974717483-5828ec5300d8?q=80&w=1000',
        tags: ['stocks', 'economy', 'business']
      },
      {
        title: 'Breakthrough in Renewable Energy Storage',
        content: 'Researchers have unveiled a new type of solid-state battery that can store 3 times more energy than current lithium-ion technologies. This breakthrough could finally make long-range electric aviation a reality...',
        author: publishers[1]._id,
        category: 'Science',
        status: 'published',
        views: 3200,
        featuredImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000',
        tags: ['science', 'discovery', 'nature']
      },
      {
        title: 'Healthy Living: 5 Habits for a Better Sleep',
        content: 'Sleep is the foundation of good health. Experts suggest maintaining a consistent schedule, avoiding screens before bed, and creating a cool, dark environment to improve the quality of your rest...',
        author: publishers[1]._id,
        category: 'Health',
        status: 'published',
        views: 2100,
        featuredImage: 'https://images.unsplash.com/photo-1505751172107-5739a0072605?q=80&w=1000',
        tags: ['health', 'medical', 'research']
      },
      {
        title: 'New Blockbuster Movie Breaks Opening Weekend Records',
        content: 'The latest entry in the galactic franchise has shattered previous records, earning over $200 million in its first three days. Fans praised the visual effects and the emotional depth of the performances...',
        author: publishers[0]._id,
        category: 'Entertainment',
        status: 'published',
        views: 4500,
        featuredImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000',
        tags: ['movies', 'awards', 'celebrity']
      },
      {
        title: 'Reform in Higher Education System Proposed',
        content: 'The ministry of education has proposed a significant overhaul of the university grading system and research funding models. The goal is to align academic outcomes more closely with industry needs...',
        author: publishers[0]._id,
        category: 'Education',
        status: 'flagged',
        reviewerComments: 'Please provide more sources for the ministry quotes.',
        views: 120,
        tags: ['education', 'reform', 'university']
      },
      {
        title: 'Mars Rover Discovers Evidence of Ancient Water',
        content: 'The latest data transmitted from the Perseverance rover confirms the presence of carbonate minerals in the Jezero crater, suggesting that water was present for long periods in the planet\'s past...',
        author: publishers[1]._id,
        category: 'Science',
        status: 'published',
        views: 8700,
        featured: true,
        featuredImage: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1000',
        tags: ['space', 'mars', 'NASA']
      },
      {
        title: 'Rise of Remote Work in the Post-Pandemic Era',
        content: 'Recent data shows that 40% of companies have permanently adopted a hybrid or remote-first model. This shift is reshaping urban planning, transportation, and commercial real estate markets...',
        author: publishers[0]._id,
        category: 'Business',
        status: 'published',
        views: 1540,
        featuredImage: 'https://images.unsplash.com/photo-1491336477066-31156b5e4f35?q=80&w=1000',
        tags: ['work', 'business', 'remote']
      }
    ];

    const createdArticles = await Article.insertMany(articlesData);
    console.log('Articles seeded.');

    // Add some interactions
    // Add comments to the first article
    const article1 = createdArticles[0];
    article1.comments.push(
      { user: readers[0]._id, content: 'Very insightful article, thank you!' },
      { user: readers[1]._id, content: 'I hope the policy actually helps small businesses.' }
    );
    article1.likes.push(readers[0]._id, readers[1]._id, readers[2]._id);
    await article1.save();

    // Add likes to the third article (AI)
    const article3 = createdArticles[2];
    article3.likes.push(readers[0]._id, readers[2]._id);
    await article3.save();

    // NEW: Seed Bookmarks for Readers
    // Give readers[0] (Sushila) some bookmarks
    await User.findByIdAndUpdate(readers[0]._id, {
      $push: { bookmarks: { $each: [createdArticles[0]._id, createdArticles[7]._id] } }
    });

    // Give readers[1] (Dipesh) a bookmark
    await User.findByIdAndUpdate(readers[1]._id, {
      $push: { bookmarks: createdArticles[1]._id }
    });

    console.log('Interactions and Bookmarks seeded.');
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

connectDB().then(seedData);
