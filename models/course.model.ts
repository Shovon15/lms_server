import { Schema, Document, models, Model, model } from "mongoose";


export interface IComment extends Document {
    user: object;
    comment: string;
    comentReplies?: IComment[],
}
export interface ILink extends Document {
    title: string;
    url: string;
}
export interface IReview extends Document {
    user: object;
    rating: number;
    comment: string;
    comentReply: IComment[];
}
export interface ICourseData extends Document {
    title: string;
    description: string;
    videoUrl: string;
    // videoThumbnail: object;
    videoSection: string;
    videoLength: number;
    videoPlayer: string;
    links: ILink[];
    suggestion: string;
    question: IComment[];
}
export interface ICourse extends Document {
    name: string;
    description: string;
    price: number;
    estimatedPrice?: number;
    thumbnail: object;
    tags: string;
    level: string;
    demoVideoUrl: string;
    benefits: { title: string }[];
    prerequisites: { title: string }[];
    reviews: IReview[];
    conuseData: ICourseData[];
    ratings?: number;
    puechassed?: number;
}

const commentSchema: Schema<IComment> = new Schema({
    user: Object,
    comment: { type: String, required: true },
    comentReplies: [Object],

});

const linkSchema: Schema<ILink> = new Schema({
    title: String,
    url: String,
});

const reviewSchema: Schema<IReview> = new Schema({
    user: Object,
    rating: { type: Number, default: 0 },
    comment: String,
    comentReply: String,
});

const courseDataSchema: Schema<ICourseData> = new Schema({
    title: { type: String },
    description: { type: String },
    videoUrl: { type: String },
    // videoThumbnail: Object,
    videoSection: { type: String },
    videoLength: Number,
    videoPlayer: { type: String },
    links: [linkSchema],
    suggestion: { type: String },
    question: [commentSchema],
});

const courseSchema: Schema<ICourse> = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0,
    },
    estimatedPrice: {
        type: Number,
    },
    thumbnail: {
        public_id: {
            type: String,
            // required: true,
        },
        url: {
            type: String,
            // required: true,
        },
    },

    tags: {
        type: String,
        required: true,
    },
    level: {
        type: String,
        required: true,
    },
    demoVideoUrl: {
        type: String,
        required: true,
    },
    benefits: [{
        title: String,
    }],
    prerequisites: [{
        title: String,
    }],
    reviews: [reviewSchema],
    conuseData: [courseDataSchema],
    ratings: {
        type: Number,
        default: 0,
    },
    puechassed: {
        type: Number,
        default: 0,
    },
});

// const UserModel = model<IUser>('Users', userSchema);
// const UserModel = models.Users || model<IUser>('Users', userSchema);
// const UserModel =  Model<IUser> = mongoose.model("users", userSchema)

const courseModel: Model<ICourse> = (models.courses || model<ICourse>('Courses', courseSchema)) as Model<ICourse>;


// const courseModel: Model<ICourse> = (models.courses || model<ICourse>("course", courseSchema)) as Model<ICourse>;
export default courseModel;