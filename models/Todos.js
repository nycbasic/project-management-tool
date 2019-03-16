const mongoose = require("mongoose"),
  Schema = mongoose.Schema;

const todoSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  projects: [
    {
      name: {
        type: String,
        required: true
      },
      todos: [
        {
          title: {
            type: String
          },
          text: {
            type: String
          },
          completed: {
            type: Boolean
          },
          date: {
            type: Date,
            default: Date.now
          }
        }
      ],
      date: {
        type: Date,
        default: Date.now
      },
      completed: {
        type: Boolean
      }
    }
  ]
});

module.exports = mongoose.model("Todo", todoSchema);
