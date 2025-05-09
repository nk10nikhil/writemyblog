const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const slugify = require('slugify');
const connectToDatabase = require('./mongodb');

// Import models
const User = require('../models/User');
const Blog = require('../models/Blog');
const Connection = require('../models/Connection');
const Follow = require('../models/Follow');

// Sample data for generating realistic content
const USERS = [
    {
        name: 'Alex Johnson',
        username: 'alexj',
        email: 'alex.johnson@example.com',
        password: 'Password123!',
        bio: 'Full-stack developer passionate about React and Node.js. I write about web development, cloud architecture, and developer productivity.',
        avatar: '/images/placeholder-blog.jpg'
    },
    {
        name: 'Sarah Williams',
        username: 'sarahw',
        email: 'sarah.williams@example.com',
        password: 'Password123!',
        bio: 'UI/UX designer and frontend developer. I love creating beautiful, functional interfaces and writing about design systems.',
        avatar: '/images/placeholder-blog.jpg'
    },
    {
        name: 'Michael Chen',
        username: 'mikec',
        email: 'michael.chen@example.com',
        password: 'Password123!',
        bio: 'Backend developer specializing in microservices and cloud infrastructure. Writing about system design and performance optimization.',
        avatar: '/images/placeholder-blog.jpg'
    },
    {
        name: 'Emily Rodriguez',
        username: 'emilyrod',
        email: 'emily.rodriguez@example.com',
        password: 'Password123!',
        bio: 'DevOps engineer and cloud architect. Sharing insights on CI/CD pipelines, Docker, and Kubernetes.',
        avatar: '/images/placeholder-blog.jpg'
    },
    {
        name: 'David Kim',
        username: 'davidk',
        email: 'david.kim@example.com',
        password: 'Password123!',
        bio: 'Mobile app developer focusing on React Native and Flutter. Writing about cross-platform development strategies.',
        avatar: '/images/placeholder-blog.jpg'
    },
    {
        name: 'Olivia Patel',
        username: 'oliviap',
        email: 'olivia.patel@example.com',
        password: 'Password123!',
        bio: 'Data scientist and machine learning engineer. Sharing practical ML applications and data visualization techniques.',
        avatar: '/images/placeholder-blog.jpg'
    },
    {
        name: 'James Wilson',
        username: 'jamesw',
        email: 'james.wilson@example.com',
        password: 'Password123!',
        bio: 'Security engineer focusing on web application security. Writing about secure coding practices and threat modeling.',
        avatar: '/images/placeholder-blog.jpg'
    }
];

