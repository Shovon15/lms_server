import mongoose from "mongoose";
import { mongoDbUrl } from "../secret";

const connectDB = async (options = {}) => {
    try {
        await mongoose.connect(mongoDbUrl, options);
        console.log(`DB connect successfully!!! `);

        mongoose.connection.on("error", (error: Error) => {
            console.error("DB connection error", error);
        });
    } catch (error: any) {
        console.error("Could not connect to DB", error.toString());
        setTimeout(connectDB, 5000)
    }
};
export default connectDB;

// import mongoose from "mongoose";
// import { mongoDbUrl } from "../secret";


// const connectDB = async () => {
//     try {
//         await mongoose.connect(mongoDbUrl).then((data) => {
//             console.log(`DB connect successful with ${data.connection.host}`);
//         })

//         mongoose.connection.on("error", (error) => {
//             console.error("DB connection error", error);
//         });
//     } catch (error) {
//         console.error("Could not connect to DB", error.toString());
//         setTimeout(connectDB, 5000)
//     }
// };
// export default connectDB;
