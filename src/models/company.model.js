import mongoose,{model, Schema} from "mongoose";

const companySchema = new Schema({
    companyName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 2,
        maxlength: 50,
    },

    email: {
        type: String,
        required: true,
        unique: true,
    },

    password: {
        type: String,
        required: true,
    },

    industry: {
        type: String,
    },

    companySize: {
        type: Number
    },

    locations: {
        type: [String]
    },

    website: {
        type: String
    },

    bio:{
        type: String
    },

    logo: {
        type: String
    },

},
{timestamps: true}
);

const Company = model("Company", companySchema);

export default Company;