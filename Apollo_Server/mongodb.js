import { Schema } from "mongoose";

export const dbSchema = new Schema({
    id:String,
    title:String,
    platform:[String],
})