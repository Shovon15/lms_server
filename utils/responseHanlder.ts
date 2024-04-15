class ResponseHandler {
    statusCode: number;
    success: boolean;
    message: string;
    payload: any;

    constructor(statusCode: number, payload: any, message: string) {
        this.statusCode = statusCode;
        this.success = statusCode >= 200 && statusCode < 400;
        this.message = message;
        this.payload = payload;
    }
}

export default ResponseHandler;

// // Example usage
// const response = new ResponseHandler(200, { key: 'value' }, 'Success');
// console.log('Status Code:', response.statusCode);
// console.log('Data:', response.data);
// console.log('Message:', response.message);
// console.log('Success:', response.success);
