
export interface User {
    id: string;
    name: string;
    handle: string;
    avatar: string;
}

export interface Message {
    id: string;
    content: string;
    senderId: string;
    timestamp: string;
    isRead: boolean;
}

export interface Conversation {
    id: string;
    participants: User[];
    lastMessage: Message;
    unreadCount: number;
}

export const MOCK_MUTUALS: User[] = [
    {
        id: "isabella",
        name: "Isabella Rossi",
        handle: "bella.rossi",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=faces"
    },
    {
        id: "julian",
        name: "Julian Cole",
        handle: "jcole_nyc",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=faces"
    },
    {
        id: "maya",
        name: "Maya Brooks",
        handle: "mayabrooks",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=faces"
    },
    {
        id: "liam",
        name: "Liam Carter",
        handle: "liam.carter",
        avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=faces"
    },
    {
        id: "sophie",
        name: "Sophie Chen",
        handle: "sophie.c",
        avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=faces"
    },
    {
        id: "lucas",
        name: "Lucas Silva",
        handle: "lucas.silva",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=faces"
    },
    {
        id: "emma",
        name: "Emma Davis",
        handle: "emmad",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=faces"
    }
];

export const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: "c1",
        participants: [MOCK_MUTUALS[0]],
        lastMessage: {
            id: "m1",
            content: "Seen 15h ago",
            senderId: "suminwalker",
            timestamp: "15h ago",
            isRead: true
        },
        unreadCount: 0
    },
    {
        id: "c2",
        participants: [MOCK_MUTUALS[1]],
        lastMessage: {
            id: "m2",
            content: "Sent Friday",
            senderId: "suminwalker",
            timestamp: "Friday",
            isRead: true
        },
        unreadCount: 0
    },
    {
        id: "c3",
        participants: [MOCK_MUTUALS[2]],
        lastMessage: {
            id: "m3",
            content: "Have you been to that new spot in SoHo?",
            senderId: "maya",
            timestamp: "Friday",
            isRead: false
        },
        unreadCount: 1
    },
    {
        id: "c4",
        participants: [MOCK_MUTUALS[3]],
        lastMessage: {
            id: "m4",
            content: "Sent Friday",
            senderId: "suminwalker",
            timestamp: "Friday",
            isRead: true
        },
        unreadCount: 0
    },
    {
        id: "c5",
        participants: [MOCK_MUTUALS[4]],
        lastMessage: {
            id: "m5",
            content: "Sent a message · 1w",
            senderId: "suminwalker",
            timestamp: "1w",
            isRead: true
        },
        unreadCount: 0
    }
];
