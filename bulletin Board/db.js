const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('mongodb');

const URL = process.env.MONGODB_CONNECTION;

const AdsCollectionName = 'ads';

let db;
let adsCollection;

const init = () => 
    MongoClient.connect(URL, { useUnifiedTopology: true, useNewUrlParser: true })
        .then((client) => {
            db = client.db(process.env.MONGODB_DBNAME)
            adsCollection = db.collection('madatabase')
        })
        .catch(error => console.log(error));
    
    const getAds = () => {
        return adsCollection.find().toArray();
    }

    const getAd = (id) => {
        return adsCollection.findOne({ _id: new ObjectId(id) });
    }

    const deleteAd = (id) => {
        return adsCollection.deleteOne({ _id: new ObjectId(id) });
    }

    const deleteMany = () => {
        return adsCollection.deleteMany({})
    }

    const addAd = (newAd) => {
        let adToAdd = {};
        adToAdd.title = newAd.title;
        adToAdd.description = newAd.description;
        adToAdd.author = newAd.author;
        adToAdd.category = newAd.category;
        adToAdd.tags = newAd.tags;
        adToAdd.price = newAd.price;
        adToAdd.createdTime = new Date().toString();
        return adsCollection.insertOne(adToAdd);
    }

    const updateAd = (id, modified) => {
        return adsCollection.updateOne
        ({ _id: new ObjectId(id) },
        { $set: {
            "title": (modified.title),
            "description": (modified.description),
            "category": (modified.category),
            "tags": (modified.tags),
            "price": (modified.price),
            }   
        });
    }


module.exports = { init, getAds, getAd, deleteAd, addAd, updateAd, deleteMany }