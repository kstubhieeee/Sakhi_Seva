import mongoose, { Document, Schema } from 'mongoose'

export interface IChatMessage {
  role: 'user' | 'model'
  content: string
  citations?: Array<{ title: string; url: string; index: number }>
  structuredData?: {
    header: string
    intro: string
    youtubeVideos?: Array<{ title: string; link: string; summary: string }>
    resources?: Array<{
      type: 'article' | 'blog'
      title: string
      link: string
      summary: string
      image?: string
    }>
  }
}

export interface IChat extends Document {
  userId: string
  title: string
  messages: IChatMessage[]
  createdAt: Date
  updatedAt: Date
}

const ChatMessageSchema = new Schema<IChatMessage>({
  role: {
    type: String,
    enum: ['user', 'model'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  citations: [{
    title: String,
    url: String,
    index: Number
  }],
  structuredData: {
    header: String,
    intro: String,
    youtubeVideos: [{
      title: String,
      link: String,
      summary: String
    }],
    resources: [{
      type: {
        type: String,
        enum: ['article', 'blog']
      },
      title: String,
      link: String,
      summary: String,
      image: String
    }]
  }
}, { _id: false })

const ChatSchema = new Schema<IChat>({
  userId: {
    type: String,
    required: [true, 'User ID is required'],
    index: true
  },
  title: {
    type: String,
    required: [true, 'Chat title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  messages: {
    type: [ChatMessageSchema],
    default: []
  }
}, {
  timestamps: true
})

ChatSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.models.Chat || mongoose.model<IChat>('Chat', ChatSchema)

