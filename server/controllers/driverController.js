const driverModel = require('../models/driverModel');
const driverService = require('../services/driver.service');
const blackListTokenModel = require('../models/blackListTokenModel');
const { validationResult } = require('express-validator');


module.exports.registerDriver = async (req, res, next) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { fullname, email, password, vehicle } = req.body;

    const isDriverAlreadyExist = await driverModel.findOne({ email });

    if (isDriverAlreadyExist) {
        return res.status(400).json({ message: 'driver already exist' });
    }


    const hashedPassword = await driverModel.hashPassword(password);

    const driver = await driverService.createCaptain({
        firstname: fullname.firstname,
        lastname: fullname.lastname,
        email,
        password: hashedPassword,
        color: vehicle.color,
        plate: vehicle.plate,
        capacity: vehicle.capacity,
        vehicleType: vehicle.vehicleType
    });

    const token = driver.generateAuthToken();

    res.status(201).json({ token, driver });

}

module.exports.loginCaptain = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const driver = await driverModel.findOne({ email }).select('+password');

    if (!driver) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await driver.comparePassword(password);

    if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = driver.generateAuthToken();

    res.cookie('token', token);

    res.status(200).json({ token, driver });
}

module.exports.getDriverProfile = async (req, res, next) => {
    res.status(200).json({ driver: req.driver });
}

module.exports.logoutDriver = async (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(' ')[ 1 ];

    await blackListTokenModel.create({ token });

    res.clearCookie('token');

    res.status(200).json({ message: 'Logout successfully' });
}