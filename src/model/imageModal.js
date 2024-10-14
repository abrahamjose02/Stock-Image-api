const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: { 
        type: String, 
        required: true 
    },
    imageUrl: { 
        type: String, 
        required: true 
    },
    imageKey: { 
        type: String, 
        required: true 
    },
    order: { 
        type: Number, 
        default: 0 
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

const Image = mongoose.model("Image", imageSchema);
module.exports = Image;
