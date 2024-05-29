import {z} from "zod"
import dbConnect from "@/lib/dbConnect"
import UserModel from "@/model/User"

export async function POST(request:Request) {

    await dbConnect()


    try {
        const{username, code} = await request.json()

        console.log(username)
        const decodedUsername = decodeURIComponent(username)

        const user = await UserModel.findOne({username:decodedUsername})

        if(!user){
            return Response.json({
                success:false,
                message:"User not found"
            },
            {status:500}
        )

        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if(isCodeValid && isCodeNotExpired){
            user.isVerified = true
            await user.save()

            return Response.json(
                {
                success:true,
                message:"Account verified successfully"
            },
            {status:200}
            )
            
        } else if(!isCodeNotExpired){

            return Response.json({
                success:false,
                message:"Verifcation code has expired,Please Signup again to get new code"
            },
            {status:400}
            )
        } else{

            return Response.json({
                success:false,
                message:"Verifcation code is incorrect"
            },
            {status:400}
            )

        }





    } catch (error) {
        console.error("Error checkinhg Verification code",error)
        return Response.json(
            {
                success:false,
                message:"Error checking verificationcode"
            },
            {
                status:500
            }
        )
        
    }
    
}