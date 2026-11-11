const prisma = require("../lib/prisma")

const userSelect = { id: true, username: true, name: true, email: true, avatarUrl: true } // <-- add name


const GetallMessage = async (req,res,next) => {
  const userId = req.user?.id

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
        sender: { select: userSelect },
        receiver: { select: userSelect },
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
   const userId = req.user?.id;
    // Find messages where user is sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        NOT: { senderId: userId, receiverId: userId },
      },
      select: {
        senderId:true,
        receiverId:true,
        sender: { select: userSelect},
        receiver: { select: userSelect },
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
    const userId = req.user?.id;
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
    const senderId = req.user?.id;
    const { chatId } = req.body;
    const content = req.body.content?.trim();

    if (!senderId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    if (!chatId || !content) {
      return res.status(400).json({ message: 'chatId and content are required' });
    }

    const participant = await prisma.chatParticipant.findFirst({
      where: { chatId, userId: senderId },
    });
    if (!participant) {
      return res.status(403).json({ message: 'You are not part of this chat' });
    }

    const newMessage = await prisma.message.create({
      data: { content, senderId, chatId },
      include: { sender: { select: userSelect } },
    });

    // push to everyone who joined this chat's room
    req.app.get('io').to(chatId).emit('newMessage', newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    next(error);
  }
};


const getallforUser = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { id: { not: req.user?.id } },
      select: userSelect,
    });
    res.json(users);
  } catch (err) {
    next(err);
  }
};


const getChatMessages = async (req, res, next) => {
    const userId = req.user.id;
    const { chatId } = req.params;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        // Make sure this user actually belongs to the chat
        const participant = await prisma.chatParticipant.findFirst({
            where: { chatId, userId }
        });

        if (!participant) {
            return res.status(403).json({ error: 'You are not part of this chat' });
        }

        const messages = await prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: 'asc' },
            include: {
                sender: { select: userSelect }
            }
        });

        res.status(200).json(messages);
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
module.exports= ({GetallMessage,sendMessage,getMessagesWithUser,getConversations,getallforUser,getChatMessages,
  testing,
})