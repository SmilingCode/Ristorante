const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    dishId: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Dish'
        }
    ]
}, {
    timestamps: true
});

const Favorite = mongoose.model('favorite', favoriteSchema);

module.exports = Favorite;
