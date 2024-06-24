import mongoose from "mongoose";
// import bcrypt from "bcrypt";

const { Schema } = mongoose;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      maxLength: 70,
      match: /.+\@.+\..+/,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    cart: {
      type: Array,
      default: [],
    },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    // passwordChangedAt: Date,
    // passwordResetToken: String,
    // passwordResetExpires: Date,
  },

  {
    timestamps: true,
  }
);
// userSchema.pre("save", async function (next) {
// if (!this.isModified("password")) {
// next ();
// }
// const salt = await bcrypt.genSaltSync (10);
// this.password = await bcrypt.hash(this.password, salt);
// next();
// });
// userSchema.methods.isPasswordMatched = async function (enteredPassword) {
// return await bcrypt.compare(enteredPassword, this.password);
// };
// userSchema.methods.createPasswordResetToken=async function() {
//   const resettoken = crypto.randomBytes(32).toString("hex");
// this.passwordResetToken = crypto
// .createMash("sha256")
// .update (resettoken)
// .digest ("hex");
// this.passwordResetExpires = Date.now() + 30 * 60 * 1000;   /*10 mins*/
// return resettoken;
// };
const User = mongoose.model("User", userSchema);

export default User;
