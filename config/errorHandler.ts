class CustomError extends Error {
    statusCode: number; // Corrected the property name and type

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;

        // Capture the stack trace for this custom error
        Error.captureStackTrace(this, this.constructor);
    }
}

export default CustomError;


// Example usage
// try {
//     throw new CustomError('This is a custom error');
// } catch (error) {
//     console.error(error.stack);
// }
