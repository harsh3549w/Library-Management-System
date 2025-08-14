const jwt = require('jsonwebtoken');
module.exports = function authMiddleware(req,res,next)
{
    const token = req.headers['authorization'];
    if(!token) return res.status(401).json({ message: 'Access denied' });
    try{
        const decode = jwt.verify(token, process.env.JWT__SECRET);
        req.user = decode;
        next();
    }
    catch(err)
    {
        return res.status(400).json({ message: 'Invalid token' });
    }
}