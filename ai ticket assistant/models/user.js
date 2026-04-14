import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    email:{type:String, required:true,unique: true},
    password:{type:String, required: true},
    role:{type:String,default:"user",enum:["user","moderator","admin"]},
    skills:[String],
    createdAt:{type: Date,default:Date.now},
});

userSchema.index({ email: 1 }, { unique: true });  // fast login lookup
userSchema.index({ role: 1 });                     // filter admins/moderators
userSchema.index({ skills: 1 });                   // search users by skill
export default mongoose.model("User",userSchema);
