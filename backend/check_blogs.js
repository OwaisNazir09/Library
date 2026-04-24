import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({path: './.env'});

const blogSchema = new mongoose.Schema({
  title: String,
  status: String,
  tenantId: mongoose.Schema.Types.ObjectId,
});
const Blog = mongoose.model('Blog', blogSchema);

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const blogs = await Blog.find({});
  console.log('Total blogs in DB:', blogs.length);
  console.log(blogs);
  process.exit(0);
});
