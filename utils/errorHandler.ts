class CustomErrorHandler extends Error {
    statusCode: number;
    success: boolean;
    errors: any[];
    data: any;

    constructor(
        statusCode: number,
        message: string = "something went wrong",
        errors: any[] = [],
        stack: string = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.success = false;
        this.errors = errors;

        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}
// class CustomError extends Error {
//     statusCode: number; // Corrected the property name and type

//     constructor(statusCode: number, message: string) {
//         super(message);
//         this.statusCode = statusCode;

//         // Capture the stack trace for this custom error
//         Error.captureStackTrace(this, this.constructor);
//     }
// }

export default CustomErrorHandler;



// // Example usage
// try {
//     // Some operation that might throw CustomError
//     throw new CustomError(404, "Resource not found", ["Invalid ID"]);
// } catch (error) {
//     if (error instanceof CustomError) {
//         console.log("Custom Error caught:");
//         console.log("Status Code:", error.statusCode);
//         console.log("Message:", error.message);
//         console.log("Errors:", error.errors);
//     } else {
//         // Handle other types of errors
//         console.error("Unexpected error:", error);
//     }
// }



