import auth from "../../../middleware/auth"
import connectToDb from "../../../lib/db"
import ReceiptTable from "../../../lib/models/ReceiptsModel"
import Resto from '../../../lib/models/RestoModel';
import WaitersSchedules from "../../../lib/models/WaitersSchedules";

const handler = async (req, res) => {
    try {
        const { method } = req;
        if (method !== "POST") {
            return res.status(401).json({ errorMessage: "Only POST is allowed", });
        }
        const reqAuth = req.headers["x-auth-token"];
        if (reqAuth !== process.env.X_AUTH_TOKEN)
            return res.status(401).json({ errorMessage: "Unauthorized" });

        const { action } = req.body

        if (!action || typeof (action) != "string")
            return res.status(400).json({ errorMessage: "Invalid Request" });

        const _id = req.user
        const Subscription = req.Subscription
        if (Subscription == false)
            return res.status(400).json({ errorMessage: "Not available for non premium accounts" });
        if (action == "RestoOptions") {

            const { data } = req.body

            if ((!data) || (typeof (data) != "object"))
                return res.status(400).json({ errorMessage: "Invalid Request" });

            if ((typeof (data.OrderingOnline) != "boolean") || (typeof (data.OrderingWaiter) != "boolean") || (typeof (data.ReceiptPaper) != "boolean") || (typeof (data.ReceiptDigital) != "boolean") || (typeof (data.WaiterRating) != "boolean"))
                return res.status(400).json({ errorMessage: "Invalid Request" });

            if (((!data.OrderingWaiter) && (!data.OrderingOnline)) || ((!data.ReceiptDigital) && (!data.ReceiptPaper)))
                return res.status(400).json({ errorMessage: "Ordering and Receipts shoudl at least have one option enabled" });

            await connectToDb()
            const existingUser = await Resto.findOne({ _id });
            console.log("HERE")
            existingUser.RestoOptions = data
            const saveData = await existingUser.save();

            if (saveData.Email) {
                const existingWaiterTable = await WaitersSchedules.findOne({ RestaurantID: _id })
                existingWaiterTable.RestoOptions = data
                const saveData2 = await existingWaiterTable.save()
                if (saveData2.RestaurantName)
                    res.send('w')
            } else
                throw e

        } else if (action == "RestoReceipts") {
            const { addresses, currency } = req.body

            if ((addresses == undefined) || (currency == undefined) || (typeof (addresses) != "object") || (typeof (currency) != "string"))
                return res.status(400).json({ errorMessage: "Invalid Request" });

            await connectToDb()
            const existingUser = await Resto.findOne({ _id });

            for (let branchs in addresses) {
                if (existingUser.RestoData.RestoBranches[branchs] != undefined)
                    existingUser.RestoData.RestoBranches[branchs].address = addresses[branchs]
            }
            existingUser.RestoData.Currency = currency
            existingUser.markModified('RestoData')

            const saveData = await existingUser.save();
            if (saveData.Email) {
                const existingReceiptTable = await ReceiptTable.findOne({ RestaurantID: _id })

                if (!existingReceiptTable) {
                    const newTable = new ReceiptTable({
                        RestaurantID: _id,
                        RestaurantName: existingUser.RestaurantName,
                        Currency: currency,
                        Addresses: existingUser.RestoData.RestoBranches
                    });

                    const saveReceiptTable = await newTable.save();
                    if (saveReceiptTable.RestaurantID) {
                        res.send("w")
                    } else
                        throw e
                } else {
                    existingReceiptTable.Currency = currency
                    existingReceiptTable.Addresses = existingUser.RestoData.RestoBranches

                    const saveReceiptTable = await existingReceiptTable.save();
                    if (saveReceiptTable.RestaurantID) {
                        res.send("w")
                    } else
                        throw e
                }

            } else
                throw e
        } else if (action == "OnlineMenu") {
            const { items, Currency } = req.body
            if ((items == undefined) || (typeof (items) != "object") || (Currency == undefined) || (typeof (Currency) != "string"))
                return res.status(400).json({ errorMessage: "Invalid Request" });

            await connectToDb()
            const existingUser = await Resto.findOne({ _id });
            const newData = {
                items,
                Currency
            }
            existingUser.OnlineMenu = newData

            const saveData = await existingUser.save();
            if (saveData.Email)
                res.send("w")
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ errorMessage: "Something went Wrong" });
    }

}
export default auth(handler);

