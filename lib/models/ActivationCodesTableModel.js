import { Schema, models, model } from "mongoose";

const ActivationCodesSchema = new Schema({
    Title: { type: String },
    Codes: { type: Object },
});


module.exports = models.ActivationCodes || model("ActivationCodes", ActivationCodesSchema);

