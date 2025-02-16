const {MongoClient} = require('mongodb')

module.exports = new (class {
    constructor() {
        this.client = new MongoClient('mongodb://localhost:27017')
        this.client
            .connect()
            .then(() => {
                console.log('Connected to MongoDB')
            })
            .catch(err => {
                console.error('Connection error:', err)
            })
    }

    async create(data) {
        try {
            const db = this.client.db('chatify')

            const existUser = await db
                .collection('user')
                .findOne({user_name: data.user_name})

            if (existUser) {
                console.log(existUser)
                return {success: false, message: "User already exist"};
            }

            const res = await db.collection('user').insertOne(data)

            return {
                success: true,
                message: 'User registered successfully',
                data: res
            }
        } catch (err) {
            console.error('Database Error:', err)
            return {
                success: false,
                message: err.message
            }
        }
    }

    async findOn(data) {
        try {
            const db = await this.client.db('chatify');
            return await db.collection('user').findOne({user_name: data});
        } catch (err) {
            console.log(err)
            return {
                success: falsem, message: e.message
            }
        }
    }


    async updateOne(id, data) {
        try {
            return this.client.db("chatify").collection("user").updateOne(
                {_id: id}, {$set: data}, (error, res) => {
                    if (err) throw err;
                    db.close();
                    throw err;
                });

        } catch (e) {
            return {
                success: falsem, message: e.message
            }
        }
    }

})()
