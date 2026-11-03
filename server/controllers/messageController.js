const { use } = require("passport")
const prisma = require("../../lib/prisma")

const GetallMessage = async (req,res,next) => {
  const userId = req.user.id

  const user = await prisma.user.findUnique({
    where:{id:userId}
  })
  if(!user){
    return res.status(404).json({message:'User not found'})
  }
  if(user.role !== 'ADMIN'){
    return res.status(403).json({message:'forbiden'})
  }
    try{    // Find messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      select: {
        senderId:true,
        receiverId:true,
        sender: { select: { id: true, username: true, email: true, avatarUrl: true } },
        receiver: { select: { id: true, username: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Extract unique contact user objects directly
    const contactMap = new Map();
    messages.forEach((msg) => {
      const contact = msg.senderId === userId ? msg.receiver : msg.sender;
      if (contact && !contactMap.has(contact.id)) {
        contactMap.set(contact.id, contact);
      }
    });

    res.json(Array.from(contactMap.values()));}catch(error){
        console.error(error)
        next(error)
    }
}


const getConversations = async (req, res, next) => {
  try {
   const userId = req.user.id;
    // Find messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        NOT: { senderId: userId, receiverId: userId },
      },
      select: {
        senderId:true,
        receiverId:true,
        sender: { select: { id: true, username: true, email: true, avatarUrl: true } },
        receiver: { select: { id: true, username: true, email: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Extract unique contact user objects directly
    const contactMap = new Map();
   for (const msg of messages) {
  const contact = msg.senderId === userId ? msg.receiver : msg.sender;
  if (!contact || contact.id === userId) continue; // skip yourself
  if (!contactMap.has(contact.id)) {
    contactMap.set(contact.id, { ...contact, lastMessage: { /* ... */ } });
  }
}

    res.json(Array.from(contactMap.values()));
  } catch (error) {
    next(error);
  }
};
// Get all messages between logged-in user and a specific contact
const getMessagesWithUser = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const contactId = req.params.id;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: contactId },
          { senderId: contactId, receiverId: userId },
        ],
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

// Send a new message
const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { recipientId, recipient, content } = req.body;

    // Validate that content and a receiver exist
    if (!content) {
      return res.status(400).json({ message: ' content are required' });
    }

    const userSelect = { id: true, username: true, email: true, avatarUrl: true };
    let receiver = null;

    if (recipientId) {
      // FIX: Query using id: recipientId instead of just `id`
      receiver = await prisma.user.findUnique({ 
        where: { id: recipientId }, 
        select: userSelect 
      });
    } else if (recipient?.trim()) {
      const value = recipient.trim().replace(/^@/, '');
      receiver = await prisma.user.findFirst({
        where: {
          OR: [
            { username: { equals: value, mode: 'insensitive' } },
            { email: { equals: value, mode: 'insensitive' } },
          ],
        },
        select: userSelect,
      });
    }

    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (receiver.id === senderId) {
      return res.status(400).json({ message: "You can't message yourself" });
    }

    let chat = await prisma.chat.findFirst({
      where:{
        isGroup:false,
        AND:[
          {participants:{some:{userId:senderId}}},
          {participants:{some:{userId:receiver.id}}}
        ]
      }
    })

    if(!chat){
      chat = await prisma.chat.create({
        data:{
          isGroup:false,
          participants:{
            create:[
              {userId:senderId},
              {userId:receiver.id}
            ]
          }
        }
      })
    }

    const newMessage = await prisma.message.create({
      data:{
        content,
        senderId,
        chatId:chat.id
      },
      include:{sender:{select:userSelect}}
    })

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};
const getallforUser = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { id: { not: req.user.id } },
      select: { id: true, username: true, email: true },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};


const getMessagesForChat = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { id: { not: req.user.id } },
      select: { id: true, username: true, email: true },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};

const findReceiver = async (req, res, next) => {
  const { recipientId, recipientUser, content } = req.body;
  const userId = req.user.id;

  try {
    let receiver = null;

    // 1. Try by ID (UUID) first
    if (recipientId) {
      receiver = await prisma.user.findUnique({
        where: { id: recipientId },
        select: { id: true, username: true, email: true, avatarUrl: true },
      });
    }

    // 2. Try by email or username
    if (!receiver && recipientUser) {
      receiver = await prisma.user.findFirst({
        where: {
          OR: [{ email: recipientUser }, { username: recipientUser }],
        },
        select: { id: true, username: true, email: true, avatarUrl: true },
      });
    }

    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }
    res.status(200).json(receiver);
  } catch (err) {
    console.error(err);
    next(err);
  }
}; 
const testing = async (req,res,next) => {
      const body = req.body
      const params = req.params
      const user= req.user
      console.log(body)
      console.log(params)
      console.log(user)
      res.status(200).json({error:'test'})
}
module.exports= ({GetallMessage,sendMessage,getMessagesWithUser,getConversations,getallforUser,getMessagesForChat,
  testing,findReceiver
})