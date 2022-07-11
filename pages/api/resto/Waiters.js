import auth from "../../../middleware/auth"
import connectToDb from "../../../lib/db"
import bcrypt from "bcrypt"
import Crypto from 'crypto'
import { Expo } from 'expo-server-sdk';
import WaiterTable from "../../../lib/models/WaiterModel"
import Resto from "../../../lib/models/RestoModel";
import WaitersSchedules from "../../../lib/models/WaitersSchedules"

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

        if ((action == undefined) || (typeof (action) != "string"))
            return res.status(400).json({ errorMessage: "Invalid request" })

        let _id = req.user
        const Subscription = req.Subscription
        if (Subscription == false)
            return res.status(400).json({ errorMessage: "Not available for non premium accounts" });
        await connectToDb()
        if (action == "GetWaiterRatings") {
            const { ID } = req.body
            const existingWaiterTable = await WaiterTable.findOne({ _id: ID })
            if (existingWaiterTable.Ratings) {
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const date = new Date();
                const shortMonth = months[date.getMonth()];
                if (existingWaiterTable.Ratings.averageRatings[`${shortMonth}`] == undefined) {
                    existingWaiterTable.Ratings.averageRatings[`${shortMonth}`] = []
                    existingWaiterTable.Ratings.averageRatings[`${shortMonth}`][0] = 0
                }
                res.send(existingWaiterTable.Ratings)
            }
            else
                res.send("")
        }
        else {
            const existingWaitersSchedules = await WaitersSchedules.findOne({ RestaurantID: _id })
            if (action == "Register") {

                const { UserName, Branch, Schedule } = req.body

                if ((UserName == undefined) || (typeof (UserName) != "string") || (Branch == undefined) || (typeof (Branch) != "number"))
                    return res.status(400).json({ errorMessage: "Invalid body format" })

                let userName = UserName
                userName.replace(/\s+/g, ' ').trim();

                let existingUser = false
                const TotalWaiters = req.TotalWaiters
                let createdWaiters = 0
                if ((existingWaitersSchedules) && (existingWaitersSchedules.Waiters != undefined)) {
                    for (let branch in existingWaitersSchedules.Waiters)
                        createdWaiters += existingWaitersSchedules.Waiters[`${branch}`].length
                    if (createdWaiters >= TotalWaiters)
                        return res.status(400).json({ errorMessage: "You reached your waiters limit" })
                }
                if ((existingWaitersSchedules != undefined) && (existingWaitersSchedules.Waiters != undefined)) {
                    const branchsArray = Object.keys(existingWaitersSchedules.Waiters)
                    for (let branchs of branchsArray) {
                        for (let user of existingWaitersSchedules.Waiters[branchs]) {
                            if (user.UserName == userName.toLowerCase())
                                existingUser = true
                        }
                    }
                }

                if (existingUser)
                    return res.status(400).json({ errorMessage: "Waiter account already exists" })
                else {
                    const RestaurantName = req.RestaurantName
                    const Password = Crypto
                        .randomBytes(16)
                        .toString('base64')
                        .slice(0, 16)

                    const salt = await bcrypt.genSalt();
                    const PasswordHash = await bcrypt.hash(Password, salt);

                    let Data = { Branch }
                    if ((Schedule != undefined) && (typeof (Schedule) == "object"))
                        Data.schedule = Schedule

                    const existingResto = await Resto.findOne({ _id })
                    if ((existingResto.RestoData.RestoBranches != undefined) && (existingResto.RestoData.RestoBranches[`Branch ${Branch}`] != undefined))
                        Data.Tables = existingResto.RestoData.RestoBranches[`Branch ${Branch}`].Tables
                    else
                        Data.Tables = 50
                    const newUser = new WaiterTable({
                        RestaurantID: _id,
                        RestaurantName,
                        UserName: userName,
                        Data,
                        PasswordHash
                    });

                    const saveData = await newUser.save();    // save a new waiter account to the db 
                    if (saveData.RestaurantID) {
                        let waiterSchedule = {
                            ID: saveData._id,
                            UserName: userName,
                        }
                        if ((Schedule != undefined) && (typeof (Schedule) == "object"))
                            waiterSchedule.Schedule = Schedule

                        if (!existingWaitersSchedules) {

                            let Waiters = {}
                            Waiters[`Branch ${Branch}`] = []
                            Waiters[`Branch ${Branch}`][0] = waiterSchedule

                            const newWaitersSchedulesTable = new WaitersSchedules({
                                RestaurantID: _id,
                                RestaurantName,
                                Waiters
                            })
                            const saveData2 = await newWaitersSchedulesTable.save();
                            if (saveData2.RestaurantID) {

                                const body = {
                                    Password,
                                    "ID": saveData._id
                                }
                                res.send(body)
                            }
                        } else {
                            if (existingWaitersSchedules.Waiters == undefined)
                                existingWaitersSchedules.Waiters = {}

                            if (existingWaitersSchedules.Waiters[`Branch ${Branch}`] == undefined)
                                existingWaitersSchedules.Waiters[`Branch ${Branch}`] = []


                            existingWaitersSchedules.Waiters[`Branch ${Branch}`].push(waiterSchedule)
                            existingWaitersSchedules.markModified('Waiters');
                            const saveData2 = await existingWaitersSchedules.save()
                            if (saveData2.RestaurantName) {
                                const body = {
                                    Password,
                                    "ID": saveData._id
                                }
                                res.send(body)
                            }

                        }
                    }
                }

            } else {
                const { ID, Branch } = req.body
                if ((ID == undefined) || (typeof (ID) != "string"))
                    return res.status(400).json({ errorMessage: "Invalid body format" })
                if ((Branch == undefined) && (typeof (Branch) != "number"))
                    return res.status(400).json({ errorMessage: "Invalid body format" })


                const existingWaiterTable = await WaiterTable.findOne({ _id: ID });
                if (!existingWaiterTable)
                    return res.status(404).json({ errorMessage: "Waiter not found" })


                if (action == "Reset") {
                    for (let i = 0; i < existingWaitersSchedules.Waiters[`Branch ${Branch}`].length; i++)
                        if (existingWaitersSchedules.Waiters[`Branch ${Branch}`][i].ID == ID) {
                            delete existingWaitersSchedules.Waiters[`Branch ${Branch}`][i].PushToken
                            delete existingWaitersSchedules.Waiters[`Branch ${Branch}`][i].status
                        }

                    existingWaitersSchedules.markModified('Waiters');
                    const saveData2 = await existingWaitersSchedules.save()
                    if (saveData2.RestaurantID) {

                        const Password = Crypto
                            .randomBytes(16)
                            .toString('base64')
                            .slice(0, 16)

                        const salt = await bcrypt.genSalt();
                        const PasswordHash = await bcrypt.hash(Password, salt);
                        existingWaiterTable.PasswordHash = PasswordHash
                        existingWaiterTable.uniqueID = undefined
                        existingWaiterTable.PushToken = undefined
                        const saveData = await existingWaiterTable.save();
                        if (saveData.RestaurantID) {

                            res.send(Password)
                        }
                    }

                } else
                    if (action == "Delete") {

                        const { Branch } = req.body
                        if ((Branch == undefined) && (typeof (Branch) != "number"))
                            return res.status(400).json({ errorMessage: "Invalid body format" })

                        for (let i = 0; i < existingWaitersSchedules.Waiters[`Branch ${Branch}`].length; i++)
                            if (existingWaitersSchedules.Waiters[`Branch ${Branch}`][i].ID == ID)
                                existingWaitersSchedules.Waiters[`Branch ${Branch}`].splice(i, 1)

                        existingWaitersSchedules.markModified('Waiters');
                        const saveData = await existingWaitersSchedules.save()
                        const deleteTable = await WaiterTable.findByIdAndDelete({ _id: ID });

                        if (saveData.RestaurantID)
                            res.send("w")

                    } else
                        if (action == "Edit") {
                            const { UserName, Branch, Schedule } = req.body

                            if ((UserName == undefined) || (typeof (UserName) != "string") || (Branch == undefined) || (typeof (Branch) != "number"))
                                return res.status(400).json({ errorMessage: "Invalid body format" })

                            let userName = UserName
                            userName.replace(/\s+/g, ' ').trim();

                            if (existingWaiterTable.UserName != userName) {
                                if (existingWaitersSchedules.Waiters != undefined) {
                                    let existingUser = false

                                    const branchsArray = Object.keys(existingWaitersSchedules.Waiters)
                                    for (let branchs of branchsArray) {
                                        for (let user of existingWaitersSchedules.Waiters[branchs]) {
                                            if (user.UserName == userName.toLowerCase())
                                                existingUser = true
                                        }
                                    }
                                    if (existingUser)
                                        return res.status(400).json({ errorMessage: "UserName taken" })
                                }
                            }



                            let Data = { Branch }

                            if ((Schedule != undefined) && (typeof (Schedule) == "object")) {
                                Data.schedule = Schedule
                            } else {
                                if (existingWaiterTable.Data.schedule != undefined)
                                    Data.schedule = existingWaiterTable.Data.schedule
                            }

                            const existingResto = await Resto.findOne({ _id })
                            if ((existingResto.RestoData.RestoBranches != undefined) && (existingResto.RestoData.RestoBranches[`Branch ${Branch}`] != undefined))
                                if (existingResto.RestoData.RestoBranches[`Branch ${Branch}`].Tables != undefined)
                                    Data.Tables = existingResto.RestoData.RestoBranches[`Branch ${Branch}`].Tables
                                else
                                    Data.Tables = existingResto.RestoData.RestoBranches[`Branch ${Branch}`].Tables
                            else
                                Data.Tables = 50

                            existingWaiterTable.UserName = userName
                            existingWaiterTable.Data = Data


                            const saveData = await existingWaiterTable.save();    // save a new waiter account to the db 
                            if (saveData.RestaurantID) {

                                const branchsArray = Object.keys(existingWaitersSchedules.Waiters)
                                for (let branchs of branchsArray) {
                                    for (let index = 0; index < existingWaitersSchedules.Waiters[branchs].length; index++) {
                                        if ((existingWaitersSchedules.Waiters[branchs][index].ID == ID)) {
                                            existingWaitersSchedules.Waiters[branchs].splice(index, 1)
                                        }
                                    }
                                }
                                let waiterSchedule = {
                                    ID: saveData._id,
                                    UserName: userName,
                                }
                                if ((Schedule != undefined) && (typeof (Schedule) == "object"))
                                    waiterSchedule.Schedule = Schedule
                                else {
                                    if (existingWaiterTable.Data.schedule != undefined)
                                        waiterSchedule.Schedule = existingWaiterTable.Data.schedule
                                }

                                if (existingWaiterTable.PushToken != undefined)
                                    waiterSchedule.PushToken = existingWaiterTable.PushToken
                                if (existingWaitersSchedules.Waiters[`Branch ${Branch}`] == undefined)
                                    existingWaitersSchedules.Waiters[`Branch ${Branch}`] = []

                                existingWaitersSchedules.Waiters[`Branch ${Branch}`].push(waiterSchedule)

                                existingWaitersSchedules.markModified('Waiters');
                                const saveData2 = await existingWaitersSchedules.save();


                                if (saveData2.RestaurantName) {
                                    if (existingWaiterTable.PushToken != undefined) {
                                        let expo = new Expo({ accessToken: process.env.EXPO_ACCESS_TOKEN });
                                        let messages = [];

                                        const PushToken = "ExponentPushToken[QHFYfvM4kdjIDYZSPywVPM]"
                                        if (Expo.isExpoPushToken(PushToken)) {
                                            let title = "Your account info has been updated 📬"
                                            if (Schedule != undefined)
                                                title = "Your schedule has been changed 📬"
                                            messages.push({
                                                to: existingWaiterTable.PushToken,
                                                sound: 'default',
                                                title,
                                                body: ``,

                                            })
                                            await expo.sendPushNotificationsAsync(messages);

                                            res.send("w")
                                        }
                                    } else
                                        res.send("w")
                                }
                            }


                        }
                        else {
                            return res.status(400).json({ errorMessage: "Invalid request" })
                        }
            }
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ errorMessage: "Something went Wrong" });
    }

}
export default auth(handler);

