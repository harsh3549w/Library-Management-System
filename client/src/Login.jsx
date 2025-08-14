import { useState } from 'react';
import axios from 'axios';
import './Login.css';

function Login() {
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [showOtpSection, setShowOtpSection] = useState(false);
    const [showPasswordChange, setShowPasswordChange] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [userId, setUserId] = useState(null);
    const [loading, setLoading] = useState(false);

    const submitForm = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/api/login', {
                Username: name,
                Password: password
            });

            if (response.data.requiresOTP) {
                setUserId(response.data.userId);
                setShowOtpSection(true);
            } else {
                localStorage.setItem('token', response.data.token);
                window.location.href = '/dashboard'; // Redirect to library dashboard
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'An error occurred during Login');
        } finally {
            setLoading(false);
        }
    };

    const requestOTP = async () => {
        setLoading(true);
        try {
            await axios.post('http://localhost:3000/api/generate-otp', { userId });
            alert('OTP has been sent to your email');
            setShowPasswordChange(true);
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/api/change-password', {
                userId,
                otp,
                newPassword
            });

            localStorage.setItem('token', response.data.token);
            alert('Password changed successfully');
            window.location.href = '/dashboard'; // Redirect to library dashboard
        } catch (error) {
            console.error('Error:', error);
            alert(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Library Management System</h2>
            
            {!showOtpSection ? (
                // Initial Login Form
                <form onSubmit={submitForm}>
                    <div className="form-group">
                        <input
                            placeholder="Roll Number"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            placeholder="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                            First time users: Use roll_no@lib as password
                        </small>
                    </div>
                    <button type="submit" disabled={loading}>
                        {loading ? 'Loading...' : 'Login'}
                    </button>
                </form>
            ) : (
                // OTP and Password Change Section
                <div>
                    {!showPasswordChange ? (
                        <button onClick={requestOTP} disabled={loading}>
                            {loading ? 'Sending...' : 'Get OTP'}
                        </button>
                    ) : (
                        <form onSubmit={handlePasswordChange}>
                            <div className="form-group">
                                <input
                                    placeholder="Enter OTP"
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    placeholder="New Password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    placeholder="Confirm New Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button type="submit" disabled={loading}>
                                {loading ? 'Changing Password...' : 'Change Password'}
                            </button>
                        </form>
                    )}
                </div>
            )}
        </div>
    );
}
export default Login;