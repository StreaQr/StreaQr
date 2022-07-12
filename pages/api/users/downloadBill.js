// import the necessary libraries
import fs from 'fs';
import puppeteer from 'puppeteer';
import handlers from 'handlebars';
import QrCodeValidator from "../../../middleware/QrCodeValidator"
import ReceiptTable from "../../../lib/models/ReceiptsModel"
import connectToDb from "../../../lib/db"
import rateLimit from "../../../lib/helpers/rate-limiter"

const limiter = rateLimit({
    interval: 60 * 1000, // 60 seconds
    uniqueTokenPerInterval: 10000, // Max 10000 users per second
})



const handler = async (req, res) => {
    try {
        await limiter.check(res, 4, 'CACHE_TOKEN')
        try {
            const { RestaurantName } = req.body
            await connectToDb()
            const existingReceiptTable = await ReceiptTable.findOne({ RestaurantName })
            const code = req.Code
            const Branch = req.Branch

            if ((!existingReceiptTable) || (existingReceiptTable.Receipts == undefined) || (existingReceiptTable.Receipts[code] == undefined))
                return res.status(400).json({ errorMessage: "bill was not found" });


            // read our invoice-template.html file using node fs module
            const file = fs.readFileSync('../../../receipt.html', 'utf8');

            // compile the file with handlebars and inject the customerName variable
            const template = handlers.compile(`${file}`);

            const html = template({
                // receiptID: data.Receipts,
                Table: existingReceiptTable.Receipts[code].Table,
                Guests: existingReceiptTable.Receipts[code].Guests,
                item: existingReceiptTable.Receipts[code].Orders,
                restaurantName: RestaurantName,
                total: `${existingReceiptTable.Currency} ${existingReceiptTable.Receipts[code].Total}`,
                address: existingReceiptTable.Addresses[`Branch ${Branch}`].address,
                Date: existingReceiptTable.Receipts[code].date,
                Waiter: existingReceiptTable.Receipts[code].WaiterName
            });

            // simulate a chrome browser with puppeteer and navigate to a new page
            const browser = await puppeteer.launch();
            const page = await browser.newPage();

            // set our compiled html template as the pages content
            // then waitUntil the network is idle to make sure the content has been loaded
            await page.setContent(html, { waitUntil: 'networkidle0' });

            // convert the page to pdf with the .pdf() method
            const pdf = await page.pdf({ format: 'A5' });
            await browser.close();

            // send the result to the client
            res.statusCode = 200;
            res.send(pdf);
        } catch (err) {
            console.log("HERR")
            console.error(err);
            return res.status(500).json({ errorMessage: "Something went Wrong" });
        }
    }
    catch {
        return res.status(400).json({ errorMessage: "To many requests" });
    }
}

export default QrCodeValidator(handler);
