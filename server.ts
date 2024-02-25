import { app } from "./app";
// import { v2 as cloudinary } from "cloudinary";
import connectDB from "./config/db";
import { cloudApiKey, cloudName, cloudApiSecret, serverPort, cloudinary } from "./secret";

cloudinary.config({
	cloud_name: cloudName,
	api_key: cloudApiKey,
	api_secret: cloudApiSecret,
});
const avatar = "./public/user-default2.jpg"


// async function uploadImage(avatar: string) {
// 	try {
// 		const imageUpload = await cloudinary.uploader.upload(avatar, {
// 			folder: "avatar",
// 			width: 150,
// 		});
// 		console.log(imageUpload);
// 		return imageUpload;
// 	} catch (error) {
// 		console.error("Error uploading image:", error);
// 		throw error; // Rethrow the error to handle it elsewhere if needed
// 	}
// }

// // Call the function asynchronously
// uploadImage(avatar)
// 	.then((result) => {
// 		// Do something with the result if needed
// 		console.log(result, "result")
// 	})
// 	.catch((error) => {
// 		console.log(error, "error")
// 		// Handle the error if needed
// 	});




app.listen(serverPort, () => {
	console.log(`server is connected with port ${serverPort}`);
	connectDB();
});
