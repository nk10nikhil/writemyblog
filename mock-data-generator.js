const bcrypt = require('bcryptjs');
const slugify = require('slugify');
const fs = require('fs');

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

// Blog content template (shortened for mock version)
const BLOG_CONTENT_TEMPLATE = `<h2>Introduction</h2>
<p>In today's rapidly evolving tech landscape, understanding {topic} has become essential for developers looking to build robust applications. This blog post will explore key concepts, best practices, and implementation strategies.</p>

<h2>Understanding the Fundamentals</h2>
<p>Before diving into advanced topics, let's clarify what {topic} means in practical terms. At its core, {topic} is about {description}. This approach offers several advantages:</p>
<ul>
  <li>Improved maintainability and organization</li>
  <li>Better performance and scalability</li>
  <li>Enhanced developer experience and productivity</li>
  <li>Stronger security and reliability</li>
</ul>

<h2>Conclusion</h2>
<p>Implementing {topic} effectively can significantly improve your development workflow and application quality. By following the strategies and best practices outlined in this article, you'll be well-equipped to leverage {topic} in your next project.</p>`;

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
const generateBlogContent = (title) => {
    const topic = title.split(':')[0].trim();
    const description = `a key approach to ${topic.toLowerCase()} that emphasizes clarity, maintainability, and scalability`;

    return BLOG_CONTENT_TEMPLATE
        .replace(/{topic}/g, topic)
        .replace(/{description}/g, description);
};

// Function to generate an ID
const generateId = () => Math.random().toString(36).substring(2, 15);

// Generate mock users with hashed passwords
async function generateUsers() {
    const users = [];

    for (const userData of USERS) {
        // Simulate hashed password
        const hashedPassword = await bcrypt.hash(userData.password, 10);

        // Create user with ID
        const user = {
            _id: generateId(),
            ...userData,
            password: hashedPassword,
            createdAt: new Date(Date.now() - getRandomInt(1, 90) * 24 * 60 * 60 * 1000),
            updatedAt: new Date()
        };

        users.push(user);
        console.log(`Generated user: ${user.name} (${user.username})`);
    }

    return users;
}

// Generate mock blogs for users
function generateBlogs(users) {
    const blogs = [];

    for (const user of users) {
        const blogTemplates = BLOG_TEMPLATES[user.username];
        const numBlogs = getRandomInt(6, 8); // Random number between 6-8 blogs per user

        for (let i = 0; i < numBlogs; i++) {
            const blogTemplate = blogTemplates[i % blogTemplates.length];
            const title = blogTemplate.title;
            const content = generateBlogContent(title);
            const privacy = getRandomItem(PRIVACY_OPTIONS);

            const blog = {
                _id: generateId(),
                title,
                content,
                author: user._id,
                authorDetails: {
                    _id: user._id,
                    name: user.name,
                    username: user.username,
                    avatar: user.avatar
                },
                tags: blogTemplate.tags,
                privacy,
                slug: slugify(title, { lower: true, strict: true }),
                viewCount: getRandomInt(10, 500),
                likes: [],
                featured: Math.random() < 0.2, // 20% chance to be featured
                createdAt: new Date(Date.now() - getRandomInt(1, 60) * 24 * 60 * 60 * 1000),
                updatedAt: new Date(Date.now() - getRandomInt(0, 30) * 24 * 60 * 60 * 1000)
            };

            blogs.push(blog);
            console.log(`Generated blog: "${title}" by ${user.username}`);
        }
    }

    return blogs;
}