// Blog titles and topics for each user
const BLOG_TEMPLATES = {
    'alexj': [
        { title: 'Building Scalable React Applications', tags: ['react', 'javascript', 'webdev'] },
        { title: 'State Management in 2025: Beyond Redux', tags: ['react', 'state-management', 'javascript'] },
        { title: 'Advanced TypeScript Patterns for React', tags: ['typescript', 'react', 'patterns'] },
        { title: 'Micro-Frontends: Architecture and Implementation', tags: ['architecture', 'frontend', 'micro-frontends'] },
        { title: 'Performance Optimization in Modern Web Apps', tags: ['performance', 'webdev', 'optimization'] },
        { title: 'Server Components vs. Client Components in React', tags: ['react', 'server-components', 'rendering'] },
        { title: 'Building a Full-Stack Blog with Next.js and MongoDB', tags: ['next.js', 'mongodb', 'full-stack'] },
        { title: 'Authentication Strategies for Next.js Applications', tags: ['next.js', 'authentication', 'security'] }
    ],
    'sarahw': [
        { title: 'Creating Effective Design Systems', tags: ['design', 'ui', 'design-systems'] },
        { title: 'Accessible UI Components from Scratch', tags: ['accessibility', 'ui', 'components'] },
        { title: 'The Psychology of Color in Web Design', tags: ['design', 'color-theory', 'ui'] },
        { title: 'From Sketch to Code: Modern Design Workflows', tags: ['design', 'workflow', 'tools'] },
        { title: 'Responsive Design in the Era of Foldable Devices', tags: ['responsive', 'design', 'mobile'] },
        { title: 'Animation Principles for Web Interfaces', tags: ['animation', 'ui', 'interaction'] },
        { title: 'CSS Grid Mastery: Complex Layouts Made Simple', tags: ['css', 'layout', 'grid'] }
    ],
    'mikec': [
        { title: 'Microservices Communication Patterns', tags: ['microservices', 'architecture', 'api'] },
        { title: 'Building Event-Driven Systems with Kafka', tags: ['kafka', 'event-driven', 'architecture'] },
        { title: 'Optimizing Node.js for Production', tags: ['node.js', 'performance', 'backend'] },
        { title: 'GraphQL vs. REST: When to Use Each', tags: ['graphql', 'rest', 'api'] },
        { title: 'Database Sharding Strategies', tags: ['database', 'scaling', 'performance'] },
        { title: 'Implementing CQRS in Modern Applications', tags: ['cqrs', 'architecture', 'patterns'] },
        { title: 'Serverless Architectures: Pros and Cons', tags: ['serverless', 'architecture', 'aws'] },
        { title: 'API Gateway Implementation Strategies', tags: ['api', 'gateway', 'microservices'] }
    ],
    'emilyrod': [
        { title: 'CI/CD Pipeline Best Practices', tags: ['ci-cd', 'devops', 'automation'] },
        { title: 'Kubernetes for Application Developers', tags: ['kubernetes', 'devops', 'containers'] },
        { title: 'Terraform: Infrastructure as Code Explained', tags: ['terraform', 'iac', 'devops'] },
        { title: 'Monitoring Microservices in Production', tags: ['monitoring', 'microservices', 'observability'] },
        { title: 'GitOps Workflow with ArgoCD', tags: ['gitops', 'kubernetes', 'argocd'] },
        { title: 'Automating Security in the CI Pipeline', tags: ['security', 'ci-cd', 'devsecops'] },
        { title: 'Multi-Cloud Deployment Strategies', tags: ['cloud', 'deployment', 'architecture'] }
    ],
    'davidk': [
        { title: 'React Native vs Flutter: A Comparative Analysis', tags: ['react-native', 'flutter', 'mobile'] },
        { title: 'State Management in React Native Applications', tags: ['react-native', 'state-management', 'mobile'] },
        { title: 'Building Offline-First Mobile Apps', tags: ['mobile', 'offline', 'architecture'] },
        { title: 'Mobile App Performance Optimization', tags: ['mobile', 'performance', 'optimization'] },
        { title: 'Cross-Platform Styling Strategies', tags: ['mobile', 'styling', 'cross-platform'] },
        { title: 'Native Modules in React Native', tags: ['react-native', 'native-modules', 'integration'] },
        { title: 'Testing Strategies for Mobile Applications', tags: ['testing', 'mobile', 'quality'] },
        { title: 'Push Notification Implementation Across Platforms', tags: ['push-notifications', 'mobile', 'integration'] }
    ],
    'oliviap': [
        { title: 'Practical Machine Learning for Developers', tags: ['machine-learning', 'practical', 'tutorial'] },
        { title: 'Data Visualization Techniques with D3.js', tags: ['data-viz', 'd3js', 'javascript'] },
        { title: 'Natural Language Processing for Sentiment Analysis', tags: ['nlp', 'machine-learning', 'text-analysis'] },
        { title: 'Building Recommendation Systems from Scratch', tags: ['recommendation', 'machine-learning', 'algorithms'] },
        { title: 'Time Series Forecasting for Business Applications', tags: ['time-series', 'forecasting', 'data-science'] },
        { title: 'Feature Engineering Best Practices', tags: ['feature-engineering', 'machine-learning', 'data-science'] },
        { title: 'Model Deployment Strategies for Production', tags: ['mlops', 'deployment', 'production'] }
    ],
    'jamesw': [
        { title: 'Web Security: OWASP Top 10 Explained', tags: ['security', 'owasp', 'web'] },
        { title: 'Implementing JWT Authentication Securely', tags: ['jwt', 'authentication', 'security'] },
        { title: 'CSRF Protection in Modern Web Applications', tags: ['csrf', 'security', 'web'] },
        { title: 'Secure Coding Practices for JavaScript', tags: ['security', 'javascript', 'coding'] },
        { title: 'OAuth 2.0 and OpenID Connect Implementation', tags: ['oauth', 'security', 'authentication'] },
        { title: 'Content Security Policy Deep Dive', tags: ['csp', 'security', 'web'] },
        { title: 'Security Headers Every Web App Should Use', tags: ['security', 'headers', 'web'] },
        { title: 'Threat Modeling for Web Applications', tags: ['threat-modeling', 'security', 'risk'] }
    ]
};

