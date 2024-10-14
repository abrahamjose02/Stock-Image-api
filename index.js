const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const router = require('./src/routes/authRoute');
const connectDB = require('./src/config/db');
const imageRouter = require('./src/routes/imageRoute');

dotenv.config();

const app = express();

connectDB()
    .then(() => console.log('Connected to Database'))
    .catch(err => {
        console.error('Database connection failed:', err);
        process.exit(1);
    });

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100 
});

app.use(limiter);
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true,
}));
app.use(cookieParser());

app.use('/api/auth', router);
app.use('/api/image', imageRouter);

const port = process.env.PORT || 10000;

function logMemoryUsage() {
    const used = process.memoryUsage();
    console.log(`Memory usage: ${Math.round(used.rss / 1024 / 1024 * 100) / 100} MB`);
}

setInterval(logMemoryUsage, 300000); // Log every 5 minutes

app.listen(port, () => {
    console.log(`Server running on PORT: ${port}`);
});
