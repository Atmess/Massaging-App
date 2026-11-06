const prisma = require("../../lib/prisma");

const userSelect = { id: true, username: true, avatarUrl: true };
const getUserChats = async (req, res, next) => {
    // Make sure your Passport user object property matches your schema (e.g., req.user.id)
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized: No user found in session' });
    }

    try {
        const chats = await prisma.chat.findMany({
            where: {
                participants: {
                    some: {
                        userId // Matches the field inside your ChatParticipant model
                    }
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: userSelect // Pulls in profile details
                        }
                    }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1 // Grabs the latest message preview for your sidebar
                }
            },
            orderBy: {
                updatedAt: 'desc' // Most recent conversations on top
            }
        });

        res.status(200).json(chats);
    } catch (err) {
        console.error(err);
        next(err);
    }
};


const createPrivateChat = async (req, res, next) => {
    const currentUserId = req.user?.id;
    const { recipientId } = req.body; // The user ID of the person you want to talk to

    if (!recipientId) {
        return res.status(400).json({ error: 'Recipient ID is required.' });
    }

    if (currentUserId === recipientId) {
        return res.status(400).json({ error: 'You cannot start a chat with yourself.' });
    }

    try {
        // 1. Check if a 1-on-1 chat already exists between these two users
        const existingChat = await prisma.chat.findFirst({
            where: {
                isGroup: false,
                AND: [
                    { participants: { some: { userId: currentUserId } } },
                    { participants: { some: { userId: recipientId } } }
                ]
            },
            include: {
                participants: {
                    include: {
                        user: { select: userSelect }
                    }
                }
            }
        });

        if (existingChat) {
            return res.status(200).json(existingChat); // Return existing chat room
        }

        // 2. If it doesn't exist, create a new chat and link both users via ChatParticipant
        const newChat = await prisma.chat.create({
            data: {
                isGroup: false,
                participants: {
                    create: [
                        { userId: currentUserId },
                        { userId: recipientId }
                    ]
                }
            },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, username: true, avatarUrl: true } }
                    }
                }
            }
        });

        const otherParticipant = newChat.participants.find((p) => p.userId !== userId);

        res.status(201).json(otherParticipant);
    } catch (err) {
        console.error(err);
        next(err);
    }
};
const getChatWithUser = async (req, res, next) => {
  const userId = req.user?.id;
  const { otherUserId } = req.query;

  if (!otherUserId) {
    return res.status(400).json({ message: 'otherUserId is required' });
  }

  try {
    let chat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: otherUserId } } },
        ],
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 50,
          include: {
          sender: { select: userSelect },
          },
        },
        participants: {
          include: {
            user: { select: userSelect },
          },
        },
      },
    });

    if (!chat) {
      return res.json({ chatId: null, messages: [], otherUser: null });
    }

    const otherParticipant = chat.participants.find((p) => p.userId !== userId);

    res.json({
      chatId: chat.id,
      messages: chat.messages,
      otherUser: otherParticipant?.user || null,
    });
  } catch (err) {
    console.error(err);
    next(err);
  }
};



const findReceiver = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { recipientId } = req.body;
    const recipientUser = req.body.recipientUser?.trim();

    let receiver = null;

    if (recipientId) {
      receiver = await prisma.user.findUnique({
        where: { id: recipientId },
        select: userSelect,
      });
    }

    if (!receiver && recipientUser) {
      receiver = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: recipientUser, mode: 'insensitive' } },
            { username: { equals: recipientUser, mode: 'insensitive' } },
          ],
        },
        select: userSelect,
      });
    }

    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }
    if (receiver.id === userId) {
      return res.status(400).json({ message: "You can't chat with yourself" });
    }

    const include = {
      participants: { include: { user: { select: userSelect } } },
    };

    let chat = await prisma.chat.findFirst({
      where: {
        isGroup: false,
        AND: [
          { participants: { some: { userId } } },
          { participants: { some: { userId: receiver.id } } },
        ],
      },
      include,
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          isGroup: false,
          participants: { create: [{ userId }, { userId: receiver.id }] },
        },
        include,
      });
    }

    res.status(200).json(chat);
  } catch (err) {
    next(err);
  }
};
module.exports = ({ getUserChats, createPrivateChat, getChatWithUser ,findReceiver});