// Blog content templates with placeholder text
const BLOG_CONTENT_TEMPLATES = [
    `<h2>Introduction</h2>
  <p>In today's rapidly evolving tech landscape, understanding {topic} has become essential for developers looking to build robust applications. This blog post will explore key concepts, best practices, and implementation strategies.</p>
  
  <h2>Understanding the Fundamentals</h2>
  <p>Before diving into advanced topics, let's clarify what {topic} means in practical terms. At its core, {topic} is about {description}. This approach offers several advantages:</p>
  <ul>
    <li>Improved maintainability and organization</li>
    <li>Better performance and scalability</li>
    <li>Enhanced developer experience and productivity</li>
    <li>Stronger security and reliability</li>
  </ul>
  
  <h2>Implementation Strategies</h2>
  <p>When implementing {topic} in your projects, consider these strategies:</p>
  <h3>1. Start with a Clear Architecture</h3>
  <p>Define your approach before writing code. This means understanding the problem domain and designing a solution that addresses the specific requirements of your application.</p>
  <h3>2. Use the Right Tools</h3>
  <p>Select appropriate libraries and frameworks that support {topic} concepts. The ecosystem offers many options, but choose ones that align with your project goals.</p>
  <h3>3. Test Thoroughly</h3>
  <p>Implement comprehensive testing to validate your implementation. This includes unit tests, integration tests, and end-to-end tests.</p>
  
  <h2>Best Practices</h2>
  <p>Based on industry experience, here are some best practices when working with {topic}:</p>
  <ul>
    <li>Keep components small and focused on a single responsibility</li>
    <li>Document your architecture and important decisions</li>
    <li>Review and refactor regularly to maintain code quality</li>
    <li>Stay updated with the latest trends and improvements in the {topic} space</li>
  </ul>
  
  <h2>Conclusion</h2>
  <p>Implementing {topic} effectively can significantly improve your development workflow and application quality. By following the strategies and best practices outlined in this article, you'll be well-equipped to leverage {topic} in your next project.</p>`,

    `<h2>Why {topic} Matters</h2>
  <p>In the modern development landscape, {topic} has emerged as a critical approach for building resilient, maintainable applications. This post explores why it matters and how to implement it effectively.</p>
  
  <h2>The Evolution of {topic}</h2>
  <p>The concept of {topic} has evolved significantly over the past few years. Initially, developers approached it as {description}, but modern understanding has expanded to encompass broader concerns:</p>
  <ul>
    <li>Scalability across large teams and codebases</li>
    <li>Integration with complementary technologies</li>
    <li>Performance optimization in various contexts</li>
    <li>Accessibility and inclusive design principles</li>
  </ul>
  
  <h2>Core Principles</h2>
  <p>Successful implementation of {topic} relies on several core principles:</p>
  <h3>Separation of Concerns</h3>
  <p>Each component or module should have a single, well-defined responsibility. This makes your code easier to understand, test, and maintain.</p>
  <h3>Predictable Data Flow</h3>
  <p>Data should flow through your application in a consistent, traceable manner. This reduces bugs and makes debugging simpler.</p>
  <h3>Composability</h3>
  <p>Building small, reusable pieces that can be combined to create complex functionality enables greater flexibility and code reuse.</p>
  
  <h2>Common Pitfalls</h2>
  <p>When implementing {topic}, watch out for these common mistakes:</p>
  <ul>
    <li>Over-engineering simple problems with complex solutions</li>
    <li>Premature optimization before understanding performance bottlenecks</li>
    <li>Neglecting documentation and knowledge sharing</li>
    <li>Inconsistent patterns across the codebase</li>
  </ul>
  
  <h2>Looking Forward</h2>
  <p>The future of {topic} looks promising, with new tools and approaches emerging regularly. Stay engaged with the community, participate in discussions, and keep learning to stay at the forefront of this exciting field.</p>`,

    `<h2>A Deep Dive into {topic}</h2>
  <p>Understanding {topic} at a fundamental level is essential for modern development. This comprehensive guide will take you from basic concepts to advanced implementation strategies.</p>
  
  <h2>The Foundations</h2>
  <p>{topic} is built on several key concepts that work together to provide a robust framework for application development:</p>
  <h3>Core Concept 1: Modularity</h3>
  <p>Breaking down complex systems into smaller, manageable parts is essential for maintainability and scalability.</p>
  <h3>Core Concept 2: Encapsulation</h3>
  <p>Hiding implementation details and exposing only necessary interfaces reduces coupling and makes systems more robust.</p>
  <h3>Core Concept 3: Composition</h3>
  <p>Building complex functionality by combining simpler parts provides flexibility and promotes code reuse.</p>
  
  <h2>Practical Implementation</h2>
  <p>Let's explore how to implement {topic} in real-world scenarios:</p>
  <h3>Setting Up Your Environment</h3>
  <p>Start with the right tools and configurations to support {topic} in your project. This includes selecting appropriate libraries, setting up your build pipeline, and configuring development tools.</p>
  <h3>Building Your First Component</h3>
  <p>Begin with a simple implementation that demonstrates the core principles. Focus on clarity and correctness before optimizing for performance or adding complex features.</p>
  <h3>Scaling to Complex Systems</h3>
  <p>As your application grows, apply {topic} principles consistently to maintain quality and performance. This may involve refactoring existing code and establishing team guidelines.</p>
  
  <h2>Advanced Techniques</h2>
  <p>Once you've mastered the basics, consider these advanced approaches:</p>
  <ul>
    <li>Implementing lazy loading and code splitting for better performance</li>
    <li>Leveraging modern patterns like render props and hooks (in frontend contexts)</li>
    <li>Integrating with complementary technologies to extend functionality</li>
    <li>Building custom tooling to enhance developer experience</li>
  </ul>
  
  <h2>Conclusion</h2>
  <p>{topic} represents a powerful approach to software development that can transform how you build and maintain applications. By mastering these principles and techniques, you'll be well-equipped to tackle complex development challenges with confidence and elegance.</p>`
];

