
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const isvalidate = (req, res, next) => {
    console.log('Cookies:', req.cookies);

    const accessToken = req.cookies?.accessToken; // Optional chaining for safe access
    console.log("Access Token :", accessToken);

    if (!accessToken) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
    try {
        const decoded = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);
        req.user = { id: decoded.id };
        next();
    } catch (error) {
        res.status(401).json({ message: "Not authorized, token failed" });
    }
};

module.exports = {isvalidate};
