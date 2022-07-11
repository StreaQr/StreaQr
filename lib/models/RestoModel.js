import { Schema, models, model } from "mongoose";

const RestoSchema = new Schema({
    RestaurantName: { type: String },
    Email: { type: String },
    PasswordHash: { type: String },
    RestoData: {
        OwnerName: { type: String },
        Location: { type: String },
        PhoneNumber: { type: String },
        RestoBranches: { type: Object },
        Waiters: { type: Number },
        Currency: { type: String },
        Tables: { type: Number }
    },
    OnlineMenu: {
        items: { type: Array },
        Currency: { type: String }
    },
    RestoOptions: { type: Object },
    UniqueID: { type: String },
    Codehash: { type: String },
    CodeDate: { type: Object },
    Country: { type: String },
    Menu: { type: Object },
    Temp: { type: String },
    timeZone: { type: String },
    Subscription: {
        status: { type: String },
        expire: { type: Date },
        trialUsed: { type: Boolean }
    }
});


module.exports = models.resto || model("resto", RestoSchema);