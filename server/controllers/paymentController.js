const instance = require('../config/razorpay');

const processPayment = async (req, res) => {
    try {
        const options = {
            amount: Number(req.body.amount * 100),
            currency: "INR"
        };

        const booked_ambulance = await instance.orders.create(options);

        res.status(200).json({
            success: true,
            booked_ambulance
        });
    } catch (error) {
        console.error("Payment error:", error);

        res.status(500).json({
            success: false,
            message: "Payment failed",
            error: error?.message || error
        });
    }
};


const getKey = async (req, res) => {
    res.status(200).json({
        key: process.env.RAZORPAY_API_KEY
    });
}

module.exports = { processPayment, getKey };
