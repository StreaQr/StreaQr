import { Expo } from 'expo-server-sdk';
import QrCodeValidator from "../../../middleware/QrCodeValidator"
import WaiterNotifications from "../../../lib/helpers/WaiterNotifications"
import ReceiptTable from "../../../lib/models/ReceiptsModel"
import WaiterTable from "../../../lib/models/WaiterModel"

const handler = async (req, res) => {

    try {
        const { method } = req;
        if (method !== "POST") {
            return res.status(400).json({ errorMessage: "Only POST is allowed", });
        } else {

            const Waiter = req.Waiter
            const Table = req.Table
            const Code = req.Code
            const { action } = req.body

            if ((!action) || (typeof (action) != "string")) {
                return res.status(400).json({ errorMessage: "invalid request" });
            } else {
                let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
                let messages = [];
                const PushToken = Waiter.PushToken
                if (action === "order") {
                    try {
                        if (Expo.isExpoPushToken(PushToken)) {
                            messages.push({
                                to: PushToken,
                                sound: 'default',
                                title: `Table ${Table} is ready to order`,
                                body: ``,
                            })

                            let sendNoti = await expo.sendPushNotificationsAsync(messages);
                            if ((sendNoti[0] != undefined) && (sendNoti[0].status == "ok")) {
                                const date = new Date()
                                const saveData = await WaiterNotifications(Waiter.ID, `Order_${date}_Table ${Table} is ready to order`)
                                if (!saveData)
                                    return res.status(400).json({ errorMessage: "Could not save order" })
                                res.send("w")
                            }
                            else
                                throw e
                        }
                    } catch (e) {
                        return res.status(400).json({ errorMessage: "Notification was not sent please try again" })
                    }
                } else if (action == "orderOnline") {
                    try {
                        const { orders } = req.body
                        if ((orders == undefined) || (typeof (orders) != "object"))
                            return res.status(400).json({ errorMessage: "Invalid request" })

                        if (Expo.isExpoPushToken(PushToken)) {
                            messages.push({
                                to: PushToken,
                                sound: 'default',
                                title: `Table ${Table} has ordered`,
                                body: `tap to view`,
                            })

                            let sendNoti = await expo.sendPushNotificationsAsync(messages);

                            if ((sendNoti[0] != undefined) && (sendNoti[0].status == "ok")) {
                                const date = new Date()
                                const saveData = await WaiterNotifications(Waiter.ID, { "Message": `OrderOnline_${date}_Table ${Table} online order_${Code}`, "orders": orders })
                                if (!saveData)
                                    return res.status(400).json({ errorMessage: "Could not save order" })
                                res.send("w")
                            }
                            else
                                throw e
                        }
                    } catch (e) {
                        return res.status(400).json({ errorMessage: "Notification was not sent please try again" })
                    }
                } else if (action === "callWaiter") {
                    try {
                        if (Expo.isExpoPushToken(PushToken)) {
                            messages.push({
                                to: PushToken,
                                sound: 'default',
                                title: `Table ${Table} is calling you`,
                                body: ``,

                            })
                            let sendNoti = await expo.sendPushNotificationsAsync(messages);
                            if ((sendNoti[0] != undefined) && (sendNoti[0].status == "ok")) {
                                const date = new Date()
                                const saveData = await WaiterNotifications(Waiter.ID, `Call_${date}_Table ${Table} is calling you`)
                                if (!saveData)
                                    return res.status(400).json({ errorMessage: "Could not save order" })
                                res.send("w")

                            }
                            else
                                throw e
                        }
                    } catch (e) {
                        return res.status(400).json({ errorMessage: "Notification was not sent please try again" })
                    }

                } else if (action === "Receipt") {
                    const { ReceiptType } = req.body
                    if ((!ReceiptType) || (typeof (ReceiptType) != "object")) {
                        return res.status(400).json({ errorMessage: "invalid request" });
                    } else {
                        let title = `Table ${Table} requests:`
                        if (ReceiptType.DigitalReceipt === true) {
                            title += " DigitalReceipt"
                            if (ReceiptType.PaperReceipt)
                                title += ", PaperReceipt"
                        } else if (ReceiptType.PaperReceipt) {
                            title += " PaperReceipt"
                        }
                        if (ReceiptType.DigitalReceipt) {
                            const { RestaurantName } = req.body
                            const existingReceiptTable = await ReceiptTable.findOne({ RestaurantName })

                            if ((existingReceiptTable.Receipts != undefined) && (existingReceiptTable.Receipts[`${Code}`] != undefined)) {
                                return res.status(400).json({ errorMessage: "Your Receipt has already been uploaded. Download it using the button on the bottom left" })
                            }
                        }
                        try {
                            if (Expo.isExpoPushToken(PushToken)) {
                                messages.push({
                                    to: PushToken,
                                    sound: 'default',
                                    title,
                                    body: ``,

                                })
                                let sendNoti = await expo.sendPushNotificationsAsync(messages);
                                if ((sendNoti[0] != undefined) && (sendNoti[0].status == "ok")) {
                                    const date = new Date()
                                    let notificationMessage = `Receipt_${date}_${title}_${Code}`
                                    if (ReceiptType.DigitalReceipt) {
                                        const { NotificationID } = req.body
                                        if ((NotificationID != undefined) && (typeof (NotificationID) == "string"))
                                            notificationMessage = `OnlineReceipt_${date}_${title}_${Code}_${NotificationID}`
                                        else
                                            notificationMessage = `OnlineReceipt_${date}_${title}_${Code}`
                                    }
                                    const saveData = await WaiterNotifications(Waiter.ID, notificationMessage)
                                    if (!saveData)
                                        return res.status(400).json({ errorMessage: "Could not save order" })
                                    res.send("w")

                                }
                                else
                                    throw e
                            }
                        } catch (e) {
                            return res.status(400).json({ errorMessage: "Notification was not sent please try again" })
                        }
                    }
                } else if (action === "Rating") {
                    const { Rating, userName, feedBack } = req.body
                    if ((!Rating) || (typeof (Rating) != "number") || (!userName) || (typeof (userName) != "string") || (feedBack == undefined) || (typeof (feedBack) != "string")) {
                        return res.status(400).json({ errorMessage: "invalid request" });
                    } else {
                        const existingWaiterTable = await WaiterTable.findOne({ _id: Waiter.ID })
                        if (!existingWaiterTable.Ratings)
                            existingWaiterTable.Ratings = {}
                        const date = new Date();
                        const shortMonth = date.toLocaleString('en-us', { month: 'short' }); /* Jun */
                        if (!existingWaiterTable.Ratings.averageRatings)
                            existingWaiterTable.Ratings.averageRatings = {}

                        if (existingWaiterTable.Ratings.averageRatings[`${shortMonth}`] == undefined) {
                            existingWaiterTable.Ratings.averageRatings[`${shortMonth}`] = []
                            existingWaiterTable.Ratings.averageRatings[`${shortMonth}`][0] = Rating
                        } else
                            existingWaiterTable.Ratings.averageRatings[`${shortMonth}`][existingWaiterTable.Ratings.averageRatings[`${shortMonth}`].length] = Rating

                        if (existingWaiterTable.Ratings.feedBack == undefined) {
                            existingWaiterTable.Ratings.feedBack = []
                            existingWaiterTable.Ratings.feedBack[0] = `${userName}_${Rating}_${feedBack}`
                        } else if (existingWaiterTable.Ratings.feedBack.length < 3)
                            existingWaiterTable.Ratings.feedBack[existingWaiterTable.Ratings.feedBack.length] = `${userName}_${Rating}_${feedBack}`
                        else {
                            const newArray = existingWaiterTable.Ratings.feedBack
                            newArray.splice(0, 1)
                            newArray[newArray.length] = `${userName}_${Rating}_${feedBack}`
                        }
                        let keys = Object.keys(existingWaiterTable.Ratings.averageRatings)
                        for (let month of keys) {
                            if ((month != shortMonth) && (existingWaiterTable.Ratings.averageRatings.length != 1)) {
                                let total = 0
                                for (let star of existingWaiterTable.Ratings.averageRatings[`${month}`])
                                    total += star
                                const averageStars = total / existingWaiterTable.Ratings.averageRatings[`${month}`].length

                                const newArray = [averageStars.toFixed(2)]
                                existingWaiterTable.Ratings.averageRatings[`${month}`] = newArray
                            }
                        }
                        existingWaiterTable.markModified('Ratings');

                        const saveData = await existingWaiterTable.save()
                        if (saveData.UserName)
                            res.send("w")
                    }
                }
            }

        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ errorMessage: "Something went Wrong" });
    }


}


export default QrCodeValidator(handler);






















