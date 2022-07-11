import { Schema, models, model } from "mongoose";


const ReceiptSchema = new Schema({
    RestaurantID: { type: String },
    RestaurantName: { type: String },
    Currency: { type: String },
    Addresses: { type: Object },
    Receipts: { type: Object },

});


module.exports = models.ReceiptTable || model("ReceiptTable", ReceiptSchema);

