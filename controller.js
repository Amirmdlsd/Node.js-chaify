const bcrypt = require('bcrypt')
const {registerValidator, loginValidator} = require('./validator')
const DB = require('./db');
const {response} = require("express");
const jwt = require("jsonwebtoken")

module.exports = new (class {
    async register(req, res) {
        const {error, data} = registerValidator.validate(req.body);
        if (error) return res.status(400).send({error})
        const {user_name, full_name} = req.body;
        const salt = await bcrypt.genSalt(10)
        const password = await bcrypt.hash(req.body.password, salt);
        console.log(data)

        const result = await DB.create({user_name, full_name, password})
        const token = await jwt.sign({_id: result._id, user_name},
            "*this-is-secret-key*")
        await DB.updateOne(result._id, {token})
        if (!result.success) {
            return res.status(400).json({
                result
            })
        }

        return res.status(200).json({
            success: true, result: result, token
        })
    }

    async login(req, res) {
        const {user_name, password} = req.body;
        const {error, val} = loginValidator.validate(req.body);
        if (error) return res.status(400).json({error: error.message})

        const data = await DB.findOn(user_name);
        if (data === null) {
            return response.status(400).json({error: "User does not exist"})
        }
        const matchPass = await bcrypt.compare(password, data.password)
        console.log(matchPass)
        if (!matchPass) {
            return response.status(400).json({error: "User does not exist"})
        }
        const token = await jwt.sign({_id: data.id, user_name}, "*this-is-secret-key*")
        await DB.findOn(data._id, {token})
        return res.status(200).json({
            success: true, message: 'User login successfully', token
        })
    }

})()