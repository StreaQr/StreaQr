import auth from "../../../middleware/auth"
import Resto from '../../../lib/models/RestoModel';
import connectToDb from "../../../lib/db"
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '20mb',
        },
    },
}


const handler = async (req, res) => {
    try {
        const { method } = req;
        if (method !== "POST") {
            return res.status(401).json({ errorMessage: "Only POST is allowed", });
        }
        const reqAuth = req.headers["x-auth-token"];
        if (reqAuth !== process.env.X_AUTH_TOKEN)
            return res.status(401).json({ errorMessage: "Unauthorized" });

        const { data } = req.body
        const Subscription = req.Subscription
        const _id = req.user
        await connectToDb()
        const existingUser = await Resto.findOne({ _id });
        let restoName = existingUser.RestaurantName
        let ImageData = data
        for (let x in ImageData) {
            for (let i = 0; i < ImageData[x].length; i++) {
                let r = ""
                for (let xc = 0; xc < 10; xc++)
                    r += ImageData[x][i][xc]
                if (r == "data:image") {
                    if (Subscription == false)
                        return res.status(401).json({ errorMessage: "can't upload images on non premium accounts" });
                    else {
                        const uploadResponse = await cloudinary.uploader.upload(ImageData[x][i], {
                            upload_preset: 'dev_setups',
                            folder: `${restoName}`
                        });
                        ImageData[x][i] = uploadResponse.secure_url
                    }
                }

            }
        }


        if (existingUser.Menu == undefined) {
            existingUser.Menu = ImageData
            const saveData = await existingUser.save();
            if (saveData.Email) {
                res.send('w')
            }
        } else {
            let oldItems = []
            let newItems = []
            for (let x in ImageData) {
                for (let y of ImageData[x]) {
                    newItems[newItems.length] = y
                }
            }
            for (let x in existingUser.Menu) {
                for (let y of existingUser.Menu[x]) {
                    oldItems[oldItems.length] = y
                }
            }
            for (let x = 0; x < oldItems.length; x++) {
                for (let i of newItems) {
                    if (oldItems[x] == i)
                        oldItems.splice(x, 1)
                }
            }

            for (let url of oldItems) {
                if (typeof (url) != "object") {
                    const splitsArray = url.split("/")
                    const Text = splitsArray[splitsArray.length - 2] + "/" + splitsArray[splitsArray.length - 1]
                    const ID = Text.split(".")
                    cloudinary.uploader.destroy(ID[0], function (result, error) {
                        if (error) {
                            console.error(error)
                        }
                    });
                }
            }
            existingUser.Menu = ImageData
            const saveData = await existingUser.save();
            if (saveData.Email) {
                res.send('w')
            }

        }


    } catch (err) {
        console.error(err);
        return res.status(500).json({ errorMessage: "Something went Wrong" });
    }

}
export default auth(handler);

