const mongoose = require("mongoose");

mongoose.connect(process.env.Mongodb_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

const communitySchema = new mongoose.Schema({
  _id: {
    type: String,
  },
  name: {
    type: String,
    maxLength: 128,
  },
  slug: {
    type: String,
    maxLength: 255,
    unique: true,
  },
  owner: {
    type: String, 
  },
  created_at: {
    type: Date,
  },
  updated_at: {
    type: Date,
  },
});

const Community = mongoose.model("Community", communitySchema);

module.exports = Community;