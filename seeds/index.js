const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');

mongoose.connect('mongodb://localhost:27017/yelpCamp');

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            author: '633a2ecb9ca5c1b9625eb465',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Dolor a natus ullam aut accusantium magnam quae quia fuga aperiam sequi accusamus debitis atque perferendis, inventore totam. Pariatur nisi asperiores animi.",
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude,
                ]
            },
            image: [
                {
                    url: 'https://res.cloudinary.com/dnpvxrjje/image/upload/v1666183777/YelpCamp/nfvlgaac5wzujnzrxjgg.jpg',
                    filename: 'YelpCamp/nfvlgaac5wzujnzrxjgg',
                  },
                  {
                    url: 'https://res.cloudinary.com/dnpvxrjje/image/upload/v1666183779/YelpCamp/wep2tu35lwzuoth6buro.jpg',
                    filename: 'YelpCamp/wep2tu35lwzuoth6buro',
                  }
            ]
        })
        await camp.save()
    }
}


seedDB().then(() => {
    mongoose.connection.close();
})