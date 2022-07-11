import { Schema, models, model } from "mongoose";

const WaiterSchema = new Schema({
    RestaurantID: { type: String },
    RestaurantName: { type: String },
    Waiters: { type: Object },
    RestoOptions: { type: Object },
    timeZone: { type: String },
    Subscription: {
        status: { type: String },
        expire: { type: Date },
        trialUsed: { type: Boolean }
    },
    RegenCodes: { type: Object }
});


module.exports = models.WaitersSchedules || model("WaitersSchedules", WaiterSchema);