// Privacy options with weighted distribution
const PRIVACY_OPTIONS = [
    'public', 'public', 'public', 'public', // 50% chance for public
    'followers', 'followers', // 25% chance for followers
    'connections', // 12.5% chance for connections
    'private' // 12.5% chance for private
];

// Function to get a random item from an array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Function to get a random number between min and max (inclusive)
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// Function to generate blog content
const generateBlogContent = (title, username) => {
    const contentTemplate = getRandomItem(BLOG_CONTENT_TEMPLATES);
    const topic = title.split(':')[0].trim();
    const description = `a key approach to ${topic.toLowerCase()} that emphasizes clarity, maintainability, and scalability`;

    return contentTemplate
        .replace(/{topic}/g, topic)
        .replace(/{description}/g, description);
};

// Main seed function
async function seed() {
    console.log('🌱 Starting database seeding...');

    try {
        // Connect to database
        await connectToDatabase();

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Blog.deleteMany({});
        await Connection.deleteMany({});
        await Follow.deleteMany({});

        console.log('Creating users...');
        // Create users
        const createdUsers = [];
        for (const userData of USERS) {
            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Create user
            const user = new User({
                ...userData,
                password: hashedPassword
            });

            await user.save();
            createdUsers.push(user);
            console.log(`Created user: ${user.name} (${user.username})`);
        }

        console.log('Creating blogs...');
        // Create blogs for each user
        for (const user of createdUsers) {
            const blogTemplates = BLOG_TEMPLATES[user.username];
            const numBlogs = getRandomInt(6, 8); // Random number between 6-8 blogs per user

            for (let i = 0; i < numBlogs; i++) {
                const blogTemplate = blogTemplates[i % blogTemplates.length]; // Cycle through templates if we need more
                const title = blogTemplate.title;
                const content = generateBlogContent(title, user.username);
                const privacy = getRandomItem(PRIVACY_OPTIONS);

                const blog = new Blog({
                    title,
                    content,
                    author: user._id,
                    tags: blogTemplate.tags,
                    privacy,
                    // The slug will be auto-generated by the pre-save hook
                    viewCount: getRandomInt(10, 500),
                    createdAt: new Date(Date.now() - getRandomInt(1, 60) * 24 * 60 * 60 * 1000), // Random date in the last 60 days
                });

                await blog.save();
                console.log(`Created blog: "${title}" by ${user.username}`);
            }
        }

        console.log('Creating connections and followers...');
        // Create connections between users (not everyone is connected to everyone)
        for (let i = 0; i < createdUsers.length; i++) {
            const user = createdUsers[i];

            // Each user follows 3-5 random other users
            const numFollowing = getRandomInt(3, 5);
            const followingIndices = new Set();

            while (followingIndices.size < numFollowing) {
                const randomIndex = getRandomInt(0, createdUsers.length - 1);
                if (randomIndex !== i) { // Don't follow yourself
                    followingIndices.add(randomIndex);
                }
            }

            for (const followingIndex of followingIndices) {
                const followingUser = createdUsers[followingIndex];

                // Create follow relationship
                const follow = new Follow({
                    follower: user._id,
                    following: followingUser._id
                });

                await follow.save();
                console.log(`${user.username} is now following ${followingUser.username}`);

                // About 70% of follows also become connections
                if (Math.random() < 0.7) {
                    const connection = new Connection({
                        requester: user._id,
                        recipient: followingUser._id,
                        status: 'accepted'
                    });

                    await connection.save();
                    console.log(`${user.username} is now connected with ${followingUser.username}`);
                }
            }
        }

        console.log('✅ Seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error during seeding:', error);
    } finally {
        // Close the database connection
        mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Export the seed function
module.exports = { seed };