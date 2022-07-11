import { Schema, models, model } from "mongoose";

const WaiterSchema = new Schema({
    RestaurantID: { type: String },
    RestaurantName: { type: String },
    UserName: { type: String },
    PasswordHash: { type: String },
    uniqueID: { type: String },
    Ratings: { type: Object }, //feedback //averageRatings
    Data: {
        Branch: { type: Number },
        schedule: { type: Object },
        Tables: { type: Number }
    },
    PushToken: { type: String },
    Notifications: { type: Array }

});


module.exports = models.WaiterTable || model("WaiterTable", WaiterSchema);

