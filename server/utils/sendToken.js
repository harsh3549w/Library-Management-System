export const sendToken = (user, statusCode, message, res) => {
    try {
        if (!process.env.COOKIE_EXPIRE) {
            throw new Error('Cookie expiration not configured');
        }
        
        const token = user.generateToken();
        
        res.status(statusCode)
           .cookie("token", token, {
               expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
           })
           .json({
               success: true,
               user,
               message,
               token
           });
    } catch (error) {
        console.error('Error in sendToken:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};