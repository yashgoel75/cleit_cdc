import mongoose from "mongoose";
const { Schema } = mongoose;

const user = new Schema({
    name: String,
    username: String,
    collegeEmail: String,
    personalEmail: String,
    enrollmentNumber: Number,
    phone: Number,
    branch: String,
    tenthPercentage: Number,
    twelfthPercentage: Number,
    collegeGPA: Number,
    batchStart: Number,
    batchEnd: Number,
    linkedin: String,
    github: String,
    leetcode: String,
    resume: String,
    status: String,
    wishlist: [{ societyUsername: String }],
    reminders: [{ societyUsername: String }],
});

const User = mongoose.models.User || mongoose.model("User", user);

export { User };