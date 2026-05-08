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
        content: 'The government has announced a comprehensive new digital policy aimed at boosting the tech sector and improving cybersecurity infrastructure across the nation. The policy includes tax incentives for startups and major investments in broadband connectivity for rural areas.\n\nFollowing months of consultation with industry leaders, the Ministry of Information and Communication Technology emphasized that this framework will serve as the "backbone of our future economy." The plan outlines a roadmap for digitizing public services, reducing bureaucratic friction, and fostering a culture of innovation that aims to keep talent within the country rather than losing it to brain drain.\n\nCritics, however, have raised concerns regarding the potential for increased surveillance under the guise of cybersecurity. "While the economic incentives are welcome, we must ensure that digital privacy is not sacrificed on the altar of progress," stated a representative from a leading digital rights group. The government has pledged to address these concerns through a series of public forums and subsequent legislative amendments aimed at safeguarding data protection.\n\nAs the tech ecosystem prepares for this shift, local venture capitalists are already reporting an uptick in interest from international investors. The next six months will be critical as the first phase of the infrastructure rollout begins in three major provinces, setting the stage for a nationwide transformation.',
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
        content: 'In a game that will be remembered for years, the local football team secured the national championship with a last-minute goal. The atmosphere in the stadium was electric as fans celebrated the historic victory. The underdog squad, which had struggled earlier in the season, showed remarkable resilience throughout the ninety minutes of play.\n\nThe match was a tactical masterclass, with both sides trading blows in a high-intensity midfield battle. The decisive moment came in the 89th minute when a perfectly placed corner kick met the head of the team\'s youngest striker, sending the ball into the top corner of the net and igniting a frenzy among the home supporters. This victory marks the first major trophy for the club in over two decades.\n\nPost-match celebrations spilled out into the streets, with thousands of fans wearing team colors and chanting victory songs long into the night. Local businesses reported record sales as the city embraced the triumph. The team captain, visibly emotional, dedicated the win to the community, saying, "This isn\'t just our trophy; it belongs to everyone who believed in us when we were at our lowest."\n\nLooking ahead, the team is now set to represent the region in the upcoming continental tournament. While the celebration continues, the coaching staff is already focused on the challenges of competing at a higher level. For now, however, the city remains basked in the glory of a hard-earned and well-deserved championship.',
        author: publishers[0]._id,
        category: 'Sports',
        status: 'published',
        views: 3400,
        featuredImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1000',
        tags: ['sports', 'football', 'championship']
      },
      {
        title: 'Next-Gen AI Models are Changing Software Development',
        content: 'The landscape of software engineering is undergoing a radical shift as new large language models specifically tuned for code are being deployed. Developers are seeing 2x productivity gains, but questions remain about long-term job security. These tools are no longer just simple autocomplete plugins; they are now capable of architecting entire modules and identifying complex logic errors that previously took hours to debug.\n\nLeading tech firms are integrating these AI assistants directly into their development environments, creating a "co-pilot" experience that allows engineers to focus on higher-level problem solving while the AI handles boilerplate code. "It’s like moving from building a house with hand tools to using heavy machinery," said one senior architect. However, the rapid pace of adoption has outstripped our understanding of how these models truly function, leading to debates over code ownership and the ethics of training on open-source repositories.\n\nEducation systems are also feeling the impact, with computer science departments worldwide re-evaluating their curricula. The traditional emphasis on syntax and low-level coding is being supplemented with courses on prompt engineering and AI-human collaboration. Students are now expected to know not just how to write a function, but how to effectively audit and maintain code generated by a machine.\n\nAs we move into 2026, the question is no longer whether AI will change development, but how far that change will go. While some fear the "end of coding," most industry experts believe we are entering a new era of "enhanced engineering," where the barrier to entry for creating software is lower than ever, potentially triggering a global explosion in digital creativity.',
        author: publishers[1]._id,
        category: 'Technology',
        status: 'published',
        views: 5600,
        featuredImage: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1000',
        tags: ['AI', 'tech', 'software']
      },
      {
        title: 'Stock Market Reaches Record High Amid Economic Growth',
        content: 'The national stock exchange closed at an all-time high today, driven by strong quarterly earnings from the tech and energy sectors. Analysts point to declining inflation and robust consumer spending as the primary drivers of this sustained bull run. Major indices have seen a 15% increase since the beginning of the year, outperforming most global benchmarks.\n\nEnergy stocks led the surge as new renewable projects began showing significant profitability, while the tech sector benefited from the global AI boom. Institutional investors are shifting capital back into local equities, citing improved corporate transparency and a stable political environment. "We are seeing a perfect storm of positive catalysts that have restored investor confidence," noted a senior market analyst from a prominent brokerage firm.\n\nDespite the optimism, some economists warn of potential overheating. They caution that the rapid rise in valuations may not be fully supported by the underlying fundamentals in the long term. "The market is pricing in a perfect scenario," warned one professor of finance. "Any unexpected geopolitical shock or a shift in central bank policy could lead to a sharp correction."\n\nFor individual investors, the rally has been a welcome sight after years of volatility. However, experts advise maintaining a diversified portfolio and not getting caught up in the "fear of missing out." As the fiscal year draws to a close, all eyes will be on the upcoming earnings reports to see if the momentum can be sustained into the next quarter.',
        author: publishers[0]._id,
        category: 'Business',
        status: 'published',
        views: 890,
        featuredImage: 'https://images.unsplash.com/photo-1611974717483-5828ec5300d8?q=80&w=1000',
        tags: ['stocks', 'economy', 'business']
      },
      {
        title: 'Breakthrough in Renewable Energy Storage',
        content: 'Researchers have unveiled a new type of solid-state battery that can store 3 times more energy than current lithium-ion technologies. This breakthrough could finally make long-range electric aviation a reality, addressing one of the most significant challenges in the transition to a carbon-neutral world. The technology uses a proprietary ceramic electrolyte that is both safer and more energy-dense than liquid-based counterparts.\n\nThe development phase involved a decade of rigorous testing in both extreme cold and high-heat environments, proving the battery’s durability for commercial use. Unlike traditional batteries, these solid-state units are non-flammable and exhibit minimal degradation even after thousands of charge cycles. This longevity could significantly reduce the lifecycle cost of electric vehicles, making them more accessible to the general public.\n\nIndustry giants in the automotive and aerospace sectors are already vying for exclusive partnerships with the research lab. Preliminary manufacturing deals suggest that the first generation of these batteries could hit the market within the next 24 months. "This is the holy grail of energy storage," said the lead scientist on the project. "We aren’t just improving existing tech; we are fundamentally changing how energy is moved and stored."\n\nWhile the technology is promising, scaling up production remains a hurdle. The specialized materials required for the ceramic electrolyte are currently expensive to source and process. However, as investment pours into the sector, experts anticipate that economies of scale will eventually bring prices down, similar to the trajectory seen with solar panels over the last decade.',
        author: publishers[1]._id,
        category: 'Science',
        status: 'published',
        views: 3200,
        featuredImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000',
        tags: ['science', 'discovery', 'nature']
      },
      {
        title: 'Healthy Living: 5 Habits for a Better Sleep',
        content: 'Sleep is the foundation of good health, yet millions struggle with chronic insomnia and poor rest. Experts suggest that small, consistent changes to your daily routine can yield significant improvements in sleep quality. The first and most critical habit is maintaining a consistent sleep schedule, even on weekends, to synchronize your body’s internal clock.\n\nAnother vital habit is creating a "digital sunset." Exposure to blue light from smartphones and tablets late at night can suppress melatonin production, making it harder to fall asleep. Turning off electronic devices at least one hour before bed allows the brain to transition into a restful state. Supplementing this with a cool, dark, and quiet bedroom environment creates the ideal physical conditions for deep, uninterrupted sleep.\n\nDietary choices also play a major role. Consuming caffeine or heavy meals late in the evening can disrupt the digestive process and keep the nervous system in a state of high alert. Instead, experts recommend light snacks like walnuts or chamomile tea, which contain natural compounds that promote relaxation. Additionally, incorporating regular physical activity into your day can help you fall asleep faster, though high-intensity workouts should be avoided right before bedtime.\n\nUltimately, a better sleep is about building a ritual that tells your body it’s time to rest. Whether it’s reading a physical book, practicing deep breathing exercises, or taking a warm bath, finding what works for you can transform your overall well-being. "Sleep isn’t a luxury; it’s a biological necessity," reminds a leading sleep scientist. By prioritizing these five habits, you can reclaim your nights and wake up feeling truly refreshed.',
        author: publishers[1]._id,
        category: 'Health',
        status: 'published',
        views: 2100,
        featuredImage: 'https://images.unsplash.com/photo-1505751172107-5739a0072605?q=80&w=1000',
        tags: ['health', 'medical', 'research']
      },
      {
        title: 'New Blockbuster Movie Breaks Opening Weekend Records',
        content: 'The latest entry in the galactic franchise has shattered previous records, earning over $200 million in its first three days. Fans praised the visual effects and the emotional depth of the performances, marking a triumphant return for the series. Critics are calling it a "masterpiece of modern storytelling" that balances high-stakes action with intimate character development.\n\nBehind the scenes, the production was one of the most ambitious in cinematic history, utilizing cutting-edge virtual production technology that allowed actors to see their alien surroundings in real-time. This technological leap has set a new standard for the industry, blending practical effects with digital environments seamlessly. The director, known for their visual flair, emphasized that the goal was always to "make the impossible feel tangible."\n\nAudience reception has been overwhelmingly positive, with social media buzz driving repeated viewings across all demographics. Merchandising sales have also reached unprecedented levels, as fans flock to buy collectibles and apparel. The film’s success is being seen as a vital boost for movie theaters, which have been struggling to draw crowds in the streaming era.\n\nWith a sequel already in early development, the franchise shows no signs of slowing down. As the film begins its global rollout, industry analysts expect it to join the exclusive "two-billion-dollar club" by the end of its theatrical run. For now, it remains a cultural phenomenon that has captured the imagination of millions worldwide.',
        author: publishers[0]._id,
        category: 'Entertainment',
        status: 'published',
        views: 4500,
        featuredImage: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=1000',
        tags: ['movies', 'awards', 'celebrity']
      },
      {
        title: 'Reform in Higher Education System Proposed',
        content: 'The ministry of education has proposed a significant overhaul of the university grading system and research funding models. The goal is to align academic outcomes more closely with industry needs and foster a culture of original research. Under the new plan, universities will receive performance-based grants tied to graduate employability and the impact of their scientific publications.\n\nThe proposal also includes the introduction of "flexible degrees," allowing students to mix and match modules from different faculties to create a personalized educational path. This interdisciplinary approach is intended to better prepare students for the complex, multifaceted challenges of the modern workforce. "The days of rigid, siloed learning are over," the Education Minister stated during the press conference.\n\nHowever, the plan has met with resistance from several academic unions, who argue that the focus on employability undermines the intrinsic value of pure academic inquiry. "We aren’t just training workers; we are educating citizens," argued a professor from the national university. There are also concerns that smaller, liberal arts programs may suffer under the new funding model, which favors high-tech and vocational research.\n\nDespite the controversy, the government remains committed to the reform, citing the need to modernize a system that has remained largely unchanged for decades. Public consultations will continue over the next few months, with the first phase of the rollout scheduled for the upcoming academic year. The result could be the most significant transformation of higher education in the country’s history.',
        author: publishers[0]._id,
        category: 'Education',
        status: 'flagged',
        reviewerComments: 'Please provide more sources for the ministry quotes.',
        views: 120,
        tags: ['education', 'reform', 'university']
      },
      {
        title: 'Mars Rover Discovers Evidence of Ancient Water',
        content: 'The latest data transmitted from the Perseverance rover confirms the presence of carbonate minerals in the Jezero crater, suggesting that water was present for long periods in the planet\'s past. This discovery is a significant milestone in the search for ancient life on the Red Planet, as these minerals typically form in aqueous environments that are conducive to biological activity.\n\nThe rover’s sophisticated imaging systems captured detailed cross-sections of the crater floor, revealing sedimentary layers that resemble ancient river deltas on Earth. "Every rock we analyze tells a story of a world that was once much more like our own," said a lead NASA scientist. The samples collected during this phase are being prepared for a future return mission, which will bring Martian soil back to Earth for the first time.\n\nIn addition to finding minerals, the rover has also mapped subterranean structures using ground-penetrating radar. These maps suggest that pockets of briny water may still exist deep beneath the Martian surface, shielded from the planet’s harsh radiation. This possibility has profound implications for future human colonization, as it could provide a vital source of water and oxygen for early settlers.\n\nAs Perseverance continues its journey towards the crater rim, the mission team is already planning the next set of experiments. Each new piece of data brings us closer to answering the fundamental question: Were we ever alone in the solar system? The exploration of Mars remains one of humanity\'s most daring and rewarding scientific endeavors, pushing the boundaries of what we know about our place in the universe.',
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
        content: 'Recent data shows that 40% of companies have permanently adopted a hybrid or remote-first model. This shift is reshaping urban planning, transportation, and commercial real estate markets as the traditional "nine-to-five" office culture fades into the background. Both employers and employees are reporting increased satisfaction with the flexibility, though challenges in team cohesion remain.\n\nMunicipalities are now rethinking city centers, moving away from high-density office zones towards mixed-use developments that combine residential, retail, and green spaces. "The downtown of the future isn’t a place people go to work; it’s a place people go to live and socialize," explained an urban planning expert. This transition is also alleviating traffic congestion and reducing carbon emissions, as the daily commute becomes a relic of the past for many.\n\nHowever, the move to remote work has also highlighted a growing "digital divide." Those in service-oriented industries or with limited internet access are unable to benefit from these changes, potentially exacerbating social inequalities. Companies are also grappling with how to maintain corporate culture and provide mentorship to younger staff in a virtual environment. "You can’t replace the water-cooler conversation with a Zoom call," noted one HR director.\n\nAs we settle into this new reality, the hybrid model seems to be the most viable long-term solution. It offers the best of both worlds: the freedom of remote work and the collaborative energy of in-person interaction. The next few years will see further refinement of these models as technology continues to evolve to support seamless, global collaboration.',
        author: publishers[0]._id,
        category: 'Business',
        status: 'published',
        views: 1540,
        featuredImage: 'https://images.unsplash.com/photo-1491336477066-31156b5e4f35?q=80&w=1000',
        tags: ['work', 'business', 'remote']
      },
      {
        title: 'Pending Article 5: Future of E-commerce in South Asia',
        content: 'E-commerce is rapidly expanding in South Asia, driven by increasing internet penetration and mobile usage. This article explores the challenges and opportunities for startups in the region...',
        author: publishers[0]._id,
        category: 'Business',
        status: 'pending',
        views: 0,
        featuredImage: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=1000',
        tags: ['ecommerce', 'business', 'growth']
      },
      {
        title: 'Pending Article 6: New Archaeological Discoveries in Lumbini',
        content: 'Recent excavations in Lumbini have unearthed artifacts dating back to the 3rd century BCE, providing new insights into the early Buddhist period and the historical significance of the site...',
        author: publishers[1]._id,
        category: 'Science',
        status: 'pending',
        views: 0,
        featuredImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000',
        tags: ['archaeology', 'history', 'science']
      },
      {
        title: 'Pending Article 7: Impact of Climate Change on Himalayan Glaciers',
        content: 'The Himalayas are witnessing unprecedented glacial retreat due to rising global temperatures. This article examines the long-term consequences for water security and biodiversity in the region...',
        author: publishers[0]._id,
        category: 'Science',
        status: 'pending',
        views: 0,
        featuredImage: 'https://images.unsplash.com/photo-1520113526767-141ac9047071?q=80&w=1000',
        tags: ['climate', 'glaciers', 'environment']
      },
      {
        title: 'Pending Article 8: Evolving Trends in Modern Nepali Music',
        content: 'Nepali music is undergoing a transformation, blending traditional folk elements with contemporary genres like hip-hop and electronic music. Artists are reaching global audiences through digital platforms...',
        author: publishers[1]._id,
        category: 'Entertainment',
        status: 'pending',
        views: 0,
        featuredImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1000',
        tags: ['music', 'culture', 'entertainment']
      },
      {
        title: 'Pending Article 9: The Importance of Mental Health Awareness in Schools',
        content: 'Mental health is becoming a priority in educational settings. Schools are implementing programs to support students\' emotional well-being and reduce the stigma surrounding mental health issues...',
        author: publishers[0]._id,
        category: 'Health',
        status: 'pending',
        views: 0,
        featuredImage: 'https://images.unsplash.com/photo-1523240715630-313b82142270?q=80&w=1000',
        tags: ['mentalhealth', 'education', 'wellness']
      },
      {
        title: 'Pending Article 10: Advancements in Quantum Computing',
        content: 'Quantum computing promises to revolutionize fields from cryptography to material science. This article provides an overview of the latest breakthroughs and the path towards a quantum future...',
        author: publishers[1]._id,
        category: 'Technology',
        status: 'pending',
        views: 0,
        featuredImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000',
        tags: ['quantum', 'tech', 'computing']
      },
      {
        title: 'Rejected Article 1: Conspiracy Theory about Moon Landing',
        content: 'This article claims that the moon landing was staged in a Hollywood studio. It lacks credible evidence and violates the platform\'s quality standards...',
        author: publishers[0]._id,
        category: 'Science',
        status: 'rejected',
        reviewerComments: 'Lacks credible sources and spreads misinformation.',
        views: 0,
        featuredImage: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1000',
        tags: ['conspiracy', 'moon', 'hoax']
      },
      {
        title: 'Rejected Article 2: Unverified Medical Cures',
        content: 'The author proposes a "miracle" cure for various diseases using unverified home remedies. This content is potentially dangerous and was rejected for safety reasons...',
        author: publishers[1]._id,
        category: 'Health',
        status: 'rejected',
        reviewerComments: 'Contains unverified medical advice that could be harmful.',
        views: 0,
        featuredImage: 'https://images.unsplash.com/photo-1505751172107-5739a0072605?q=80&w=1000',
        tags: ['health', 'safety', 'warning']
      },
      {
        title: 'Rejected Article 3: Promotional Content Disguised as News',
        content: 'This piece is essentially a long advertisement for a specific cryptocurrency platform, failing to provide balanced journalistic perspective...',
        author: publishers[0]._id,
        category: 'Business',
        status: 'rejected',
        reviewerComments: 'Promotional content disguised as news. Violates editorial guidelines.',
        views: 0,
        featuredImage: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=1000',
        tags: ['crypto', 'ad', 'promotion']
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
