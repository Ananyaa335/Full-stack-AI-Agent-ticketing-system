import { inngest } from "../client.js";
import Ticket from "../../models/ticket.js";
import User from "../../models/user.js";
import { NonRetriableError } from "inngest";
import {sendMail} from "../../libs/mailer.js";
import analyzeTicket from "../../libs/ticket-ai.js";

export const onTicketCreated=inngest.createFunction(
     { id: "on-ticket-created",retries:2},
     { event: "ticket/created" },
     async({event,step})=>{
        try {
            const {ticketId}=event.data
            //fetch data from DB
            const ticket=await step.run("fetch-ticket",async()=>{
                const ticketObject=await Ticket.findById(ticketId)
                if(!ticketObject){
                    throw new NonRetriableError("Ticket not found")
            }
                return ticketObject
            
            })
            await step.run("update-ticket-status",async()=>{
                await Ticket.findByIdAndUpdate(ticket._id,{
                    status:"TODO"})

            })
            const aiResponse= await analyzeTicket(ticket)
            const relatedskills= await step.run("ai-processing",async()=>{
                let skills=[]
                if (aiResponse){
                    await Ticket.findByIdAndUpdate(ticket._id,{
                        priority:!["low","medium","high"].includes(aiResponse.priority)? "medium":aiResponse.priority,
                        helpfulNotes:aiResponse.helpfulNotes,
                        status:"IN_PROGRESS",
                        relatedSkills:aiResponse.relatedSkills
                    })
                    skills=aiResponse.relatedSkills
                }
                return skills;

            });
            const moderator = await step.run("assign-moderator",async()=>{
                let user =await User.findOne({
                    role:"moderator",
                    skills:{
                        $elemMatch:{
                            $regex:relatedskills.join("|"),
                            $options:"i",
                        },
                    },
                });
                if(!user){
                    user=await User.findOne({
                        role:"admin"
                    })
                }
                await Ticket.findByIdAndUpdate(ticket._id,{
                    assignedTo:user?._id || null
                })
                return user
            });
            await step.run("send-email-notification",async()=>{
                if(moderator){
                    console.log(`📧 Sending mail to moderator: ${moderator.email}`);
                    const finalTicket = await Ticket.findById(ticket._id)
                    try {
                        await sendMail(
                            moderator.email,
                            "Ticket Assigned",
                            `A new ticket is assigned to you${finalTicket.title}`
                        )
                        console.log("✅ Email sent successfully.");
                    } catch(err) {
                        console.error("❌ Error sending email:", err.message);
                    }
                } else{
                    console.log("⚠️ No moderator found, skipping mail send.");
                }  
            })
            return {success:true}

        } catch (error) {
            console.error("❌Error running the step", error.message)
            return{success:false}
            
        }
     }
)