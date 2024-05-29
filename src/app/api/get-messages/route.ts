import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import {User} from "next-auth"
import mongoose, { mongo } from "mongoose";


export async function GET(request:Request) {
    dbConnect()

    //get session to know logged in user
    const session = await getServerSession(authOptions)
    const user: User= session?.user as User
    if(!session || !session.user){
        return Response.json(
            {
                success:false,
                message:"Not Authenticated"
            },
            {status:401}
        )
    }

    
    // const userId = user._id; //this is a string

    const userId = new mongoose.Types.ObjectId(user._id) //converts string to mongoose object type id

    try {
        const user = await UserModel.aggregate([
            {
                $match:{id:userId}
            },
            {
                $unwind:'$messages'
            },
            {
                $sort:{
                    'messages.createdAt':-1
                }
            },
            {
                $group:{
                    _id:'$_id',
                    messages:{$push :'$messages'}
                }
            }
        ])
        //user pipeline here has an array which has only ne index at first index an objet is prsent whose contents willl be _id and messages

        if(!user || user.length==0){
            return Response.json(
                {
                    success:false,
                    message:"User not found"
                },
                {status:401}
            )
        }

        return Response.json(
            {
                success:true,
                messages:user[0].messages //pipeline returns an array with one element
            },
            {status:200}
        )
        
    } catch (error) {
        console.log('Unexpected Error occured',error)
        return Response.json(
            {
            success:false,
            message:'Not Authenticated'
            },
            {
                status:500
            }
        )   
    }

}