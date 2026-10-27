const prisma = require("../../lib/prisma");

const getUserChats = async (req, res, next) => {
    // Make sure your Passport user object property matches your schema (e.g., req.user.id)
    const userId = req.user?.id || req.user?.userId;

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
                            select: { id: true, username: true, avatarUrl: true } // Pulls in profile details
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
    const currentUserId = req.user?.id || req.user?.userId;
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
                        user: { select: { id: true, username: true, avatarUrl: true } }
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

        res.status(201).json(newChat);
    } catch (err) {
        console.error(err);
        next(err);
    }
};
module.exports=({getUserChats,createPrivateChat})