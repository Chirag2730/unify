import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlenghth: 8
    },
    bio:{
        type: String,
        default:""
    },
    profilePic:{
        type: String,
        default: ""
    },
    nativeLanguage: {
        type: String,
        default: ""
    },
    learningLanguage: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    otp:{
        type: String,
        default: null,
    },
    otpExpires:{
        type: Date,
        default: null,
    },
    isVerified:{
        type: Boolean,
        default: false,
    },
    isOnboarded: {
        type: Boolean,
        default: false
    },
    friends:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ]
},{timestamps: true});
// Timestamps gives field createdAt and updatedAt automatically

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // if password is not modified, skip the hashing process
    try{
        const salt=await bcrypt.genSalt(10);
        this.password=await bcrypt.hash(this.password,salt);
        next();
    }catch(error){
        next(error);
    }
});

userSchema.methods.matchPassword = async function (password) {
    // const isPasswordCorrect = await bcrypt.compare(password, this.password);
    // return isPasswordCorrect;
    return await bcrypt.compare(password, this.password);
}

const User = mongoose.model("User", userSchema);
export default User;