// Generate mock follows and connections
function generateRelationships(users) {
    const follows = [];
    const connections = [];

    for (let i = 0; i < users.length; i++) {
        const user = users[i];

        // Each user follows 3-5 random other users
        const numFollowing = getRandomInt(3, 5);
        const followingIndices = new Set();

        while (followingIndices.size < numFollowing) {
            const randomIndex = getRandomInt(0, users.length - 1);
            if (randomIndex !== i) { // Don't follow yourself
                followingIndices.add(randomIndex);
            }
        }

        for (const followingIndex of followingIndices) {
            const followingUser = users[followingIndex];

            // Create follow relationship
            const follow = {
                _id: generateId(),
                follower: user._id,
                following: followingUser._id,
                createdAt: new Date(Date.now() - getRandomInt(1, 30) * 24 * 60 * 60 * 1000)
            };

            follows.push(follow);
            console.log(`${user.username} is now following ${followingUser.username}`);

            // About 70% of follows also become connections
            if (Math.random() < 0.7) {
                const connection = {
                    _id: generateId(),
                    requester: user._id,
                    recipient: followingUser._id,
                    status: 'accepted',
                    createdAt: new Date(Date.now() - getRandomInt(1, 30) * 24 * 60 * 60 * 1000)
                };

                connections.push(connection);
                console.log(`${user.username} is now connected with ${followingUser.username}`);
            }
        }
    }

    return { follows, connections };
}

// Main function to generate all mock data
async function generateMockData() {
    console.log('🌱 Generating mock data...');

    try {
        // Generate users
        console.log('\nGenerating users...');
        const users = await generateUsers();

        // Generate blogs
        console.log('\nGenerating blogs...');
        const blogs = generateBlogs(users);

        // Generate relationships
        console.log('\nGenerating follows and connections...');
        const { follows, connections } = generateRelationships(users);

        // Compile all data
        const mockData = {
            users: users.map(u => {
                const { password, ...userWithoutPassword } = u;
                return userWithoutPassword;
            }), // Remove password from output
            blogs,
            follows,
            connections,
            summary: {
                totalUsers: users.length,
                totalBlogs: blogs.length,
                totalFollows: follows.length,
                totalConnections: connections.length,
                averageBlogsPerUser: (blogs.length / users.length).toFixed(2),
                averageFollowsPerUser: (follows.length / users.length).toFixed(2),
                averageConnectionsPerUser: (connections.length / users.length).toFixed(2)
            }
        };

        // Save to JSON file
        fs.writeFileSync('mock-data-summary.json', JSON.stringify(mockData.summary, null, 2));
        console.log('\n✅ Mock data generation completed!');
        console.log('\nGenerated data summary saved to mock-data-summary.json');

        console.log('\nYou can now log in with any of these users (in a production environment):');
        console.log('Username: alexj | Password: Password123!');
        console.log('Username: sarahw | Password: Password123!');
        console.log('Username: mikec | Password: Password123!');
        console.log('Username: emilyrod | Password: Password123!');
        console.log('Username: davidk | Password: Password123!');
        console.log('Username: oliviap | Password: Password123!');
        console.log('Username: jamesw | Password: Password123!');

        // Output a detailed example of one user and their blogs
        const sampleUser = users[0];
        const sampleUserBlogs = blogs.filter(blog => blog.author === sampleUser._id);
        const sampleUserFollowing = follows.filter(follow => follow.follower === sampleUser._id);
        const sampleUserConnections = connections.filter(conn =>
            conn.requester === sampleUser._id || conn.recipient === sampleUser._id
        );

        console.log('\n📝 Sample User Detail:');
        console.log(`Name: ${sampleUser.name}`);
        console.log(`Username: ${sampleUser.username}`);
        console.log(`Bio: ${sampleUser.bio}`);
        console.log(`Blogs: ${sampleUserBlogs.length}`);
        console.log(`Following: ${sampleUserFollowing.length}`);
        console.log(`Connections: ${sampleUserConnections.length}`);

        console.log('\n📚 Sample Blog Titles:');
        sampleUserBlogs.forEach((blog, index) => {
            console.log(`${index + 1}. ${blog.title} (${blog.privacy})`);
        });

    } catch (error) {
        console.error('❌ Error during mock data generation:', error);
    }
}

// Run the function
generateMockData();