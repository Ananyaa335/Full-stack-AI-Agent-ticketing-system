import mongoose from "mongoose";
const ticketSchema = new mongoose.Schema({
    title:String,
    description:String,
    status:{type:String,default:"TODO"},
    createdBy:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    assignedTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:null
    },
    priority:String,
    deadline: Date,
    helpfulNotes:String,
    relatedSkills:[String],
    createdAt:{type:Date,default:Date.now},
});

//indexes here
ticketSchema.index({ createdBy: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ createdAt: -1 });
export default mongoose.model("Ticket",ticketSchema);
