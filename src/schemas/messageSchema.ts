import {z} from "zod"
 

export const MessageSchema = z.object({
    content:z
    .string()
    .min(10,{message:"Content must be min 10 chars"})
    .max(400,{message:"Content must be max 400 chars"})
})