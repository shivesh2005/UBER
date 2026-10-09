const model = require("../models/user.model");
module.exports.createUSer = async({
  firstName , lastName , email , password
}) => {
  if(!firstName || !email || !password ) {
    throw new Error('All fields are required');
  }

const user = userModel.create({
   fullname: {
    firstName,
    lastName
   },
   email,
   password
})
return user;
}