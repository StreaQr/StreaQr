import { connect, connections } from "mongoose";

export default async function db() {
    if (connections[0].readyState) return;
    // Using new database connection
    connect(process.env.MDB_CONNECT, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
};




