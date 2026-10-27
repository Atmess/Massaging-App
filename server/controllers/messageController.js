const prisma = require("../../lib/prisma")

const GetallMessage = async (req,res,next) => {
  const userId = parseInt(req.user.userId ,10)

  const user = await prisma.user.findUnique({
    where:{id:userId}
  })
  if(!user){
    return res.status(404).json({message:'User not found'})
  }
  if(user.role !== 'ADMIN'){
    return res.status(403).json({message:'forbiden'})
  }
    if (Number.isNaN(userId)) {
  return res.status(400).json({ message: 'Invalid user id' });
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
   const userId = parseInt(req.user.userId, 10);
  if (Number.isNaN(userId)) {
  return res.status(400).json({ message: 'Invalid user id' });
}
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
    const userId = req.user.userId;
    const contactId = parseInt(req.params.id,10);

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
    const senderId = req.user.userId;
    const { receiverId,recipient, content } = req.body; //receiver (ID) or recipient (email or username)

    if (!content) {
      return res.status(400).json({ message: 'Receiver and content are required' });
    }
    const userSelect = { id: true, username: true, email: true, avatarUrl: true };
    let receiver = null;
    if(receiverId){
      const id= parseInt(receiverId,10)
      if(Number.isNaN(id)){
        return res.status(400).json({ message: 'Invalid receiver id' });
      }
      receiver = await prisma.user.findUnique({where: { id }, select: userSelect})
    }else if(recipient?.trim()){
      const value = recipient.trim().replace(/^@/, '');
      receiver = await prisma.user.findFirst({
          where: {
            OR: [
              { username: { equals: value, mode: 'insensitive' } },
              { email: { equals: value, mode: 'insensitive' } },
            ],
          },
          select: userSelect,
      })
    } else{
      return res.status(400).json({ message: 'Receiver is required' });
    }
    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (receiver.id === senderId) {
      return res.status(400).json({ message: "You can't message yourself" });
    }
    const newMessage = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId: receiver.id,
      },
       include: { receiver: { select: userSelect } },
    });

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};

const getallforUser = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { id: { not: req.user.userId } },
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
      where: { id: { not: req.user.userId } },
      select: { id: true, username: true, email: true },
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};
module.exports= ({GetallMessage,sendMessage,getMessagesWithUser,getConversations,getallforUser,getMessagesForChat})