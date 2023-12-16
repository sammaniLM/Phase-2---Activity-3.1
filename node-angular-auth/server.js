const http = require('http');
const url = require('url');
const { parse } = require('querystring');

const users = [
    { id: 1, username: 'user1', password: 'password1', role: 'user' },
];

const tokens = {};

const posts = [
    { id: 1, userId: 1, title: 'Post 1', content: 'Content of post 1' },
];

const server = http.createServer((req, res) => {
    const { pathname, query } = url.parse(req.url);

    const token = req.headers.authorization;

    if (!token || !tokens[token]) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Unauthorized' }));
        return;
    }

    const userId = tokens[token].userId;

    if (pathname === '/login' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const { username, password } = parse(body);
            const user = users.find((u) => u.username === username && u.password === password);

            if (user) {
                const token = Math.random().toString(36).substring(2); // Generate a random token
                tokens[token] = { userId: user.id, role: user.role };
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ user: { id: user.id, username: user.username, role: user.role }, token }));
            } else {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid username or password' }));
            }
        });
    } else if (pathname === '/posts' && req.method === 'GET') {
        const userPosts = posts.filter((post) => post.userId === userId);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(userPosts));
    } else if (pathname === '/posts' && req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            const { title, content } = parse(body);
            const newPost = { id: posts.length + 1, userId, title, content };
            posts.push(newPost);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newPost));
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
